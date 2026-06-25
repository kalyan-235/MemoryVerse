/**
 * cloudinaryApi — uploads image/video directly from browser to Cloudinary
 * using an unsigned upload preset (no API secret needed).
 *
 * This bypasses backend upload entirely, solving the 403 permission issue.
 */

const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file directly to Cloudinary from the browser.
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder (e.g. 'memoryverse/memories')
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadFileToCloudinary = async (file, folder = 'memoryverse/memories') => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary config missing. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to frontend .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const resourceType = file.type.startsWith('video') ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id:  data.public_id,
    resource_type: resourceType,
  };
};
