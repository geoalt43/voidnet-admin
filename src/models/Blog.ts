import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  image: string;
  content: string;
  platform: 'whatspilot' | 'geoalt';
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    content: { type: String, required: true },
    platform: { type: String, enum: ['whatspilot', 'geoalt'], required: true },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);