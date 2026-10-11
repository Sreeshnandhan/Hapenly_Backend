import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

export class EventInputError extends Error {}
export async function validateEventImage(buffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(buffer, { limitInputPixels: 20_000_000 });
    const metadata = await image.metadata();
    if (
      !metadata.format ||
      !["jpeg", "png", "webp"].includes(metadata.format) ||
      (metadata.pages ?? 1) > 1
    )
      throw new Error("Unsupported image");
    return await image
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    throw new EventInputError(
      "Choose a valid, non-animated JPG, PNG or WebP image (maximum 20 megapixels).",
    );
  }
}
function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret)
    throw new Error("Image storage is not configured");
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}
export async function uploadEventImage(
  buffer: Buffer,
): Promise<{ url: string; publicId: string }> {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "hapenly/events",
        public_id: randomUUID(),
        overwrite: false,
        format: "jpg",
        timeout: 30_000,
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Image upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}
export async function deleteEventImage(publicId: string) {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}
