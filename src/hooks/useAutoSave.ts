import { useEffect, useRef, useCallback } from 'react';
import type { BlogType } from '../types/blog';
import { api } from '../services/api';

type AutoSaveProps = {
  blog: Partial<BlogType>;
  onSaveSuccess?: (savedBlog: BlogType) => void;
  onSaveError?: (error: any) => void;
  delay?: number; // Delay in milliseconds
};

export const useAutoSave = ({
  blog,
  onSaveSuccess,
  onSaveError,
  delay = 5000, // Default to 5 seconds
}: AutoSaveProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const lastSavedContentRef = useRef<string>('');
  const lastSavedTitleRef = useRef<string>('');
  const hasInitialSaveRef = useRef<boolean>(false);

  // For debugging
  useEffect(() => {
    if (blog._id) {
      console.log("Blog ID in useAutoSave:", blog._id);
    }
  }, [blog._id]);  // Save function
  const saveDraft = useCallback(async (force = false) => {
    // Don't save if both title and content are empty
    if (!blog.title && !blog.content) {
      console.log("Skipping save - no content to save");
      return null; // Return null to indicate no save was performed
    }

    // Don't save if already saving
    if (isSavingRef.current) {
      console.log("Already saving, skipping this save request");
      return null;
    }

    // Clean up content for comparison (handle null/undefined)
    const currentTitle = blog.title || '';
    const currentContent = blog.content || '';
    const savedTitle = lastSavedTitleRef.current || '';
    const savedContent = lastSavedContentRef.current || '';

    // For existing blogs, only save if content or title changed
    const titleChanged = currentTitle !== savedTitle;
    const contentChanged = currentContent !== savedContent;
    
    console.log("Blog status:", {
      id: blog._id,
      titleChanged,
      contentChanged,
      force
    });
    
    // Skip saving if nothing has changed and not forced
    if (blog._id && !titleChanged && !contentChanged && !force) {
      console.log("Skipping save - no changes detected for existing blog");
      return null;
    }
    
    // For new blogs, make sure we have meaningful content before saving
    if (!blog._id) {
      const hasMeaningfulContent = (blog.title && blog.title.trim().length > 0) || 
                                  (blog.content && blog.content.trim().length > 0);
      
      // If we already did an initial save, only save again if content changed meaningfully
      if (hasInitialSaveRef.current && !force && !titleChanged && !contentChanged) {
        console.log("Skipping save - no changes detected for new blog");
        return null;
      }
      
      // If we don't have meaningful content, don't save yet unless forced
      if (!hasMeaningfulContent && !force) {
        console.log("Skipping save - no meaningful content for new blog");
        return null;
      }
    }  try {
      isSavingRef.current = true;
      console.log("Saving blog:", blog);
      
      // Save to localStorage as backup before API call
      if (blog._id) {
        try {
          localStorage.setItem(`blog_backup_${blog._id}`, JSON.stringify({
            ...blog,
            _saveTime: new Date().toISOString()
          }));
        } catch (storageError) {
          console.warn("Failed to backup to localStorage:", storageError);
        }
      }
      
      // Use the appropriate API method based on whether this is new or existing blog
      let savedBlog;
      if (blog._id) {
        console.log("Updating existing blog:", blog._id);
        savedBlog = await api.updateBlog(blog); // Use updateBlog for existing blogs
      } else {
        console.log("Creating new blog");
        savedBlog = await api.saveDraft(blog);
      }
      
      // Update refs
      lastSavedTitleRef.current = savedBlog.title;
      lastSavedContentRef.current = savedBlog.content;
      hasInitialSaveRef.current = true;
      
      // Clear the backup since we successfully saved to server
      if (blog._id) {
        try {
          localStorage.removeItem(`blog_backup_${blog._id}`);
        } catch (e) {
          // Ignore errors here
        }
      }
        onSaveSuccess?.(savedBlog);
      return savedBlog; // Return the saved blog    
    } catch (error: any) {
      console.error("Error saving draft:", error);
      
      // If this is a network error, we still want to indicate we "saved" locally
      if (error.isNetworkError || error.code === 'ECONNABORTED') {
        const localSavedVersion = {
          ...blog as BlogType,
          _id: blog._id || `local_${Date.now()}`,
          updatedAt: new Date().toISOString(),
          _localSave: true
        };
        
        onSaveSuccess?.(localSavedVersion);
        return localSavedVersion; // Return the local version too
      }
      
      onSaveError?.(error);
      return null; // Return null to indicate save failed
    } finally {
      isSavingRef.current = false;
    }
  }, [blog, onSaveSuccess, onSaveError]);  // Auto-save function that triggers after a delay
  const autoSave = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveDraft();
      } catch (error) {
        console.error("Error in autoSave:", error);
        // Prevent the hook from crashing by catching errors
        onSaveError?.(error);
      }
    }, delay);
    
    // Return a function to cancel the save if needed
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, saveDraft, onSaveError]);

  // Initialize refs when blog changes
  useEffect(() => {
    if (blog._id && !hasInitialSaveRef.current) {
      lastSavedTitleRef.current = blog.title || '';
      lastSavedContentRef.current = blog.content || '';
      hasInitialSaveRef.current = true;
    }
  }, [blog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { autoSave, saveDraft };
};
