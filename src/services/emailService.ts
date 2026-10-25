import nodemailer from 'nodemailer';

interface SendOtpOptions {
  to: string;
  otp: string;
  expiryMinutes?: number;
}

export const emailService = {
  /**
   * Check if SMTP credentials are configured
   */
  isConfigured: (): boolean => {
    const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
    return Boolean(pass && pass.trim().length > 0);
  },

  /**
   * Send Password Reset OTP Email
   */
  sendPasswordResetOtp: async ({
    to,
    otp,
    expiryMinutes = 10,
  }: SendOtpOptions): Promise<{ success: boolean; error?: string; devOtp?: string }> => {
    const user = process.env.SMTP_EMAIL || process.env.ADMIN_EMAIL || 'eternyxfragrance@gmail.com';
    const pass = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    // If SMTP password is not yet configured, log OTP to console for developer convenience
    if (!pass) {
      console.warn('====================================================');
      console.warn('⚠️  [EMAIL SERVICE NOTICE] SMTP_PASSWORD NOT SET in .env.local');
      console.warn(`📩  Target Email: ${to}`);
      console.warn(`🔑  TEMPORARY DEV OTP CODE: ${otp}`);
      console.warn('👉  To deliver real emails, add your 16-character Google App Password');
      console.warn('    to .env.local as: SMTP_PASSWORD=xxxx xxxx xxxx xxxx');
      console.warn('====================================================');

      return {
        success: false,
        error: 'SMTP_PASSWORD is not configured in .env.local. Please configure your Google App Password to send live emails.',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user,
          pass,
        },
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0b; color: #e5e5e5; margin: 0; padding: 0; }
            .container { max-width: 540px; margin: 40px auto; background: #141414; border: 1px solid #2a2a2a; border-radius: 8px; overflow: hidden; }
            .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #222; background: #0e0e0e; }
            .logo { font-size: 20px; font-weight: 700; letter-spacing: 4px; color: #d4af37; text-transform: uppercase; }
            .body { padding: 36px 28px; }
            .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 14px; }
            .text { font-size: 14px; line-height: 1.6; color: #a3a3a3; margin-bottom: 24px; }
            .otp-box { background: #1c1c1c; border: 1px solid #d4af37; border-radius: 6px; padding: 20px; text-align: center; margin: 28px 0; }
            .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #d4af37; }
            .warning { font-size: 12px; color: #737373; line-height: 1.5; border-top: 1px solid #222; padding-top: 20px; margin-top: 24px; }
            .footer { padding: 20px; text-align: center; font-size: 11px; color: #525252; background: #0e0e0e; border-top: 1px solid #1a1a1a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ETERNYX</div>
            </div>
            <div class="body">
              <div class="title">Admin Password Reset</div>
              <p class="text">
                We received a request to reset the administrator password for your Eternyx account.
                Please use the verification code below to authorize your password change:
              </p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p class="text">
                This verification code will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>
              
              <div class="warning">
                If you did not initiate this request, your account is still secure. You can safely ignore this email.
                Never share this code with anyone.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Eternyx Luxury Fragrances. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"ETERNYX Security" <${user}>`,
        to,
        subject: `Your Eternyx Admin Password Reset Code: ${otp}`,
        text: `Your Eternyx Admin Password Reset OTP is: ${otp}. It will expire in ${expiryMinutes} minutes. If you did not request this, please ignore.`,
        html: htmlContent,
      });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send OTP email:', err);
      return { success: false, error: err.message || 'Failed to dispatch email' };
    }
  },

  /**
   * Send Customer Login OTP Email (100% Free via Gmail SMTP)
   */
  sendCustomerLoginOtp: async ({
    to,
    otp,
    customerName,
    expiryMinutes = 10,
  }: {
    to: string;
    otp: string;
    customerName?: string;
    expiryMinutes?: number;
  }): Promise<{ success: boolean; error?: string; devOtp?: string }> => {
    const user = process.env.SMTP_EMAIL || process.env.ADMIN_EMAIL || 'eternyxfragrance@gmail.com';
    const pass = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    if (!pass) {
      console.warn(`[DEV OTP] Target: ${to} | Code: ${otp}`);
      return {
        success: false,
        error: 'SMTP_PASSWORD is not configured in .env.local.',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
      });

      const greeting = customerName ? `Dear ${customerName},` : 'Welcome to ETERNYX,';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080808; color: #e5e5e5; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 36px auto; background: #111111; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 6px; overflow: hidden; }
            .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: #0b0b0b; }
            .logo { font-size: 22px; font-weight: 300; letter-spacing: 5px; color: #d4af37; text-transform: uppercase; font-family: Georgia, serif; }
            .tagline { font-size: 10px; letter-spacing: 2px; color: #888; text-transform: uppercase; margin-top: 6px; }
            .body { padding: 36px 30px; }
            .title { font-size: 19px; font-weight: 400; color: #ffffff; margin-bottom: 16px; font-family: Georgia, serif; }
            .text { font-size: 14px; line-height: 1.6; color: #b0b0b0; margin-bottom: 24px; }
            .otp-box { background: rgba(212, 175, 55, 0.05); border: 1px solid #d4af37; border-radius: 4px; padding: 22px; text-align: center; margin: 28px 0; }
            .otp-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
            .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #d4af37; }
            .warning { font-size: 12px; color: #666; line-height: 1.5; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 20px; margin-top: 24px; }
            .footer { padding: 24px; text-align: center; font-size: 11px; color: #555; background: #0a0a0a; border-top: 1px solid rgba(255, 255, 255, 0.05); letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ETERNYX</div>
              <div class="tagline">Silence is Luxury • Haute Parfumerie</div>
            </div>
            <div class="body">
              <div class="title">${greeting}</div>
              <p class="text">
                Use the one-time verification code below to securely authenticate your Eternyx account and access your order history:
              </p>
              
              <div class="otp-box">
                <div class="otp-label">One-Time Login Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <p class="text">
                This verification code will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>
              
              <div class="warning">
                If you did not request this login code, your account is still secure. Never share this code with anyone.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ETERNYX LUXURY PERFUMERY. ALL RIGHTS RESERVED.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"ETERNYX Concierge" <${user}>`,
        to,
        subject: `Your Eternyx Access Code: ${otp}`,
        text: `Your Eternyx login code is: ${otp}. It expires in ${expiryMinutes} minutes.`,
        html: htmlContent,
      });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send OTP email:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch email',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    }
  },

  /**
   * Send Customer Password Reset OTP Email
   */
  sendCustomerPasswordResetOtp: async ({
    to,
    otp,
    customerName,
    expiryMinutes = 10,
  }: {
    to: string;
    otp: string;
    customerName?: string;
    expiryMinutes?: number;
  }): Promise<{ success: boolean; error?: string; devOtp?: string }> => {
    const user = process.env.SMTP_EMAIL || process.env.ADMIN_EMAIL || 'eternyxfragrance@gmail.com';
    const pass = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    if (!pass) {
      console.warn(`[DEV RESET OTP] Target: ${to} | Code: ${otp}`);
      return {
        success: false,
        error: 'SMTP_PASSWORD is not configured in .env.local.',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
      });

      const greeting = customerName ? `Dear ${customerName},` : 'Hello,';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080808; color: #e5e5e5; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 36px auto; background: #111111; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 6px; overflow: hidden; }
            .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: #0b0b0b; }
            .logo { font-size: 22px; font-weight: 300; letter-spacing: 5px; color: #d4af37; text-transform: uppercase; font-family: Georgia, serif; }
            .tagline { font-size: 10px; letter-spacing: 2px; color: #888; text-transform: uppercase; margin-top: 6px; }
            .body { padding: 36px 30px; }
            .title { font-size: 19px; font-weight: 400; color: #ffffff; margin-bottom: 16px; font-family: Georgia, serif; }
            .text { font-size: 14px; line-height: 1.6; color: #b0b0b0; margin-bottom: 24px; }
            .otp-box { background: rgba(212, 175, 55, 0.05); border: 1px solid #d4af37; border-radius: 4px; padding: 22px; text-align: center; margin: 28px 0; }
            .otp-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
            .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #d4af37; }
            .warning { font-size: 12px; color: #666; line-height: 1.5; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 20px; margin-top: 24px; }
            .footer { padding: 24px; text-align: center; font-size: 11px; color: #555; background: #0a0a0a; border-top: 1px solid rgba(255, 255, 255, 0.05); letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ETERNYX</div>
              <div class="tagline">Silence is Luxury • Password Recovery</div>
            </div>
            <div class="body">
              <div class="title">${greeting}</div>
              <p class="text">
                We received a request to reset the password associated with your Eternyx client account.
                Please enter the verification code below to authorize your new password:
              </p>
              
              <div class="otp-box">
                <div class="otp-label">Password Reset Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <p class="text">
                This verification code will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>
              
              <div class="warning">
                If you did not initiate this request, your account remains secure and no action is required.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ETERNYX LUXURY PERFUMERY. ALL RIGHTS RESERVED.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"ETERNYX Security" <${user}>`,
        to,
        subject: `Your Eternyx Password Reset Code: ${otp}`,
        text: `Your Eternyx Password Reset code is: ${otp}. It expires in ${expiryMinutes} minutes.`,
        html: htmlContent,
      });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send Customer Password Reset OTP email:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch email',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    }
  },

  /**
   * Send Order Confirmation Email to customer (handles both Prepaid and Cash on Delivery)
   */
  sendOrderConfirmationEmail: async (order: {
    id: string;
    customer_name: string;
    customer_email: string;
    total: number;
    payment_method: string;
    items: Array<{ name: string; size?: string; price: number; quantity?: number }>;
    shipping_address?: { street?: string; city?: string; zip?: string; country?: string };
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = process.env.SMTP_EMAIL || 'eternyxfragrance@gmail.com';
      const pass = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

      if (!pass) {
        console.warn(`[Order Confirmation] Email skipped: SMTP_PASSWORD is not set. Order #${order.id}`);
        return { success: true };
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
      });

      const isCod = (order.payment_method || '').toUpperCase() === 'COD';

      const itemsHtml = (order.items || []).map((it) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #222; color: #f5f5f5; font-size: 14px;">
            <strong>${it.name}</strong><br/>
            <span style="color: #888; font-size: 12px;">${it.size || 'Standard'} &times; ${it.quantity || 1}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #222; text-align: right; color: #d4af37; font-weight: 600; font-size: 14px;">
            ₹${((it.price || 0) * (it.quantity || 1)).toLocaleString()}
          </td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080808; color: #e5e5e5; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 36px auto; background: #111111; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 6px; overflow: hidden; }
            .header { padding: 36px 24px 28px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: #0a0a0a; }
            .logo { font-size: 24px; font-weight: 800; letter-spacing: 5px; color: #d4af37; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase; margin-top: 6px; }
            .body { padding: 32px 28px; }
            .greeting { font-size: 18px; color: #ffffff; font-weight: 600; margin-bottom: 12px; }
            .text { font-size: 14px; line-height: 1.6; color: #b3b3b3; margin: 0 0 20px; }
            .order-meta-box { background: rgba(255, 255, 255, 0.03); border: 1px solid #222; border-radius: 4px; padding: 16px 20px; margin: 20px 0; font-size: 13px; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; color: #999; }
            .meta-row strong { color: #f0f0f0; }
            .cod-highlight-box { background: rgba(212, 175, 55, 0.08); border: 1px solid #d4af37; border-radius: 4px; padding: 18px; margin: 24px 0; text-align: center; }
            .cod-title { font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: #d4af37; font-weight: 700; margin-bottom: 6px; }
            .cod-amount { font-size: 26px; color: #ffffff; font-weight: 800; font-family: monospace; letter-spacing: 1px; }
            .cod-note { font-size: 12px; color: #bbb; margin-top: 6px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 24px 0 16px; }
            .total-row td { padding: 14px 0; font-size: 16px; font-weight: 700; color: #ffffff; border-top: 1px solid rgba(212, 175, 55, 0.3); }
            .btn { display: block; text-align: center; background: #d4af37; color: #000000; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 14px 24px; text-decoration: none; border-radius: 3px; margin-top: 28px; }
            .footer { padding: 24px; text-align: center; font-size: 11px; color: #555; background: #0a0a0a; border-top: 1px solid rgba(255, 255, 255, 0.05); letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">ETERNYX</h1>
              <div class="subtitle">Haute Parfumerie &bull; Order Confirmation</div>
            </div>
            <div class="body">
              <div class="greeting">Thank you, ${order.customer_name || 'Valued Client'}</div>
              <p class="text">
                Your order <strong>#${order.id}</strong> has been received and is now being handcrafted and prepared for dispatch by our master perfumers.
              </p>

              <div class="order-meta-box">
                <table style="width: 100%; font-size: 13px; color: #888;">
                  <tr>
                    <td style="padding: 3px 0;">Order Reference:</td>
                    <td style="text-align: right; color: #ffffff; font-weight: 600;">#${order.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0;">Payment Method:</td>
                    <td style="text-align: right; color: #d4af37; font-weight: 600;">${isCod ? 'Cash on Delivery (COD)' : 'Prepaid (Razorpay)'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0;">Delivery Address:</td>
                    <td style="text-align: right; color: #ddd;">${order.shipping_address?.street || ''}, ${order.shipping_address?.city || ''} ${order.shipping_address?.zip || ''}</td>
                  </tr>
                </table>
              </div>

              ${isCod ? `
                <div class="cod-highlight-box">
                  <div class="cod-title">Amount to Collect on Delivery</div>
                  <div class="cod-amount">₹${order.total.toLocaleString()}</div>
                  <div class="cod-note">Please keep cash or UPI ready when the delivery partner arrives.</div>
                </div>
              ` : `
                <div style="background: rgba(46, 125, 50, 0.08); border: 1px solid rgba(46, 125, 50, 0.3); border-radius: 4px; padding: 14px; text-align: center; margin: 20px 0;">
                  <span style="color: #81c784; font-size: 13px; font-weight: 600;">✓ Payment Verified via Razorpay Gateway</span>
                </div>
              `}

              <table class="items-table">
                ${itemsHtml}
                <tr class="total-row">
                  <td>Total</td>
                  <td style="text-align: right; color: #d4af37;">₹${order.total.toLocaleString()}</td>
                </tr>
              </table>

              <a href="https://eternyxfragrance.com/order/${order.id}" class="btn" target="_blank">Track Order Status</a>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ETERNYX LUXURY PERFUMERY. ALL RIGHTS RESERVED.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"ETERNYX Perfumes" <${user}>`,
        to: order.customer_email,
        subject: `Order Confirmed: #${order.id} - ETERNYX`,
        text: `Thank you for your order #${order.id}. Total: ₹${order.total}. Payment method: ${order.payment_method}. Track at https://eternyxfragrance.com/order/${order.id}`,
        html: htmlContent,
      });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send Order Confirmation email:', err);
      return { success: false, error: err.message || 'Failed to dispatch email' };
    }
  },
};


