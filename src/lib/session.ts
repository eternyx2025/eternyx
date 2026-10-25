import { SessionOptions } from 'iron-session';

export interface SessionData {
  isAdmin: boolean;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
}

export const defaultSession: SessionData = {
  isAdmin: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'eternyx_admin_session',
  cookieOptions: {
    // secure only on production
    secure: process.env.NODE_ENV === 'production',
  },
};

export const customerSessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'eternyx_customer_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
