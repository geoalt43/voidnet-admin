import { Client } from "minio";

const region = process.env.WASABI_REGION || "ap-southeast-1";
const endPoint = process.env.WASABI_ENDPOINT?.replace(/^https?:\/\//, "") || `s3.${region}`;
const accessKey = process.env.WASABI_ACCESS_KEY_ID || "";
const secretKey = process.env.WASABI_SECRET_ACCESS_KEY || "";
const bucketName = process.env.WASABI_BUCKET_NAME || "";

export const s3Client = new Client({
  endPoint,
  port: 443,
  useSSL: true,
  accessKey,
  secretKey,
  region,
});

export const uploadImageToWasabi = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  await s3Client.putObject(bucketName, key, buffer, undefined, {
    "Content-Type": file.type,
  });
  
  return `https://${bucketName}.s3.${region}.wasabisys.com/${key}`;
};

export const deleteImageFromWasabi = async (url: string): Promise<void> => {
  const urlObj = new URL(url);
  const key = urlObj.pathname.slice(1);
  await s3Client.removeObject(bucketName, key);
};