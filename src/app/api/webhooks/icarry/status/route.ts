import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[iCarry Status Webhook Received]:', payload);

    const orderId = payload.order_id || payload.order_reference_id || payload.reference_id;
    const newStatus = payload.status || payload.shipment_status || payload.current_status;
    const trackingId = payload.tracking_id || payload.awb || payload.awb_number || payload.waybill;

    if ((orderId || trackingId) && newStatus) {
      let orderStatus = 'Processing';
      const s = String(newStatus).toLowerCase();
      
      if (s.includes('out for delivery') || s.includes('out for')) {
        orderStatus = 'Out for Delivery';
      } else if (s.includes('deliver') || s.includes('completed')) {
        orderStatus = 'Delivered';
      } else if (
        s.includes('transit') ||
        s.includes('shipped') ||
        s.includes('dispatch') ||
        s.includes('pickup') ||
        s.includes('picked up') ||
        s.includes('manifest') ||
        s.includes('in-transit')
      ) {
        orderStatus = 'Shipped';
      } else if (s.includes('rto') || s.includes('return') || s.includes('cancel')) {
        orderStatus = 'Cancelled';
      }

      try {
        const updateResult = await query<any>(
          `UPDATE orders 
           SET status = ?, 
               shipping_tracking_id = COALESCE(?, shipping_tracking_id) 
           WHERE id = ? OR (shipping_tracking_id = ? AND shipping_tracking_id IS NOT NULL AND shipping_tracking_id != '')`,
          [orderStatus, trackingId || null, orderId || '', trackingId || '']
        );
        console.log(`[iCarry Status Webhook] Order status updated to '${orderStatus}' for orderId: ${orderId}, trackingId: ${trackingId}, affected: ${updateResult.affectedRows || 0}`);
      } catch (dbErr) {
        console.error('[iCarry Webhook DB Update Error]:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Status processed successfully',
      receivedAt: new Date().toISOString()
    }, { status: 200 });
  } catch (error: any) {
    console.error('[iCarry Status Webhook Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Active', endpoint: 'iCarry Shipment Status Webhook' });
}
