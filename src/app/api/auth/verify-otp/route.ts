import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { customerSessionOptions, SessionData } from '@/lib/session';
import { otpService } from '@/services/otpService';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const emailClean = email.toLowerCase().trim();
    const codeClean = String(code).trim();

    // Verify OTP code
    const verifyResult = otpService.verifyOtp(emailClean, codeClean);
    if (!verifyResult.success) {
      return NextResponse.json({ error: verifyResult.error || 'Invalid verification code.' }, { status: 400 });
    }

    // Ensure customer exists in database (auto-provisions if new, retrieves if existing)
    const customer = await customerService.ensureCustomer(emailClean);
    if (!customer) {
      return NextResponse.json({ error: 'Could not create or retrieve customer profile.' }, { status: 500 });
    }

    // Start encrypted customer session
    const res = NextResponse.json({ success: true, customer });
    const session = await getIronSession<SessionData>(request, res, customerSessionOptions);
    session.customerId = customer.id;
    session.customerEmail = customer.email;
    session.customerName = customer.name;
    await session.save();

    return res;
  } catch (error: any) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
