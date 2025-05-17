import axios from 'axios';
import { BlogType } from '../types/blog';

const BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Get all blogs
  getBlogs: async (): Promise<BlogType[]> => {
    const response = await axios.get(`${BASE_URL}/blogs`);
    return response.data;
  },

  // Get a single blog by ID
  getBlogById: async (id: string): Promise<BlogType> => {
    const response = await axios.get(`${BASE_URL}/blogs/${id}`);
    return response.data;
  },

  // Save a draft
  saveDraft: async (blog: Partial<BlogType>): Promise<BlogType> => {
    const response = await axios.post(`${BASE_URL}/blogs/save-draft`, blog);
    return response.data;
  },

  // Publish a blog
  publishBlog: async (blog: Partial<BlogType>): Promise<BlogType> => {
    const response = await axios.post(`${BASE_URL}/blogs/publish`, blog);
    return response.data;
  }
};
