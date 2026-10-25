import { NextRequest, NextResponse } from 'next/server';
import { icarryService } from '@/services/icarryService';
import { orderService } from '@/services/orderService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('query') || searchParams.get('tracking_id') || searchParams.get('order_id');

    if (!rawQuery) {
      return NextResponse.json(
        { error: 'Tracking number (AWB) or Order ID is required' },
        { status: 400 }
      );
    }

    const cleanQuery = rawQuery.trim();
    let trackingId = cleanQuery;
    let orderInfo: any = null;

    // Check if query is an Order ID (starts with ORD- or matches local order)
    if (cleanQuery.toUpperCase().startsWith('ORD') || cleanQuery.length <= 16) {
      const order = await orderService.getById(cleanQuery);
      if (order) {
        orderInfo = {
          orderId: order.id,
          date: order.date,
          status: order.status,
          carrier: order.shipping_carrier || 'iCarry Courier Partner',
          destinationCity: order.shipping_address?.city || '',
          destinationZip: order.shipping_address?.zip || '',
          itemsCount: (order.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 1,
        };
        if (order.shipping_tracking_id) {
          trackingId = order.shipping_tracking_id;
        }
      }
    }

    // Fetch tracking checkpoints from iCarry
    const tracking = await icarryService.trackShipment(trackingId);

    // Auto-sync status to database in background
    if (tracking?.status) {
      const synced = await orderService.syncDeliveryStatus(cleanQuery, tracking.status);
      if (synced && orderInfo) {
        orderInfo.status = synced;
      }
    }

    return NextResponse.json({
      success: true,
      trackingId,
      carrier: orderInfo?.carrier || 'iCarry Courier Partner',
      order: orderInfo,
      tracking,
    });
  } catch (error: any) {
    console.error('Public track API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve tracking information' }, { status: 500 });
  }
}
