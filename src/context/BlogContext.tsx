import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, type BlogTypeAPI } from '../services/api';

type BlogContextType = {
  blogs: BlogTypeAPI[];
  loading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  fetchBlog: (id: string) => Promise<BlogTypeAPI | null>;
  saveDraft: (blog: Partial<BlogTypeAPI>) => Promise<BlogTypeAPI | null>;
  updateBlog: (blog: Partial<BlogTypeAPI>) => Promise<BlogTypeAPI | null>;
  publishBlog: (blog: Partial<BlogTypeAPI>) => Promise<BlogTypeAPI | null>;
  deleteBlog: (id: string) => Promise<boolean>;
};

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [blogs, setBlogs] = useState<BlogTypeAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBlogs();
      setBlogs(data);
    } catch (err) {
      setError('Failed to fetch blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  const fetchBlog = async (id: string): Promise<BlogTypeAPI | null> => {
    setLoading(true);
    setError(null);
    
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`Fetching blog with ID: ${id} (Attempt ${retryCount + 1}/${maxRetries + 1})`);
        const blog = await api.getBlogById(id);
        console.log("Fetched blog from API:", blog);
        return blog;
      } catch (err: any) {
        console.error("Error fetching blog:", err);
        
        // If this is a timeout or network error, retry
        if (err.code === 'ECONNABORTED' || !err.response) {
          retryCount++;
          
          if (retryCount <= maxRetries) {
            console.log(`Retrying in ${retryCount * 1000}ms...`);
            // Wait a bit before retrying (progressive backoff)
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            continue;
          }
          
          // After max retries, try to get from localStorage
          try {
            const cachedBlog = localStorage.getItem(`blog_${id}`);
            if (cachedBlog) {
              console.log("Using cached blog data from localStorage");
              setLoading(false);
              return JSON.parse(cachedBlog);
            }
          } catch (storageError) {
            console.error("Error accessing localStorage:", storageError);
          }
        }
        
        setError('Failed to fetch blog');
        setLoading(false);
        return null;
      }
    }
    
    setLoading(false);
    return null;
  };
  const saveDraft = async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI | null> => {
    setLoading(true);
    setError(null);
    try {
      const savedBlog = await api.saveDraft(blog);
      
      // Update the blogs state
      setBlogs(prev => {
        // Check if the blog already exists in the list
        const existingBlogIndex = prev.findIndex(b => b._id === savedBlog._id);
        
        if (existingBlogIndex !== -1) {
          // Update existing blog
          const updatedBlogs = [...prev];
          updatedBlogs[existingBlogIndex] = savedBlog;
          return updatedBlogs;
        } else {
          // Add new blog if it's not in the list yet
          return [...prev, savedBlog];
        }
      });
      
      return savedBlog;
    } catch (err) {
      setError('Failed to save draft');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const updateBlog = async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI | null> => {
    setLoading(true);
    setError(null);
    try {
      // Ensure we have an ID
      if (!blog._id) {
        throw new Error('Blog ID is required for updates');
      }
      
      console.log(`Updating blog with ID: ${blog._id}`);
      const updatedBlog = await api.updateBlog(blog);
      
      // Update the blogs state
      setBlogs(prev => {
        const index = prev.findIndex(b => b._id === updatedBlog._id);
        if (index !== -1) {
          const updatedBlogs = [...prev];
          updatedBlogs[index] = updatedBlog;
          return updatedBlogs;
        }
        return prev;
      });
      
      return updatedBlog;
    } catch (err) {
      setError('Failed to update blog');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const publishBlog = async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI | null> => {
    setLoading(true);
    setError(null);
    try {
      const publishedBlog = await api.publishBlog(blog);
      
      // Update the blogs state if the blog exists in it
      setBlogs(prev => {
        const index = prev.findIndex(b => b._id === publishedBlog._id);
        if (index !== -1) {
          const updatedBlogs = [...prev];
          updatedBlogs[index] = publishedBlog;
          return updatedBlogs;
        }
        return [...prev, publishedBlog];
      });
      
      return publishedBlog;
    } catch (err) {
      setError('Failed to publish blog');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteBlog = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteBlog(id);
      
      // Remove the blog from the state
      setBlogs(prev => prev.filter(blog => blog._id !== id));
      
      return true;
    } catch (err) {
      setError('Failed to delete blog');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs on initial load
  useEffect(() => {
    fetchBlogs();
  }, []);
  return (
    <BlogContext.Provider
      value={{
        blogs,
        loading,
        error,
        fetchBlogs,
        fetchBlog,
        saveDraft,
        updateBlog,
        publishBlog,
        deleteBlog,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlogContext must be used within a BlogProvider');
  }
  return context;
};
