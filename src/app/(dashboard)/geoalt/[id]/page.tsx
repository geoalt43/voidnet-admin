'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Blog {
  _id: string;
  title: string;
  description: string;
  image: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
}

export default function PreviewGeoaltPage({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchBlog(resolvedParams.id);
    }
  }, [resolvedParams]);

  const fetchBlog = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${blog?._id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/geoalt');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog not found</h2>
        <p className="text-gray-500 mb-4">The blog you're looking for doesn't exist</p>
        <button
          onClick={() => router.push('/geoalt')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to GeoAlt
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push('/geoalt')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to GeoAlt
      </button>

      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {blog.image && (
          <div className="aspect-video w-full bg-gray-100">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          {blog.description && (
            <p className="text-lg text-gray-600 mb-6 pb-6 border-b border-gray-100">
              {blog.description}
            </p>
          )}

          <div 
            className="prose max-w-none prose-lg prose-blue"
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-900">Meta Title</p>
                <p>{blog.metaTitle || blog.title}</p>
              </div>
              <div className="text-sm text-gray-500 max-w-xs">
                <p className="font-medium text-gray-900">Meta Description</p>
                <p>{blog.metaDescription || blog.description || 'No description'}</p>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-900">Created</p>
                <p>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-5 py-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {deleting ? 'Deleting...' : 'Delete Blog'}
        </button>
      </div>
    </div>
  );
}