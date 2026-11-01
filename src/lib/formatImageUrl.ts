/**
 * Extracts a Google Drive file ID from various link formats and returns
 * a direct high-resolution image URL via Google's CDN (lh3.googleusercontent.com).
 */
export function formatImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();

  // 1. If it's already an lh3 link with =w2000 or similar
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    if (!trimmed.includes('=')) {
      return `${trimmed}=w2000`;
    }
    return trimmed;
  }

  // 2. Google Drive /thumbnail?id=ID
  if (trimmed.includes('drive.google.com/thumbnail')) {
    const match = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w2000`;
    }
  }

  // 3. Google Drive /file/d/ID/...
  if (trimmed.includes('drive.google.com/file/d/')) {
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w2000`;
    }
  }

  // 4. Google Drive /open?id=ID or /uc?id=ID or /uc?export=view&id=ID
  if (trimmed.includes('drive.google.com/open') || trimmed.includes('drive.google.com/uc')) {
    const match = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w2000`;
    }
  }

  return trimmed;
}

