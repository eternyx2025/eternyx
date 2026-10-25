import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/customerService';
import { otpService } from '@/services/otpService';
import { emailService } from '@/services/emailService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const emailClean = email.toLowerCase().trim();

    // 1. Verify that this email is actually in the database!
    const customer = await customerService.getByEmail(emailClean);
    if (!customer) {
      return NextResponse.json(
        { error: 'No account found matching this email address. Please check your spelling or create an account.' },
        { status: 404 }
      );
    }

    // 2. Generate secure 6-digit OTP
    const otpResult = otpService.createOtp(`reset:${emailClean}`);
    if (!otpResult.success || !otpResult.code) {
      return NextResponse.json(
        { error: otpResult.error || 'Please wait before requesting another code.', retryAfterSeconds: otpResult.retryAfterSeconds },
        { status: 429 }
      );
    }

    // 3. Dispatch Password Reset Email via Gmail SMTP
    const emailResult = await emailService.sendCustomerPasswordResetOtp({
      to: emailClean,
      otp: otpResult.code,
      customerName: customer.name,
      expiryMinutes: 10,
    });

    if (!emailResult.success) {
      if (emailResult.devOtp) {
        return NextResponse.json({
          success: true,
          message: 'Password reset code generated (Dev mode).',
          devOtp: emailResult.devOtp,
        });
      }
      return NextResponse.json({ error: emailResult.error || 'Failed to dispatch email.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `A password reset code has been sent to ${emailClean}.`,
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
