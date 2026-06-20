const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for memory images & videos
const memoryMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'memoryverse/memories',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
    transformation: file.mimetype.startsWith('video')
      ? undefined
      : [{ width: 1200, crop: 'limit', quality: 'auto' }],
  }),
});

// Storage for collection cover images
const collectionCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'memoryverse/collections',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

// Storage for profile photos
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'memoryverse/profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'thumb', gravity: 'face', quality: 'auto' }],
  },
});

// Multer upload handlers
const uploadMemoryMedia    = multer({ storage: memoryMediaStorage });
const uploadCollectionCover = multer({ storage: collectionCoverStorage });
const uploadProfilePhoto   = multer({ storage: profilePhotoStorage });

module.exports = {
  cloudinary,
  uploadMemoryMedia,
  uploadCollectionCover,
  uploadProfilePhoto,
};
