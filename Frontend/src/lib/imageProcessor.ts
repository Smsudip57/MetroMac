import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');

/**
 * Downloads and resizes any image format to PNG icons
 * Supports: PNG, JPG, JPEG, WebP, GIF, SVG, TIFF, BMP, and more
 */
export async function downloadAndResizeIcon(iconUrl: string): Promise<{
  icon64: string;
  icon192: string;
  icon512: string;
}> {
  try {
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    console.log('[Icon Processor] Downloading image from:', iconUrl);

    // Download the image
    const response = await fetch(iconUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch icon: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const bufferNode = Buffer.from(buffer);

    // Detect image format from content-type or URL extension
    const contentType = response.headers.get('content-type') || '';
    const urlExtension = iconUrl.split('.').pop()?.toLowerCase() || '';
    
    let isAnimated = false;
    let imageFormat = 'png';

    // Check if animated GIF or WebP
    if (contentType.includes('gif') || urlExtension === 'gif') {
      isAnimated = true;
      imageFormat = 'gif';
    } else if (contentType.includes('webp') || urlExtension === 'webp') {
      imageFormat = 'webp';
    } else if (contentType.includes('svg') || urlExtension === 'svg') {
      imageFormat = 'svg';
    } else if (contentType.includes('jpeg') || contentType.includes('jpg') || 
               urlExtension === 'jpg' || urlExtension === 'jpeg') {
      imageFormat = 'jpeg';
    }

    console.log('[Icon Processor] Detected format:', imageFormat, 'Animated:', isAnimated);

    // For SVG files, just use them directly without resizing
    if (imageFormat === 'svg') {
      console.log('[Icon Processor] SVG detected, using original file');
      const icon64Path = path.join(publicDir, 'icon-64x64.svg');
      const icon192Path = path.join(publicDir, 'icon-192x192.svg');
      const icon512Path = path.join(publicDir, 'icon-512x512.svg');
      
      fs.writeFileSync(icon64Path, bufferNode);
      fs.writeFileSync(icon192Path, bufferNode);
      fs.writeFileSync(icon512Path, bufferNode);

      return {
        icon64: '/icon-64x64.svg',
        icon192: '/icon-192x192.svg',
        icon512: '/icon-512x512.svg',
      };
    }

    // Create sharp instance and handle animated images
    let sharpInstance = sharp(bufferNode, { 
      animated: isAnimated,
      pages: isAnimated ? 0 : 1, // 0 = all pages for animated
    });

    // Resize to 64x64
    const icon64Path = path.join(publicDir, 'icon-64x64.png');
    await sharpInstance
      .resize(64, 64, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
      })
      .png({ quality: 95 })
      .toFile(icon64Path);

    // Create new instance for 192x192
    sharpInstance = sharp(bufferNode, { 
      animated: isAnimated,
      pages: isAnimated ? 0 : 1,
    });
    // Resize to 192x192
    const icon192Path = path.join(publicDir, 'icon-192x192.png');
    await sharpInstance
      .resize(192, 192, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
      })
      .png({ quality: 95 })
      .toFile(icon192Path);

    // Create new instance for 512x512
    sharpInstance = sharp(bufferNode, { 
      animated: isAnimated,
      pages: isAnimated ? 0 : 1,
    });

    // Resize to 512x512
    const icon512Path = path.join(publicDir, 'icon-512x512.png');
    await sharpInstance
      .resize(512, 512, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
      })
      .png({ quality: 95 })
      .toFile(icon512Path);

    console.log('[Icon Processor] Icons resized and saved successfully');
    console.log('[Icon Processor] - 64x64:', icon64Path);
    console.log('[Icon Processor] - 192x192:', icon192Path);
    console.log('[Icon Processor] - 512x512:', icon512Path);

    return {
      icon64: '/icon-64x64.png',
      icon192: '/icon-192x192.png',
      icon512: '/icon-512x512.png',
    };
  } catch (error) {
    console.error('[Icon Processor] Error processing icon:', error);
    // Return defaults if processing fails
    return {
      icon64: '/header-logo.png',
      icon192: '/header-logo.png',
      icon512: '/header-logo.png',
    };
  }
}
