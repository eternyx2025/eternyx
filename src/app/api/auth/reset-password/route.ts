import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { customerSessionOptions, SessionData } from '@/lib/session';
import { otpService } from '@/services/otpService';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Email, verification code, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const emailClean = email.toLowerCase().trim();
    const codeClean = String(code).trim();

    // Verify OTP against reset identifier
    const verifyResult = otpService.verifyOtp(`reset:${emailClean}`, codeClean);
    if (!verifyResult.success) {
      return NextResponse.json({ error: verifyResult.error || 'Invalid or expired verification code.' }, { status: 400 });
    }

    // Update password in MySQL
    const resetSuccess = await customerService.resetPassword(emailClean, newPassword);
    if (!resetSuccess) {
      return NextResponse.json({ error: 'Failed to update password in database.' }, { status: 500 });
    }

    const customer = await customerService.getByEmail(emailClean);

    // Automatically log the customer in with their new credentials
    const res = NextResponse.json({ success: true, message: 'Password reset successfully.', customer });
    if (customer) {
      const session = await getIronSession<SessionData>(request, res, customerSessionOptions);
      session.customerId = customer.id;
      session.customerEmail = customer.email;
      session.customerName = customer.name;
      await session.save();
    }

    return res;
  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
