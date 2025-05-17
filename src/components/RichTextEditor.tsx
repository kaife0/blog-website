import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceTime?: number;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'color', 'background',
  'link', 'image'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Write your content here...',
  debounceTime = 300 // Default debounce of 300ms
}) => {
  const [editorContent, setEditorContent] = useState(value || '');
  const quillRef = useRef<ReactQuill>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef<boolean>(false);
  
  // Update local state when value prop changes, but only when it's actually different
  useEffect(() => {
    // Skip during initialization
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    
    if (value !== editorContent) {
      console.log("Editor content updated from prop:", { new: value, old: editorContent });
      setEditorContent(value || '');
    }
  }, [value]);
  
  // Handle editor change with debounce
  const handleChange = useCallback((content: string) => {
    setEditorContent(content);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debounce
    timeoutRef.current = setTimeout(() => {
      console.log("Debounced change:", content);
      onChange(content);
    }, debounceTime);
  }, [onChange, debounceTime]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="rich-text-editor-container">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorContent}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: '400px', marginBottom: '50px' }}
      />
    </div>
  );
};

export default RichTextEditor;


