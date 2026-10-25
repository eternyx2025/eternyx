import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { customerSessionOptions, SessionData } from '@/lib/session';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields for registration' }, { status: 400 });
    }

    const customer = await customerService.registerPassword(email, password, name, phone);
    if (!customer) {
      return NextResponse.json({ error: 'Failed to register customer account' }, { status: 500 });
    }

    // Set the cookie session for the registered customer
    const res = NextResponse.json({ success: true, customer });
    const session = await getIronSession<SessionData>(request, res, customerSessionOptions);
    session.customerId = customer.id;
    session.customerEmail = customer.email;
    session.customerName = customer.name;
    await session.save();

    return res;
  } catch (error) {
    console.error('Customer registration API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
