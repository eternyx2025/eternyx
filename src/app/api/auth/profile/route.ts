import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { customerSessionOptions, SessionData } from '@/lib/session';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(request, res, customerSessionOptions);

    if (!session.customerId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { name, phone, password } = await request.json();

    if (name && phone !== undefined) {
      await customerService.updateProfile(session.customerId, name, phone);
      session.customerName = name.trim();
      await session.save();
    }

    if (password && password.length >= 6 && session.customerEmail) {
      await customerService.resetPassword(session.customerEmail, password);
    }

    const updatedCustomer = await customerService.getById(session.customerId);

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error: any) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
