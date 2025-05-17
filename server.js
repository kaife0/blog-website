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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog-app';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(morgan('dev'));

// API Routes

// Get all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ updatedAt: -1 });
    res.status(200).json(blogs);
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
