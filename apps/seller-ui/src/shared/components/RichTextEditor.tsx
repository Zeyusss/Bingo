"use client";
import React, { useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Image as ImageIcon,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    
    try {
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      
      
      const response = await axiosInstance.post('/blogs/upload-image', {
        file: base64Data,
        fileName: `blog-content-${Date.now()}-${file.name}`,
        folder: '/blogs/content'
      }, {
        requireAuth: true
      });
      
      if (response.data.success !== false) {
        
        const img = `<img src="${response.data.url}" alt="Blog content image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;" />`;
        handleCommand('insertHTML', img);
      } else {
        console.error('Image upload failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploadingImage(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    handleCommand('insertText', text);
  };

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Underline"
        >
          <Underline size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => handleCommand('justifyLeft')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleCommand('justifyCenter')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleCommand('justifyRight')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
          title="Insert Image"
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImageIcon size={16} />
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) handleCommand('createLink', url);
          }}
          className="p-2 hover:bg-gray-200 rounded"
          title="Insert Link"
        >
          <Link size={16} />
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleEditorChange}
        onPaste={handlePaste}
        className="min-h-[300px] p-4 focus:outline-none"
        style={{ wordWrap: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
