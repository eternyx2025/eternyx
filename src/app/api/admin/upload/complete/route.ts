import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const getDriveClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, isVideo = true } = body;

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId.' }, { status: 400 });
    }

    if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
      try {
        const drive = getDriveClient();
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permErr: any) {
        console.warn('Could not set Google Drive public permissions:', permErr.message || permErr);
      }
    }

    const url = isVideo
      ? `/api/video/${fileId}`
      : `https://lh3.googleusercontent.com/d/${fileId}=w2000`;

    return NextResponse.json({
      url,
      fileId,
      success: true,
    });
  } catch (error: any) {
    console.error('Upload complete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete file registration.' },
      { status: 500 }
    );
  }
}
