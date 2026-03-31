import api from './api';

/**
 * Uploads a file to the Django backend (Cloudinary) and returns the public URL.
 * Replaces Supabase Storage.
 */
export async function uploadImage(file: File, bucket: string = 'experiences'): Promise<string | null> {
  try {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large (max 5MB)');
      return null;
    }

    const formData = new FormData();
    formData.append('image', file);
    // Note: The backend uses Cloudinary, 'bucket' parameter is kept for interface compatibility
    // but might be used as a folder prefix in the future if implemented.

    const response = await api.post<{ url: string }>('/users/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.url) {
      return response.data.url;
    }

    console.error('[Storage] Upload failed: No URL returned');
    return null;
  } catch (error: any) {
    console.error('[Storage] Unexpected error in uploadImage:', error.response?.data || error.message);
    return null;
  }
}
