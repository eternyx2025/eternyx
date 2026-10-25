import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { customerSessionOptions, SessionData } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const res = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(request, res, customerSessionOptions);
    session.destroy();
    return res;
  } catch (error) {
    console.error('Customer logout API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
