import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfigured, env } from "./env.js";

export function initCloudinary(): void {
  if (!cloudinaryConfigured()) return;
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export function uploadAvatar(buffer: Buffer, userId: string): Promise<string> {
  if (!cloudinaryConfigured()) {
    return Promise.reject(new Error("Cloudinary is not configured"));
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "chooseone/avatars",
        public_id: userId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
      },
      (err, result) => {
        if (err || !result?.secure_url) {
          reject(err ?? new Error("Upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
