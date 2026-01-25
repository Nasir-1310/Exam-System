// Frontend/lib/googleDriveUtils.ts

/**
 * Convert Google Drive shareable link to direct image URL for embedding
 * 
 * Handles multiple Google Drive URL formats:
 * - https://drive.google.com/file/d/{file_id}/view?usp=sharing
 * - https://drive.google.com/open?id={file_id}
 * - https://drive.google.com/uc?id={file_id}
 * 
 * @param url - The Google Drive URL or any image URL
 * @returns Direct image URL that can be used in <img> src
 */
export function convertGoogleDriveUrl(url: string | null | undefined): string {
  // Return empty string if no URL provided
  if (!url || typeof url !== 'string') {
    return '';
  }

  // If it's not a Google Drive URL, return as-is
  if (!url.includes('drive.google.com')) {
    return url;
  }

  try {
    let fileId: string | null = null;

    // Extract file ID from different Google Drive URL formats
    if (url.includes('/file/d/')) {
      // Format: https://drive.google.com/file/d/{file_id}/view?usp=sharing
      const parts = url.split('/file/d/');
      if (parts.length > 1) {
        fileId = parts[1].split('/')[0].split('?')[0];
      }
    } else if (url.includes('id=')) {
      // Format: https://drive.google.com/open?id={file_id} or uc?id={file_id}
      const urlParams = url.split('id=');
      if (urlParams.length > 1) {
        fileId = urlParams[1].split('&')[0];
      }
    }

    // If we successfully extracted file ID, return direct image URL
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // If we couldn't extract file ID, return original URL
    return url;
  } catch (error) {
    console.error('Error converting Google Drive URL:', error);
    return url;
  }
}

/**
 * Check if a URL is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return url.includes('drive.google.com');
}