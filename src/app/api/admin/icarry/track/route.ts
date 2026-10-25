import { NextRequest, NextResponse } from 'next/server';
import { icarryService } from '@/services/icarryService';
import { orderService } from '@/services/orderService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('tracking_id');
    const orderId = searchParams.get('order_id');

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID (AWB) is required' }, { status: 400 });
    }

    const tracking = await icarryService.trackShipment(trackingId);

    // Auto-sync status to database if courier reported status
    let syncedStatus = '';
    if (tracking?.status) {
      syncedStatus = await orderService.syncDeliveryStatus(orderId || trackingId, tracking.status);
    }

    return NextResponse.json({
      success: true,
      tracking,
      syncedStatus,
    });
  } catch (error) {
    console.error('iCarry Tracking API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
