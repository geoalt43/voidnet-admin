'use client';

import { useEffect, useRef, useState } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type FormatType = 'bold' | 'italic' | 'h2' | 'h3' | 'bullet' | 'link';

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<FormatType>>(new Set());

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const execCommand = (format: FormatType) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'h2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, 'h3');
        break;
      case 'bullet':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
    }

    updateValue();
  };

  const updateValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateValue();
  };

  const ToolbarButton = ({ 
    format, 
    label, 
    icon 
  }: { 
    format: FormatType; 
    label: string;
    icon: string;
  }) => (
    <button
      type="button"
      onClick={() => execCommand(format)}
      title={label}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span className="text-lg" dangerouslySetInnerHTML={{ __html: icon }} />
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton 
          format="bold" 
          label="Bold" 
          icon="<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z'/></svg>" 
        />
        <ToolbarButton 
          format="italic" 
          label="Italic" 
          icon="<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 4h4m-2 16V4m0 16h4M10 4L6 20'/></svg>" 
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton 
          format="h2" 
          label="Heading 2" 
          icon="<span className='text-sm font-bold'>H2</span>" 
        />
        <ToolbarButton 
          format="h3" 
          label="Heading 3" 
          icon="<span className='text-sm font-bold'>H3</span>" 
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton 
          format="bullet" 
          label="Bullet List" 
          icon="<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16'/></svg>" 
        />
        <ToolbarButton 
          format="link" 
          label="Add Link" 
          icon="<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'/></svg>" 
        />
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={updateValue}
        className="min-h-[400px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 prose prose-lg max-w-none"
        style={{ lineHeight: '1.7' }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder || 'Start writing your blog content...'}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
          padding: 0.5rem 1rem;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        [contenteditable] ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        [contenteditable] li {
          margin: 0.5rem 0;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        [contenteditable] p {
          margin: 0.75rem 0;
        }
      `}</style>
    </div>
  );
}