// Server implementation with in-memory fallback
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define Blog schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt fields
  }
);

const Blog = mongoose.model('Blog', blogSchema);

// Set up in-memory database for testing
const setupInMemoryDatabase = () => {
  console.log('Setting up in-memory database...');
  global.inMemoryBlogs = [];
  
  // Create a more MongoDB-like query interface
  Blog.find = () => {
    return {
      sort: (sortOptions) => {
        const sortField = Object.keys(sortOptions)[0] || 'updatedAt';
        const sortDirection = sortOptions[sortField] || -1;
        
        return Promise.resolve([...global.inMemoryBlogs].sort((a, b) => {
          if (sortDirection === -1) {
            return new Date(b[sortField] || Date.now()).getTime() - new Date(a[sortField] || Date.now()).getTime();
          } else {
            return new Date(a[sortField] || Date.now()).getTime() - new Date(b[sortField] || Date.now()).getTime();
          }
        }));
      },
      // Allow direct awaiting of the query
      then: (resolve) => {
        resolve([...global.inMemoryBlogs]);
        return Promise.resolve([...global.inMemoryBlogs]);
      }
    };
  };
  
  Blog.findById = async (id) => {
    return global.inMemoryBlogs.find(blog => blog._id === id) || null;
  };
  
  Blog.findByIdAndUpdate = async (id, update, options) => {
    const index = global.inMemoryBlogs.findIndex(blog => blog._id === id);
    if (index === -1) return null;
    
    const updatedBlog = {
      ...global.inMemoryBlogs[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    
    global.inMemoryBlogs[index] = updatedBlog;
    return options?.new ? updatedBlog : global.inMemoryBlogs[index];
  };
  
  Blog.findByIdAndDelete = async (id) => {
    const index = global.inMemoryBlogs.findIndex(blog => blog._id === id);
    if (index === -1) return null;
    
    const deletedBlog = global.inMemoryBlogs[index];
    global.inMemoryBlogs.splice(index, 1);
    return deletedBlog;
  };
  
  // Mock the save method for Blog instances
  Blog.prototype.save = async function() {
    if (!this._id) {
      this._id = Math.random().toString(36).substring(2, 15);
      this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
      global.inMemoryBlogs.push(this);
    } else {
      const index = global.inMemoryBlogs.findIndex(blog => blog._id === this._id);
      if (index !== -1) {
        this.updatedAt = new Date().toISOString();
        global.inMemoryBlogs[index] = this;
      }
    }
    return this;
  };
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog-app';
    
    console.log('Connecting to MongoDB...');
    
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB Connected Successfully');
    } catch (mongoError) {
      console.error('MongoDB connection error:', mongoError);
      console.log('Continuing with in-memory storage for testing purposes');
      
      // Setup in-memory storage for testing
      setupInMemoryDatabase();
    }
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
};

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(morgan('dev'));

// API Routes

// Get all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ updatedAt: -1 });
    res.status(200).json(blogs || []);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save or update a draft
app.post('/api/blogs/save-draft', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;
    
    // If id exists, update the blog, otherwise create a new one
    if (id) {
      const blog = await Blog.findByIdAndUpdate(
        id,
        { 
          title, 
          content, 
          tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
          status: 'draft' 
        },
        { new: true }
      );
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      res.status(200).json(blog);
    } else {
      const newBlog = new Blog({
        title,
        content,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
        status: 'draft'
      });
      
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish a blog
app.post('/api/blogs/publish', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;
    
    // If id exists, update the blog, otherwise create a new one
    if (id) {
      const blog = await Blog.findByIdAndUpdate(
        id,
        { 
          title, 
          content, 
          tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
          status: 'published' 
        },
        { new: true }
      );
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      res.status(200).json(blog);
    } else {
      const newBlog = new Blog({
        title,
        content,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
        status: 'published'
      });
      
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    }
  } catch (error) {
    console.error('Error publishing blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a blog
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
