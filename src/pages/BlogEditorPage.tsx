import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RichTextEditor from '../components/RichTextEditor';
import SaveStatus from '../components/SaveStatus';
import { useBlogContext } from '../context/BlogContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { BlogType } from '../types/blog';

const BlogEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBlog, saveDraft, publishBlog } = useBlogContext();
  
  // Blog state
  const [blog, setBlog] = useState<Partial<BlogType>>({
    title: '',
    content: '',
    tags: [],
  });
  
  // UI state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch blog data if editing an existing blog
  useEffect(() => {
    const loadBlog = async () => {
      if (id && id !== 'new') {
        setLoading(true);
        try {
          const blogData = await fetchBlog(id);
          if (blogData) {
            setBlog({
              _id: blogData._id,
              title: blogData.title,
              content: blogData.content,
              tags: blogData.tags,
              status: blogData.status,
            });
          } else {
            toast.error('Blog not found');
            navigate('/');
          }
        } catch (error) {
          toast.error('Failed to load blog');
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadBlog();
  }, [id, fetchBlog, navigate]);

  // Handle input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlog(prev => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (content: string) => {
    setBlog(prev => ({ ...prev, content }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    setBlog(prev => ({ ...prev, tags: tagsArray }));
  };

  // Auto-save callbacks
  const handleSaveSuccess = useCallback((savedBlog: BlogType) => {
    setLastSaved(new Date());
    setSaving(false);
    
    // Update the blog's ID if it's a new blog
    if (!blog._id && savedBlog._id) {
      setBlog(prev => ({ ...prev, _id: savedBlog._id }));
      
      // Update the URL without reloading if we were on "new"
      if (id === 'new') {
        navigate(`/edit/${savedBlog._id}`, { replace: true });
      }
    }

    toast.success('Draft saved successfully');
  }, [blog._id, id, navigate]);

  const handleSaveError = useCallback((error: any) => {
    setSaving(false);
    toast.error('Failed to save draft');
    console.error(error);
  }, []);

  // Set up auto-save
  const { autoSave, saveDraft: triggerSave } = useAutoSave({
    blog,
    onSaveSuccess: handleSaveSuccess,
    onSaveError: handleSaveError,
    delay: 5000, // 5 seconds
  });

  // Trigger auto-save when blog changes
  useEffect(() => {
    // Only auto-save if we have a title or content
    if (blog.title || blog.content) {
      setSaving(true);
      autoSave();
    }
  }, [blog, autoSave]);

  // Handle manual save
  const handleSaveDraft = async () => {
    if (!blog.title && !blog.content) {
      toast.warning('Please add a title or content before saving');
      return;
    }

    setSaving(true);
    try {
      await triggerSave();
    } catch (error) {
      // Error is handled by the useAutoSave hook
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (!blog.title) {
      toast.warning('Please add a title before publishing');
      return;
    }

    if (!blog.content) {
      toast.warning('Please add content before publishing');
      return;
    }

    setSaving(true);
    try {
      const publishedBlog = await publishBlog(blog);
      if (publishedBlog) {
        setLastSaved(new Date());
        toast.success('Blog published successfully');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to publish blog');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading blog editor...</div>;
  }

  return (
    <div className="blog-editor-page">
      <div className="editor-header">
        <h1>{id === 'new' ? 'Create New Blog' : 'Edit Blog'}</h1>
        <div className="editor-actions">
          <SaveStatus lastSaved={lastSaved} saving={saving} />
          <button 
            className="save-draft-btn" 
            onClick={handleSaveDraft}
            disabled={saving}
          >
            Save as Draft
          </button>
          <button 
            className="publish-btn" 
            onClick={handlePublish}
            disabled={saving}
          >
            Publish
          </button>
        </div>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter blog title"
            value={blog.title || ''}
            onChange={handleTitleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <RichTextEditor 
            value={blog.content || ''} 
            onChange={handleContentChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            placeholder="e.g., technology, programming, react"
            value={blog.tags?.join(', ') || ''}
            onChange={handleTagsChange}
          />
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default BlogEditorPage;
