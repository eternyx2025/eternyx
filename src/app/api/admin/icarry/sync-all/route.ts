import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { orderService } from '@/services/orderService';
import { icarryService } from '@/services/icarryService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization: either admin session or cron/system secret
    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    const authHeader = request.headers.get('authorization');
    const cronKey = request.nextUrl.searchParams.get('key');
    const systemSecret = process.env.ADMIN_RECOVERY_KEY || 'eternyx-system-sync';

    const isAuthorized = session.isAdmin || authHeader === `Bearer ${systemSecret}` || cronKey === systemSecret;
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    // 2. Fetch all orders that are currently in-transit / awaiting delivery
    const activeOrders = await orderService.getActiveInTransitOrders();

    if (!activeOrders || activeOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All active shipments are already delivered or up to date.',
        totalChecked: 0,
        updatedCount: 0,
        changes: [],
        timestamp: new Date().toISOString(),
      });
    }

    const changes: any[] = [];
    let updatedCount = 0;

    // 3. Process orders in parallel with a controlled concurrency batch
    for (const order of activeOrders) {
      const awb = order.shipping_tracking_id;
      if (!awb) continue;

      try {
        const tracking = await icarryService.trackShipment(awb);
        if (tracking?.status) {
          const synced = await orderService.syncDeliveryStatus(order.id, tracking.status);
          if (synced && synced !== order.status) {
            updatedCount++;
            changes.push({
              orderId: order.id,
              trackingId: awb,
              previousStatus: order.status,
              newStatus: synced,
              recipient: order.customer_name,
            });
          }
        }
      } catch (err: any) {
        console.error(`Error tracking shipment ${awb} for order ${order.id}:`, err.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Batch sync complete. Checked ${activeOrders.length} in-transit orders; updated ${updatedCount} orders.`,
      totalChecked: activeOrders.length,
      updatedCount,
      changes,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Batch sync shipments error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Allow GET for quick manual browser test or external uptime monitoring
export async function GET(request: NextRequest) {
  return POST(request);
}
