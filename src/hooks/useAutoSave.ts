import { useEffect, useRef, useCallback } from 'react';
import type { BlogType } from '../types/blog';
import { api } from '../services/api';

type AutoSaveProps = {
  blog: Partial<BlogType>;
  onSaveSuccess?: (savedBlog: BlogType) => void;
  onSaveError?: (error: any) => void;
  delay?: number;
};

export const useAutoSave = ({
  blog,
  onSaveSuccess,
  onSaveError,
  delay = 5000,
}: AutoSaveProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSavingRef = useRef<boolean>(false);
  const isManualSavingRef = useRef<boolean>(false);
  const lastSavedContentRef = useRef<string>('');
  const lastSavedTitleRef = useRef<string>('');
  const hasInitialSaveRef = useRef<boolean>(false);

  // Save function
  const saveDraft = useCallback(async (force = false) => {
    if (!blog.title && !blog.content) {
      console.log("Skipping save - no content to save");
      return null;
    }

    // For auto-saves, check if any save is in progress
    // For manual saves (force=true), proceed even if auto-save is in progress
    if (!force && (isAutoSavingRef.current || isManualSavingRef.current)) {
      console.log("Save in progress, skipping this auto-save request");
      return null;
    }

    try {
      // Set the appropriate saving flag
      if (force) {
        isManualSavingRef.current = true;
      } else {
        isAutoSavingRef.current = true;
      }

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

      // Use the appropriate API method
      let savedBlog;
      if (blog._id) {
        savedBlog = await api.updateBlog(blog);
      } else {
        savedBlog = await api.saveDraft(blog);
      }

      // Update refs
      lastSavedTitleRef.current = savedBlog.title;
      lastSavedContentRef.current = savedBlog.content;
      hasInitialSaveRef.current = true;

      // Clear the backup since we successfully saved
      if (blog._id) {
        try {
          localStorage.removeItem(`blog_backup_${blog._id}`);
        } catch (e) {
          // Ignore errors here
        }
      }

      onSaveSuccess?.(savedBlog);
      return savedBlog;

    } catch (error: any) {
      console.error("Error saving draft:", error);
      
      if (error.isNetworkError || error.code === 'ECONNABORTED') {
        const localSavedVersion = {
          ...blog as BlogType,
          _id: blog._id || `local_${Date.now()}`,
          updatedAt: new Date().toISOString(),
          _localSave: true
        };
        onSaveSuccess?.(localSavedVersion);
        return localSavedVersion;
      }
      
      onSaveError?.(error);
      return null;
    } finally {
      // Clear the appropriate saving flag
      if (force) {
        isManualSavingRef.current = false;
      } else {
        isAutoSavingRef.current = false;
      }
    }
  }, [blog, onSaveSuccess, onSaveError]);

  // Auto-save function
  const autoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await saveDraft(false);
      } catch (error) {
        console.error("Error in autoSave:", error);
        onSaveError?.(error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, saveDraft, onSaveError]);

  useEffect(() => {
    if (blog._id && !hasInitialSaveRef.current) {
      lastSavedTitleRef.current = blog.title || '';
      lastSavedContentRef.current = blog.content || '';
      hasInitialSaveRef.current = true;
    }
  }, [blog]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { autoSave, saveDraft };
};
