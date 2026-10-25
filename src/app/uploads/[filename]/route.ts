import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename) {
      return new NextResponse('Filename missing', { status: 400 });
    }

    // Prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);

    const rangeHeader = request.headers.get('range');

    if (!fs.existsSync(filePath)) {
      // Fallback: fetch from live production site so local dev loads all media seamlessly
      const liveUrl = `https://eternyxfragrance.com/uploads/${sanitizedFilename}`;
      try {
        const prodRes = await fetch(liveUrl, {
          headers: rangeHeader ? { range: rangeHeader } : {},
        });

        if (prodRes.ok) {
          const contentType = prodRes.headers.get('content-type') || 'application/octet-stream';
          const contentLength = prodRes.headers.get('content-length');
          const contentRange = prodRes.headers.get('content-range');

          // Full file download: cache locally in public/uploads so subsequent requests are instant
          if (prodRes.status === 200) {
            const arrayBuffer = await prodRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            try {
              const uploadDir = path.join(process.cwd(), 'public', 'uploads');
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              fs.writeFileSync(filePath, buffer);
            } catch (writeErr) {
              console.warn('Could not cache file locally:', writeErr);
            }

            return new NextResponse(buffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Length': String(buffer.length),
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }

          // Video partial content streaming
          if (prodRes.status === 206) {
            return new NextResponse(prodRes.body, {
              status: 206,
              headers: {
                'Content-Range': contentRange || '',
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength || '',
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
              },
            });
          }

          return new NextResponse(prodRes.body, {
            status: prodRes.status,
            headers: {
              'Content-Type': contentType,
              ...(contentLength ? { 'Content-Length': contentLength } : {}),
            },
          });
        }
      } catch (proxyErr) {
        console.warn(`[uploads fallback] Failed to fetch ${liveUrl}:`, proxyErr);
      }

      return new NextResponse('File Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(sanitizedFilename).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.ogg') contentType = 'video/ogg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';


    // Support streaming/seeking for videos with HTTP 206 Partial Content
    if (rangeHeader && fileSize > 0) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` }
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', chunk => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', err => controller.error(err));
        }
      });

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=31536000, immutable',
        }
      });
    }

    // Full file stream
    const fileStream = fs.createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', chunk => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', err => controller.error(err));
      }
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  } catch (error: any) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
