import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RichTextEditor from '../components/RichTextEditor';
import SaveStatus from '../components/SaveStatus';
import { useBlogContext } from '../context/BlogContext';
import { useAutoSave } from '../hooks/useAutoSave';
import type { BlogType } from '../types/blog';

const BlogEditorPage: React.FC = () => {  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBlog, publishBlog, updateBlog } = useBlogContext();
  
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
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);// Fetch blog data if editing an existing blog
  useEffect(() => {
    const loadBlog = async () => {
      if (id && id !== 'new') {
        setLoading(true);
        try {
          console.log("Loading blog with ID:", id);
          const blogData = await fetchBlog(id);
          
          if (blogData) {
            console.log("Blog data loaded:", blogData);
            // Populate form with existing blog data
            setBlog({
              _id: blogData._id,
              title: blogData.title || '',
              content: blogData.content || '',
              tags: blogData.tags || [],
              status: blogData.status,
            });
            
            // Initialize last saved state for existing blog
            setLastSaved(new Date(blogData.updatedAt || Date.now()));
          } else {
            // Handle the case where blog data couldn't be fetched
            toast.error('Error loading blog data. Using cached version if available.');
            
            // Check if we have a cached version in localStorage
            try {
              const cachedBlog = localStorage.getItem(`blog_${id}`);
              if (cachedBlog) {
                const parsedBlog = JSON.parse(cachedBlog);
                setBlog({
                  _id: parsedBlog._id,
                  title: parsedBlog.title || '',
                  content: parsedBlog.content || '',
                  tags: parsedBlog.tags || [],
                  status: parsedBlog.status,
                });
                setLastSaved(new Date(parsedBlog.updatedAt || Date.now()));
                toast.info('Using cached version of the blog');
              } else {
                toast.error('No cached version found. Redirecting to home.');
                navigate('/');
              }
            } catch (storageError) {
              console.error("Error accessing localStorage:", storageError);
              toast.error('Blog not found');
              navigate('/');
            }
          }        } catch (error) {
          console.error("Error loading blog:", error);
          setError('Failed to load blog. Check your connection and try again.');
          toast.error('Failed to load blog. Check your connection and try again.');
          // Stay on the page to let the user try again instead of immediately redirecting
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
  };  // Auto-save callbacks
  const handleSaveSuccess = useCallback((savedBlog: BlogType) => {
    setLastSaved(new Date());
    setSaving(false);
    
    // Check if this was a local save without server connection
    const isLocalSave = (savedBlog as any)._localSave;
    
    // Update the blog's ID if it's a new blog
    if (!blog._id && savedBlog._id) {
      console.log("New blog saved with ID:", savedBlog._id);
      setBlog(prev => ({ 
        ...prev, 
        _id: savedBlog._id 
      }));
      
      // Update the URL without reloading if we were on "new"
      if (id === 'new' && !isLocalSave) {
        navigate(`/edit/${savedBlog._id}`, { replace: true });
      }
    }

    // Show different message based on if it was saved locally or to server
    if (isLocalSave) {
      toast.info('Changes saved locally (offline mode)');
    } else {
      toast.success('Draft saved successfully');
    }
  }, [blog._id, id, navigate]);
  const handleSaveError = useCallback((error: any) => {
    setSaving(false);
    
    // Show a more specific error message based on the type of error
    if (error.isNetworkError || error.code === 'ECONNABORTED') {
      toast.warning('Network issue detected. Changes saved locally.');
    } else if (error.response && error.response.status === 404) {
      toast.error('Blog not found on server. Please recreate it.');
    } else if (error.response && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error('Failed to save draft');
    }
    
    console.error("Save error details:", error);
  }, []);

  // Set up auto-save
  const { autoSave, saveDraft: triggerSave } = useAutoSave({
    blog,
    onSaveSuccess: handleSaveSuccess,
    onSaveError: handleSaveError,
    delay: 5000, // 5 seconds
  });  // Trigger auto-save when blog changes
  useEffect(() => {
    // Only auto-save if:
    // 1. We have a title or content
    // 2. We're not in the initial loading state
    // 3. There has been actual user input (not just component mounting)
    const hasMeaningfulContent = 
      (blog.title && blog.title.trim().length > 0) || 
      (blog.content && blog.content.trim().length > 0);
    
    if (hasMeaningfulContent && !loading) {
      setSaving(true);
      autoSave();
    }
  }, [blog.title, blog.content, blog.tags, autoSave, loading]);

  // Handle back button click
  const handleBackClick = () => {
    navigate('/');
  };  // Handle manual save
  const handleSaveDraft = async () => {
    if (!blog.title && !blog.content) {
      toast.warning('Please add a title or content before saving');
      return;
    }

    setSaving(true);
    console.log("Manual save triggered for blog:", blog);
    try {
      if (blog._id) {
        // Use the dedicated update method for existing blogs
        const result = await updateBlog(blog);
        if (result) {
          toast.success('Blog updated successfully');
          setLastSaved(new Date());
        } else {
          toast.error('Failed to update blog');
        }
      } else {
        // Use auto-save logic for new blogs
        await triggerSave(true); // Force save
      }
    } catch (error) {
      console.error("Error during manual save:", error);
      toast.error('Failed to save blog');
      // Error is handled by the useAutoSave hook
    } finally {
      setSaving(false);
    }
  };  // Handle publish
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
      // First make sure we've saved any pending changes
      let blogToPublish = { ...blog };
      
      // If we don't have an ID yet, we need to save first
      if (!blogToPublish._id) {
        console.log("Saving blog before publishing...");
        const savedBlog = await triggerSave(true);
        
        if (!savedBlog || !savedBlog._id) {
          toast.error('Failed to save blog before publishing');
          setSaving(false);
          return;
        }
        
        // Update with the saved blog ID
        blogToPublish = savedBlog;
      }
      
      console.log("Publishing blog:", blogToPublish);
      const publishedBlog = await publishBlog(blogToPublish);
      
      if (publishedBlog) {
        setLastSaved(new Date());
        toast.success('Blog published successfully');
        navigate('/');
      } else {
        toast.error('Failed to publish blog');
      }
    } catch (error) {
      toast.error('Failed to publish blog');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading blog editor...</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <div className="error-actions">
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
          <button className="back-btn" onClick={handleBackClick}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-editor-page">      <div className="editor-header">
        <div className="header-left">          <button 
            className="back-btn" 
            onClick={handleBackClick}
          >
            ← Back to Home
          </button>
          <h1>{id === 'new' ? 'Create New Blog' : 'Edit Blog'}</h1>
        </div>
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
          <button 
            className="preview-btn" 
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div><div className="editor-form">
        {showPreview ? (
          <div className="blog-preview">
            <h2 className="preview-title">{blog.title || 'Untitled'}</h2>
            {blog.tags && blog.tags.length > 0 && (
              <div className="preview-tags">
                {blog.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <div 
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: blog.content || '' }}
            />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default BlogEditorPage;
