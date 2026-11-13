import { NextResponse } from 'next/server';
import { homepageService } from '@/services/homepageService';
import { settingsService } from '@/services/settingsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await homepageService.getAll();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Failed to get admin homepage data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { section, data } = body;

    if (!section || data === undefined) {
      return NextResponse.json({ success: false, error: 'Missing section or data' }, { status: 400 });
    }

    const keyMap: Record<string, string> = {
      announcements: 'homepage_announcements',
      categoryPills: 'homepage_category_pills',
      popup: 'homepage_popup',
      press: 'homepage_press',
      bundles: 'homepage_bundles',
      noteProfiles: 'homepage_note_profiles',
      retailPartners: 'homepage_retail_partners',
      promises: 'homepage_promises',
      instagram: 'homepage_instagram',
      titles: 'homepage_titles',
    };

    const key = keyMap[section] || section;
    const ok = await settingsService.set(key, data);

    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to save to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Updated ${section} successfully` });
  } catch (error: any) {
    console.error('Failed to update homepage settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

