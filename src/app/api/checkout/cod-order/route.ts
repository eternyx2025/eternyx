import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import { discountService } from '@/services/discountService';
import { inventoryService } from '@/services/inventoryService';
import { emailService } from '@/services/emailService';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, address, items, discountCode, total } = body;

    // 1. Validation
    if (!email || !name || !address || !items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Missing required checkout fields' }, { status: 400 });
    }

    if (!address.street || !address.city || !address.zip) {
      return Response.json({ error: 'Please provide a complete shipping address (street, city, and pincode).' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanPhone = phone ? String(phone).trim() : '';

    // 2. Process / Ensure Customer Profile
    const customer = await customerService.createOrUpdate(cleanEmail, cleanName, 0, cleanPhone);
    if (!customer) {
      return Response.json({ error: 'Failed to process customer profile' }, { status: 500 });
    }

    // 3. Create the COD Order in MySQL
    const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
    const localOrder = await orderService.create({
      id: orderId,
      customer_id: customer.id,
      customer_name: cleanName,
      customer_email: cleanEmail,
      total: Number(total),
      status: 'Processing',
      payment_status: 'Pending',
      payment_method: 'COD',
      items,
      shipping_address: address,
      discount_code: discountCode || null,
    });

    if (!localOrder) {
      return Response.json({ error: 'Failed to create database order record' }, { status: 500 });
    }

    // 4. Decrement inventory for purchased products
    try {
      await inventoryService.deductStock(items);
    } catch (invErr) {
      console.error('[Inventory Deduction Warning]:', invErr);
    }

    // 5. Increment coupon usage if discount was applied
    if (discountCode) {
      try {
        await discountService.incrementUsage(discountCode);
      } catch (discErr) {
        console.error('[Discount Increment Warning]:', discErr);
      }
    }

    // 6. Automatically book courier with iCarry Logistics (flagged as COD)
    try {
      const { icarryService } = await import('@/services/icarryService');
      let defaultWeight = 0;
      items.forEach((item: any) => {
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
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || '9876543210',
        address: address.street || '',
        city: address.city || '',
        zip: address.zip || '',
        state: address.state || '',
      };

      const bookingResult = await icarryService.bookShipment(
        orderId,
        recipient,
        defaultWeight || 250,
        'S', // Surface logistics
        undefined,
        undefined,
        Number(total),
        true // isCod: true
      );

      if (bookingResult.success && bookingResult.tracking_id) {
        await orderService.updateShippingInfo(
          orderId,
          bookingResult.carrier,
          bookingResult.tracking_id,
          bookingResult.label_url,
          bookingResult.cost
        );
      } else {
        console.warn(`[Auto-Booking iCarry COD Shipment Warning for ${orderId}]:`, bookingResult.error);
      }
    } catch (shipErr) {
      console.error('[Auto-Booking iCarry COD Shipment Error]:', shipErr);
    }

    // 7. Dispatch Luxury Order Confirmation Email (highlighting Cash on Delivery)
    try {
      await emailService.sendOrderConfirmationEmail({
        id: orderId,
        customer_name: cleanName,
        customer_email: cleanEmail,
        total: Number(total),
        payment_method: 'COD',
        items,
        shipping_address: address,
      });
    } catch (mailErr) {
      console.error('[COD Confirmation Email Warning]:', mailErr);
    }

    return Response.json({
      success: true,
      order_id: orderId,
      payment_method: 'COD',
      message: 'Cash on Delivery order placed successfully.',
    });
  } catch (error: any) {
    console.error('Create COD order error:', error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
