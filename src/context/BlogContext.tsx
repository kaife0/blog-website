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
  };

  const fetchBlog = async (id: string): Promise<BlogTypeAPI | null> => {
    setLoading(true);
    setError(null);
    try {
      const blog = await api.getBlogById(id);
      return blog;
    } catch (err) {
      setError('Failed to fetch blog');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI | null> => {
    setLoading(true);
    setError(null);
    try {
      const savedBlog = await api.saveDraft(blog);
      
      // Update the blogs state if the blog exists in it
      setBlogs(prev => {
        const index = prev.findIndex(b => b._id === savedBlog._id);
        if (index !== -1) {
          const updatedBlogs = [...prev];
          updatedBlogs[index] = savedBlog;
          return updatedBlogs;
        }
        return [...prev, savedBlog];
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
