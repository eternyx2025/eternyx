import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { customerSessionOptions, SessionData } from '@/lib/session';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const customer = await customerService.getByEmail(email);
    if (!customer || !customer.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await customerService.verifyPassword(password, customer.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Set the cookie session for the customer
    const res = NextResponse.json({ success: true, customer });
    const session = await getIronSession<SessionData>(request, res, customerSessionOptions);
    session.customerId = customer.id;
    session.customerEmail = customer.email;
    session.customerName = customer.name;
    await session.save();

    return res;
  } catch (error) {
    console.error('Customer login API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
