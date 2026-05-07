'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const HEADING_OPTIONS = [
  { level: 0 as const, label: 'Paragraph', icon: 'P', style: 'text-sm font-normal' },
  { level: 1 as const, label: 'Heading 1', icon: 'H1', style: 'text-lg font-bold' },
  { level: 2 as const, label: 'Heading 2', icon: 'H2', style: 'text-base font-bold' },
  { level: 3 as const, label: 'Heading 3', icon: 'H3', style: 'text-sm font-bold' },
  { level: 4 as const, label: 'Heading 4', icon: 'H4', style: 'text-xs font-bold' },
  { level: 5 as const, label: 'Heading 5', icon: 'H5', style: 'text-xs font-semibold' },
  { level: 6 as const, label: 'Heading 6', icon: 'H6', style: 'text-xs font-medium' },
];

export default function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const [headingOpen, setHeadingOpen] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const headingRef = useRef<HTMLDivElement>(null);

  const extensions = useMemo(() => [
    StarterKit,
    Placeholder.configure({
      placeholder: placeholder || 'Start writing your content...',
    }),
    Link.configure({
      openOnClick: false,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Highlight.configure({
      multicolor: true,
    }),
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      if (isHtmlMode) {
        setHtmlContent(html);
      }
    },
  });

  useEffect(() => {
    if (isHtmlMode && editor) {
      setHtmlContent(editor.getHTML());
    }
  }, [isHtmlMode, editor]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headingRef.current && !headingRef.current.contains(event.target as Node)) {
        setHeadingOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return HEADING_OPTIONS[1];
    if (editor.isActive('heading', { level: 2 })) return HEADING_OPTIONS[2];
    if (editor.isActive('heading', { level: 3 })) return HEADING_OPTIONS[3];
    if (editor.isActive('heading', { level: 4 })) return HEADING_OPTIONS[4];
    if (editor.isActive('heading', { level: 5 })) return HEADING_OPTIONS[5];
    if (editor.isActive('heading', { level: 6 })) return HEADING_OPTIONS[6];
    return HEADING_OPTIONS[0];
  };

  const setHeading = (level: number) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const isCollapsed = from === to;
    
    if (isCollapsed) {
      const pos = editor.state.selection.from;
      const $pos = editor.state.doc.resolve(pos);
      const node = $pos.parent;
      
      if (level === 0) {
        if (node.type.name === 'paragraph') return;
        editor.chain()
          .setTextSelection({ from: pos, to: pos })
          .setParagraph()
          .setTextSelection(pos)
          .run();
      } else {
        const targetLevel = level as 1 | 2 | 3 | 4 | 5 | 6;
        if (node.type.name === 'heading' && node.attrs.level === targetLevel) return;
        
        editor.chain()
          .setTextSelection({ from: pos, to: pos })
          .setHeading({ level: targetLevel })
          .setTextSelection(pos)
          .run();
      }
    } else {
      if (level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
      }
    }
    
    setHeadingOpen(false);
  };

  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editor) return;
    
    const html = e.target.value;
    setHtmlContent(html);
    onChange(html);
    editor.commands.setContent(html);
  };

  const currentHeading = getCurrentHeading();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-1">
          <div ref={headingRef} className="relative">
            <button
              type="button"
              onClick={() => setHeadingOpen(!headingOpen)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[80px]"
            >
              <span className={currentHeading.style}>{currentHeading.icon}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {headingOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                {HEADING_OPTIONS.map((option) => {
                  const isActive = option.level === 0 
                    ? !editor.isActive('heading')
                    : editor.isActive('heading', { level: option.level });
                  
                  return (
                    <button
                      key={option.level}
                      type="button"
                      onClick={() => setHeading(option.level)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className={`${option.style} w-6 text-center`}>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
            icon="B"
            className="font-bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
            icon="I"
            className="italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
            icon="U"
            className="underline"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v6m0 4v6M4 12h16" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            }
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            isActive={false}
            title="Horizontal Line"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
              </svg>
            }
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
              </svg>
            }
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            }
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!editor) return;
              
              if (!isHtmlMode) {
                setHtmlContent(editor.getHTML());
              } else {
                editor.commands.setContent(htmlContent);
              }
              setIsHtmlMode(!isHtmlMode);
            }}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isHtmlMode 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {isHtmlMode ? 'Rich Text' : 'HTML'}
          </button>
        </div>
      </div>

      {isHtmlMode ? (
        <div className="p-2">
          <textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className="w-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            placeholder="Enter HTML code..."
          />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  title: string;
  icon: React.ReactNode | string;
  className?: string;
}

function ToolbarButton({ onClick, isActive, disabled, title, icon, className = '' }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-colors
        ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {typeof icon === 'string' ? (
        <span className={`text-base ${className}`}>{icon}</span>
      ) : (
        icon
      )}
    </button>
  );
}
