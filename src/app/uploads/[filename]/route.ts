import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MEDIA_MAP: Record<string, string> = {
  // Products
  '534bd0f0.webp': 'images/product-candy.png',
  '895050de.webp': 'images/product-after-meet.png',
  'd0add914.webp': 'images/product-azura.png',
  '504cfcb2.webp': 'images/product-memorable.png',
  'a251a97d.webp': 'images/product-cherry-blow.png',
  '110c5e42.webp': 'images/product-sovare.png',
  'a9f0d8ee.webp': 'images/product-dream-drop-let.png',
  'bd8b7428.webp': 'images/product-dark-thinker.png',
  '1a6fbd15.webp': 'images/product-dark-revenge.png',
  'c888d1f5.webp': 'images/product-my-stora.png',
  // Banners & Philosophy
  'e9e8bbb0.webp': 'images/banner-2.png',
  '2421cf91.webp': 'images/banner-2.png',
  '4c8cc411.webp': 'images/banner-3.png',
  'f99e04c3.webp': 'images/banner-3.png',
  'd9fb8480.webp': 'images/brand-statement.png',
  // Reels / Videos
  'e375ee38.mp4': 'videos/reel-placeholder.mp4',
  'b3cbf283.mp4': 'videos/reel-placeholder.mp4',
  '38fbde1b.mp4': 'videos/reel-placeholder.mp4',
};

function getPublicDir(): string {
  const candidates = [
    path.join(process.cwd(), 'public'),
    path.join('/root/eternyx', 'public'),
    path.join('/var/www/eternyx', 'public'),
    path.resolve('./public'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(process.cwd(), 'public');
}

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
    const rangeHeader = request.headers.get('range');
    const publicDir = getPublicDir();

    // 1. Direct match in uploads or public directories
    const candidatePaths = [
      path.join(publicDir, 'uploads', sanitizedFilename),
      path.join(publicDir, 'uploads_backup', sanitizedFilename),
      path.join(publicDir, 'images', sanitizedFilename),
      path.join(publicDir, 'videos', sanitizedFilename),
    ];

    let filePath = candidatePaths.find(p => fs.existsSync(p));

    // 2. Mapped fallback to original high-res assets
    if (!filePath && MEDIA_MAP[sanitizedFilename]) {
      const mapped = path.join(publicDir, MEDIA_MAP[sanitizedFilename]);
      if (fs.existsSync(mapped)) {
        filePath = mapped;
      }
    }

    // 3. Fallback placeholder if file still missing
    if (!filePath) {
      const isVideoReq = sanitizedFilename.endsWith('.mp4') || sanitizedFilename.endsWith('.webm');
      const genericFallback = isVideoReq
        ? path.join(publicDir, 'videos', 'reel-placeholder.mp4')
        : path.join(publicDir, 'images', 'product-candy.png');
      if (fs.existsSync(genericFallback)) {
        filePath = genericFallback;
      }
    }

    if (!filePath) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();

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

    // Full file stream with caching
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
