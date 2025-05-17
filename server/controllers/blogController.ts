import { Request, Response } from 'express';
import Blog from '../models/Blog.js';

// Get all blogs
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find().sort({ updatedAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single blog by ID
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save or update a draft
export const saveDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, title, content, tags } = req.body;
    
    // If id exists, update the blog, otherwise create a new one
    if (id) {
      const blog = await Blog.findByIdAndUpdate(
        id,
        { 
          title, 
          content, 
          tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
          status: 'draft' 
        },
        { new: true }
      );
      
      if (!blog) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }
      
      res.status(200).json(blog);
    } else {
      const newBlog = new Blog({
        title,
        content,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        status: 'draft'
      });
      
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Publish a blog
export const publishBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, title, content, tags } = req.body;
    
    // If id exists, update the blog, otherwise create a new one
    if (id) {
      const blog = await Blog.findByIdAndUpdate(
        id,
        { 
          title, 
          content, 
          tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
          status: 'published' 
        },
        { new: true }
      );
      
      if (!blog) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }
      
      res.status(200).json(blog);
    } else {
      const newBlog = new Blog({
        title,
        content,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        status: 'published'
      });
      
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    }
  } catch (error) {
    console.error('Error publishing blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
