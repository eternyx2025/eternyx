import { NextRequest, NextResponse } from 'next/server';
import { icarryService } from '@/services/icarryService';
import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { orderId, weightGrams, shipmentMode, courierId, courierName } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await orderService.getById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Retrieve recipient phone details from customer database profile
    let phone = '9876543210';
    if (order.customer_id) {
      const customer = await customerService.getById(order.customer_id);
      if (customer && customer.phone) {
        phone = customer.phone;
      }
    } else if (order.customer_email) {
      const customer = await customerService.getByEmail(order.customer_email);
      if (customer && customer.phone) {
        phone = customer.phone;
      }
    }

    const recipient = {
      name: order.customer_name || 'Customer',
      email: order.customer_email || 'customer@example.com',
      phone,
      address: order.shipping_address.street || '',
      city: order.shipping_address.city || '',
      zip: order.shipping_address.zip || '',
      state: order.shipping_address.state || '',
    };

    const finalWeight = weightGrams || 250;
    const mode = shipmentMode || 'S'; // Surface is standard for perfumes

    // Call iCarry service to execute the booking
    const result = await icarryService.bookShipment(
      order.id,
      recipient,
      finalWeight,
      mode,
      courierId,
      courierName,
      Number(order.total)
    );

    if (result.success) {
      // Persist shipping information and transition order status to 'Shipped'
      await orderService.updateShippingInfo(
        order.id,
        result.carrier,
        result.tracking_id,
        result.label_url,
        result.cost
      );

      return NextResponse.json({
        success: true,
        booking: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Logistics booking failed',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('iCarry Booking API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
