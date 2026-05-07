'use client';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export default function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      style={{ lineHeight: '1.8' }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}