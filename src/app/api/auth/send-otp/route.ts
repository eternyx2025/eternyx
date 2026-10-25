import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/services/otpService';
import { emailService } from '@/services/emailService';
import { customerService } from '@/services/customerService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const emailClean = email.toLowerCase().trim();

    // Check if customer exists to personalize greeting (optional)
    const existing = await customerService.getByEmail(emailClean);
    const customerName = existing?.name;

    // Generate cryptographic 6-digit OTP
    const otpResult = otpService.createOtp(emailClean);
    if (!otpResult.success || !otpResult.code) {
      return NextResponse.json(
        { error: otpResult.error || 'Please wait before requesting another code.', retryAfterSeconds: otpResult.retryAfterSeconds },
        { status: 429 }
      );
    }

    // Send high-end luxury login email via Gmail SMTP
    const emailResult = await emailService.sendCustomerLoginOtp({
      to: emailClean,
      otp: otpResult.code,
      customerName,
      expiryMinutes: 10,
    });

    if (!emailResult.success) {
      // If dev mode without SMTP, still return devOtp for testing convenience
      if (emailResult.devOtp) {
        return NextResponse.json({
          success: true,
          message: 'Verification code generated (Dev mode).',
          devOtp: emailResult.devOtp,
        });
      }
      return NextResponse.json({ error: emailResult.error || 'Failed to dispatch email.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${emailClean}.`,
    });
  } catch (error: any) {
    console.error('Send OTP API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
