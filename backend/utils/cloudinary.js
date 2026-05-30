const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 */
const deleteImage = async (publicId) => {
  if (!config.cloudinary.isConfigured) {
    console.warn('[CLOUDINARY] Skip deletion: Cloudinary is not configured.');
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - The Cloudinary URL
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('upload/')) return null;
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  const [publicId] = fileName.split('.');
  // The folder is 'smartstay-hub/rooms' as defined in upload middleware
  return `smartstay-hub/rooms/${publicId}`; 
};

module.exports = {
  cloudinary,
  deleteImage,
  getPublicIdFromUrl,
};
