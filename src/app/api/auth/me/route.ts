import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { customerSessionOptions, SessionData } from '@/lib/session';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(request, res, customerSessionOptions);

    if (!session.customerId) {
      return NextResponse.json({ loggedIn: false });
    }

    const customer = await customerService.getById(session.customerId);
    if (!customer) {
      session.destroy();
      return NextResponse.json({ loggedIn: false });
    }

    // Retrieve their last shipping address from order history to autofill checkout
    const orders = customer.orders || [];
    let savedAddress = null;
    if (orders.length > 0) {
      savedAddress = orders[0].shipping_address;
    }

    return NextResponse.json({
      loggedIn: true,
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone || '',
      hasPassword: Boolean(customer.password_hash),
      address: savedAddress,
      orders: orders,
      spent: customer.spent || customer.total_spend || 0,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error('Customer check session API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
