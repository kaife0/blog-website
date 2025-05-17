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
    
    // Process tags - ensure it's always an array
    const processedTags = Array.isArray(tags) 
      ? tags 
      : typeof tags === 'string' 
        ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];
    
    console.log(`${id ? 'Updating' : 'Creating'} blog draft:`, { 
      id, 
      title: title?.substring(0, 30) + '...',
      contentLength: content?.length || 0,
      tags: processedTags 
    });

    // If id exists, update the blog, otherwise create a new one
    if (id) {
      const blog = await Blog.findByIdAndUpdate(
        id,
        { 
          title, 
          content, 
          tags: processedTags,
          status: 'draft' 
        },
        { new: true }
      );
      
      if (!blog) {
        console.log(`Blog with ID ${id} not found for update`);
        res.status(404).json({ message: 'Blog not found' });
        return;
      }
      
      console.log(`Successfully updated blog: ${id}`);
      res.status(200).json(blog);
    } else {      const newBlog = new Blog({
        title,
        content,
        tags: processedTags,
        status: 'draft'
      });
      
      const savedBlog = await newBlog.save();
      console.log(`Created new blog with ID: ${savedBlog._id}`);
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
    
    // Process tags - ensure it's always an array
    const processedTags = Array.isArray(tags) 
      ? tags 
      : typeof tags === 'string' 
        ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];
    
    // If id exists, update the blog, otherwise create a new one
    if (id) {
      const blog = await Blog.findByIdAndUpdate(
        id,
        { 
          title, 
          content, 
          tags: processedTags,
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
        tags: processedTags,
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
