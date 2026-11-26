import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/env.js';
import path from 'path';
import fs from 'fs';

let isCloudinaryConfigured = false;
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  isCloudinaryConfigured = true;
}

export async function uploadMedia(filePath: string, folder = 'intelliavatar'): Promise<{ url: string; publicId?: string }> {
  if (isCloudinaryConfigured) {
    try {
      const res = await cloudinary.uploader.upload(filePath, { folder });
      return { url: res.secure_url, publicId: res.public_id };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local static URL:', err);
    }
  }

  // Fallback to locally served static uploads
  const fileName = path.basename(filePath);
  return { url: `/uploads/${fileName}` };
}
