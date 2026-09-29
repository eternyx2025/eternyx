import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import { discountService } from '@/services/discountService';
import { inventoryService } from '@/services/inventoryService';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, local_order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: 'Missing required Razorpay validation parameters' }, { status: 400 });
    }

    // 1. Verify payment signature integrity
    // Signature pattern: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecretkeyid456';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isVerified = generatedSignature === razorpay_signature;

    // Fetch order references
    const order = local_order_id 
      ? await orderService.getById(local_order_id) 
      : await orderService.getByRazorpayOrderId(razorpay_order_id);

    if (!order) {
      return Response.json({ error: 'Matching database order record not found' }, { status: 404 });
    }

    if (!isVerified) {
      // Record failed payment status to database
      await orderService.confirmPayment(order.id, 'Failed', {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });
      return Response.json({ error: 'Payment signature validation failed (possible tampering)' }, { status: 400 });
    }

    // 2. Success: Update order payment properties in MySQL
    await orderService.confirmPayment(order.id, 'Paid', {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // 3. Post-Payment Fulfillment logic
    // A. Increment customer lifetime spent
    if (order.customer_email) {
      await customerService.createOrUpdate(order.customer_email, order.customer_name || 'Verified Customer', order.total);
    }

    // B. Record discount coupon usage
    if (order.discount_code) {
      await discountService.incrementUsage(order.discount_code);
    }

    // C. Automatically decrement inventory for purchased scent sizes
    if (Array.isArray(order.items) && order.items.length > 0) {
      await inventoryService.deductStock(order.items);
    }

    // D. Automatically book courier shipment with iCarry Logistics
    try {
      const { icarryService } = await import('@/services/icarryService');
      let phone = '9876543210';
      if (order.customer_id) {
        const customer = await customerService.getById(order.customer_id);
        if (customer?.phone) phone = customer.phone;
      } else if (order.customer_email) {
        const customer = await customerService.getByEmail(order.customer_email);
        if (customer?.phone) phone = customer.phone;
      }

      // Calculate weight based on ordered fragrances
      let defaultWeight = 0;
      order.items?.forEach((item: any) => {
        const qty = item.quantity || 1;
        const sizeLower = (item.size || '').toLowerCase();
        if (sizeLower.includes('100ml') || sizeLower.includes('100 ml')) {
          defaultWeight += 250 * qty;
        } else if (sizeLower.includes('50ml') || sizeLower.includes('50 ml')) {
          defaultWeight += 150 * qty;
        } else {
          defaultWeight += 200 * qty;
        }
      });

      const recipient = {
        name: order.customer_name || 'Customer',
        email: order.customer_email || 'customer@example.com',
        phone,
        address: order.shipping_address?.street || '',
        city: order.shipping_address?.city || '',
        zip: order.shipping_address?.zip || '',
        state: order.shipping_address?.state || '',
      };

      const bookingResult = await icarryService.bookShipment(
        order.id,
        recipient,
        defaultWeight || 250,
        'S', // Surface logistics (best for perfumes & liquids in India)
        undefined,
        undefined,
        Number(order.total)
      );

      if (bookingResult.success && bookingResult.tracking_id) {
        await orderService.updateShippingInfo(
          order.id,
          bookingResult.carrier,
          bookingResult.tracking_id,
          bookingResult.label_url,
          bookingResult.cost
        );
      } else {
        console.warn(`[Auto-Booking iCarry Shipment Warning for order ${order.id}]:`, bookingResult.error);
      }
    } catch (shipErr) {
      console.error('[Auto-Booking iCarry Shipment Error]:', shipErr);
    }

    return Response.json({ success: true, order_id: order.id });
  } catch (error) {
    console.error('Verify payment signature error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
