import { Client } from "minio";
import { v4 as uuidv4 } from "uuid";

const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT!;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

const r2Client = new Client({
  endPoint: new URL(R2_ENDPOINT).hostname,
  port: 443,
  useSSL: true,
  accessKey: R2_ACCESS_KEY_ID,
  secretKey: R2_SECRET_ACCESS_KEY,
});

export async function uploadImageToR2(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop() || 'jpg';
  const key = `uploads/${uuidv4()}.${ext}`;

  await r2Client.putObject(
    R2_BUCKET_NAME,
    key,
    buffer,
    buffer.length,
    { "Content-Type": file.type }
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteImageFromR2(url: string): Promise<void> {
  const urlObj = new URL(url);
  const key = urlObj.pathname.slice(1);

  await r2Client.removeObject(R2_BUCKET_NAME, key);
}

export async function getImageUrl(key: string): Promise<string> {
  return r2Client.presignedGetObject(R2_BUCKET_NAME, key, 3600);
}