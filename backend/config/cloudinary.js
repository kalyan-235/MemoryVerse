const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Store files in memory (buffer), NOT disk or Cloudinary directly ──
// This avoids multer-storage-cloudinary permission issues
const memoryStorage = multer.memoryStorage();

const uploadMemoryMedia = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/webm',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not supported.`), false);
    }
  },
});

const uploadCollectionCover = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadProfilePhoto = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * uploadToCloudinary — uploads a buffer directly to Cloudinary via upload_stream.
 * Returns { secure_url, public_id, resource_type }
 */
const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      quality: 'auto:good',
    };

    if (resourceType === 'image') {
      uploadOptions.transformation = [{ width: 1200, crop: 'limit' }];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload_stream error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Pipe the buffer into the stream
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadMemoryMedia,
  uploadCollectionCover,
  uploadProfilePhoto,
  uploadToCloudinary,
};
