import { google } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Helper to get Google Drive Client
const getDriveClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const urlObj = new URL(request.url);
    const queryFilename = urlObj.searchParams.get('filename') || request.headers.get('x-filename') || '';

    let buffer: Buffer | null = null;
    let originalName = queryFilename || 'media.mp4';
    let mimeType = contentType;

    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (file) {
          const bytes = await file.arrayBuffer();
          buffer = Buffer.from(bytes);
          originalName = file.name || originalName;
          mimeType = file.type || mimeType;
        }
      } catch (formErr) {
        console.warn('FormData parse failed (likely size limit), reading raw body buffer:', formErr);
      }
    }

    // If buffer wasn't populated from formData (e.g. direct binary upload or large file)
    if (!buffer) {
      const bytes = await request.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    if (!buffer || buffer.length === 0) {
      return Response.json({ error: 'No file data received or file is empty' }, { status: 400 });
    }

    const ext = originalName.split('.').pop() || (mimeType.includes('video') ? 'mp4' : 'jpg');
    const filename = `${uuidv4().slice(0, 8)}.${ext}`;
    const isVideo = mimeType.startsWith('video/') || ['mp4', 'mov', 'webm', 'ogg', 'm4v', 'avi', 'mkv'].includes(ext.toLowerCase());
    let url = '';

    // 1. Attempt Google Drive Upload if credentials exist
    if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
      try {
        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);

        const drive = getDriveClient();

        const fileMetadata = {
          name: filename,
          parents: FOLDER_ID ? [FOLDER_ID] : [],
        };

        const media = {
          mimeType: mimeType || 'application/octet-stream',
          body: bufferStream,
        };

        const driveResponse = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id',
        });

        const fileId = driveResponse.data.id;

        if (fileId) {
          await drive.permissions.create({
            fileId: fileId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });

          url = isVideo
            ? `/api/video/${fileId}`
            : `https://lh3.googleusercontent.com/d/${fileId}=w2000`;

          console.log('✓ Successfully uploaded to Google Drive:', url);
        }
      } catch (driveError: any) {
        console.warn('⚠️ Google Drive Upload Failed, falling back to local server storage:', driveError.message || driveError);
      }
    }

    // 2. Fallback to saving locally in public/uploads/
    if (!url) {
      const baseDir = fs.existsSync('/root/eternyx') ? '/root/eternyx' : process.cwd();
      const uploadDir = path.join(baseDir, 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      url = `/uploads/${filename}`;
      console.log('✓ Saved locally on server:', url);
    }

    return Response.json({ url, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return Response.json(
      { error: error.message || 'Failed to upload' },
      { status: 500 }
    );
  }
}


