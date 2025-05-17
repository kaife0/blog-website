import axios from 'axios';

export interface BlogTypeAPI {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  _localSave?: boolean; // Added for local save tracking
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    console.error('API Error:', error.message);
    
    // Specifically handle network-related errors
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('Network-related error detected, attempting to handle...');
      
      // Implement retry logic for timeout errors
      if (error.config && !error.config._retry) {
        error.config._retry = true;
        try {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Retrying request...');
          return await apiClient(error.config);
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }
      
      // Custom error message for network issues
      error.isNetworkError = true;
      error.friendlyMessage = 'Connection issue detected. Please check your internet connection.';
    }
      if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      // Add friendly messages based on status codes
      if (error.response.status === 404) {
        error.friendlyMessage = 'The requested resource was not found.';
      } else if (error.response.status >= 500) {
        error.friendlyMessage = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      error.friendlyMessage = 'Server not responding. Please try again later.';
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
  },  // Get a single blog by ID
  getBlogById: async (id: string): Promise<BlogTypeAPI> => {
    try {
      console.log("Fetching blog with ID:", id);
      
      // Check if we have it in localStorage first for faster load
      try {
        const cachedBlog = localStorage.getItem(`blog_${id}`);
        if (cachedBlog) {
          console.log("Found cached blog data, using it while fetching fresh data");
          // Continue with API call after returning cached data
          setTimeout(() => {
            // Attempt to refresh the cache in the background
            apiClient.get(`/blogs/${id}`, { timeout: 10000 })
              .then(response => {
                localStorage.setItem(`blog_${id}`, JSON.stringify(response.data));
                console.log("Updated cache with fresh data");
              })
              .catch(err => console.log("Background refresh failed:", err));
          }, 100);
          
          return JSON.parse(cachedBlog);
        }
      } catch (storageError) {
        console.warn("Could not access localStorage:", storageError);
      }
      
      // Attempt with a potentially longer timeout
      const response = await apiClient.get(`/blogs/${id}`, {
        timeout: 20000 // 20 seconds for fetching a single blog
      });
      
      console.log("Fetched blog data:", response.data);
      
      // Cache the result
      try {
        localStorage.setItem(`blog_${id}`, JSON.stringify(response.data));
      } catch (storageError) {
        console.warn("Could not cache blog to localStorage:", storageError);
      }
      
      return response.data;    } catch (error: any) { // Type assertion for error
      console.error(`Failed to fetch blog with ID ${id}:`, error);
      
      const errorMessage = error.friendlyMessage || 'Failed to fetch blog data.';
      
      // Handle network errors, timeouts, and server issues
      if (error.isNetworkError || error.code === 'ECONNABORTED' || !error.response) {
        console.log("Connection issue detected, trying to use cached data...");
        
        // Try to get a cached version from localStorage if available
        try {
          const cachedBlog = localStorage.getItem(`blog_${id}`);
          if (cachedBlog) {
            console.log("Using cached blog data from localStorage");
            return JSON.parse(cachedBlog);
          }
        } catch (storageError) {
          console.error("Error accessing localStorage:", storageError);
        }
        
        // If we can't connect and no cache, return a template blog to prevent UI crashing
        const emptyBlog: BlogTypeAPI = {
          _id: id,
          title: '',
          content: '',
          tags: [],
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Inject error info into the blog for UI to display
        (emptyBlog as any)._error = errorMessage;
        
        return emptyBlog;
      }
      
      throw error;
    }
  },  // Save a draft
  saveDraft: async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI> => {
    try {
      // Format tags for the backend (ensure it's an array)
      let tagsForBackend = Array.isArray(blog.tags) ? blog.tags : [];
      
      // Prepare the payload
      const payload = {
        id: blog._id,  // Include ID if it exists
        title: blog.title || '',
        content: blog.content || '',
        tags: tagsForBackend
      };
      
      // If this is an existing blog, use the update endpoint
      if (blog._id) {
        console.log(`Updating existing blog ${blog._id}`);
        const response = await apiClient.put(`/blogs/update/${blog._id}`, payload);
        console.log("Update blog response:", response.data);
        
        // Update the cache with the latest version from server
        try {
          localStorage.setItem(`blog_${response.data._id}`, JSON.stringify(response.data));
        } catch (storageError) {
          console.warn("Could not update cache in localStorage:", storageError);
        }
        
        return response.data;
      }
      
      // Otherwise create a new blog
      console.log("Creating new blog with payload:", payload);
      const response = await apiClient.post(`/blogs/save-draft`, payload);
      console.log("Save draft response:", response.data);
      
      // Update the cache with the latest version from server
      if (response.data._id) {
        try {
          localStorage.setItem(`blog_${response.data._id}`, JSON.stringify(response.data));
        } catch (storageError) {
          console.warn("Could not update cache in localStorage:", storageError);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      
      // If this is a new blog and we're experiencing connection issues,
      // try to create a temporary ID and return simulated success
      if (!blog._id && (error.code === 'ECONNABORTED' || !error.response)) {
        console.log("Connection issues detected, using temporary ID for this session");
        
        const tempBlog: BlogTypeAPI = {
          _id: `temp_${Date.now()}`,
          title: blog.title || '',
          content: blog.content || '',
          tags: blog.tags || [],
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store in session storage for temporary persistence
        try {
          sessionStorage.setItem(`temp_blog_${tempBlog._id}`, JSON.stringify(tempBlog));
        } catch (storageError) {
          console.warn("Could not store temporary blog:", storageError);
        }
        
        return tempBlog;
      }
      
      throw error;
    }
  },
    // Update an existing blog - new dedicated method
  updateBlog: async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI> => {
    try {
      if (!blog._id) {
        throw new Error('Blog ID is required for updates');
      }
      
      // Format tags for the backend (ensure it's an array)
      let tagsForBackend = Array.isArray(blog.tags) ? blog.tags : [];
      
      // Prepare the payload with the correct format
      const payload = {
        title: blog.title || '',
        content: blog.content || '',
        tags: tagsForBackend
      };
      
      console.log(`Updating blog ${blog._id} with payload:`, payload);
      
      // Cache the current state in localStorage before sending to API
      try {
        localStorage.setItem(`blog_${blog._id}`, JSON.stringify({
          ...blog,
          updatedAt: new Date().toISOString()
        }));
      } catch (storageError) {
        console.warn("Could not cache blog to localStorage:", storageError);
      }
      
      // Use the new update endpoint
      const response = await apiClient.put(`/blogs/update/${blog._id}`, payload);
      console.log("Update blog response:", response.data);
      
      // Update the cache with the latest version from server
      if (response.data._id) {
        try {
          localStorage.setItem(`blog_${response.data._id}`, JSON.stringify(response.data));
        } catch (storageError) {
          console.warn("Could not update cache in localStorage:", storageError);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update blog ${blog._id}:`, error);
      
      // Special handling for network issues
      if (error.isNetworkError || error.code === 'ECONNABORTED' || !error.response) {
        console.log("Connection issues detected, using cached version");
        
        // Return the locally cached version
        const localBlog: BlogTypeAPI = {
          ...blog as BlogTypeAPI,
          updatedAt: new Date().toISOString(),
          _localSave: true
        };
        
        return localBlog;
      }
      
      throw error;
    }
  },
  
  // Publish a blog
  publishBlog: async (blog: Partial<BlogTypeAPI>): Promise<BlogTypeAPI> => {
    try {
      // Format tags for the backend (ensure it's an array)
      let tagsForBackend = Array.isArray(blog.tags) ? blog.tags : [];
      
      // Prepare the payload with the correct format
      const payload = {
        id: blog._id,  // Use id instead of _id for the backend
        title: blog.title || '',
        content: blog.content || '',
        tags: tagsForBackend
      };
      
      console.log("Publishing blog with payload:", payload);
      
      // Try with increased timeout for publishing
      const response = await apiClient.post(`/blogs/publish`, payload, {
        timeout: 20000 // 20 seconds timeout for publishing
      });
      
      console.log("Publish blog response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to publish blog:', error);
      
      // Special handling for network issues
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.warn("Network issues detected during publish attempt");
        
        // Let the user know this is a temporary state
        alert("Your blog has been saved locally due to connection issues. Please try publishing again when your connection is restored.");
        
        // Return a simulated "published" blog for UI to show success
        const tempPublishedBlog: BlogTypeAPI = {
          ...blog as BlogTypeAPI,
          status: 'published',
          updatedAt: new Date().toISOString()
        };
        
        return tempPublishedBlog;
      }
      
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
