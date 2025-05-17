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

  // Save function
  const saveDraft = useCallback(async () => {
    if (!blog.title && !blog.content) {
      return; // Don't save if both title and content are empty
    }

    if (isSavingRef.current) {
      return; // Don't save if already saving
    }

    try {
      isSavingRef.current = true;
      const savedBlog = await api.saveDraft(blog);
      onSaveSuccess?.(savedBlog);
    } catch (error) {
      onSaveError?.(error);
    } finally {
      isSavingRef.current = false;
    }
  }, [blog, onSaveSuccess, onSaveError]);

  // Auto-save function that triggers after a delay
  const autoSave = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, delay);
  }, [delay, saveDraft]);

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
