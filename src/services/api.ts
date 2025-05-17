import axios from 'axios';

export interface BlogTypeAPI {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Get all blogs
  getBlogs: async (): Promise<BlogTypeAPI[]> => {
    try {
      const response = await apiClient.get('/blogs');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      return [];
    }
  },
  // Get a single blog by ID
  getBlogById: async (id: string): Promise<BlogTypeAPI> => {
    try {
      const response = await apiClient.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch blog with ID ${id}:`, error);
      throw error;
    }
  },

  // Save a draft
  saveDraft: async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI> => {
    try {
      const response = await apiClient.post(`/blogs/save-draft`, blog);
      return response.data;
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  },  // Publish a blog
  publishBlog: async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI> => {
    try {
      const response = await apiClient.post(`/blogs/publish`, blog);
      return response.data;
    } catch (error) {
      console.error('Failed to publish blog:', error);
      throw error;
    }
  },
  
  // Delete a blog
  deleteBlog: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/blogs/${id}`);
    } catch (error) {
      console.error(`Failed to delete blog with ID ${id}:`, error);
      throw error;
    }
  }
};
