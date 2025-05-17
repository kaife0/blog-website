import express from 'express';
import { getBlogs, getBlogById, saveDraft, publishBlog } from '../controllers/blogController.js';

const router = express.Router();

// Get all blogs
router.get('/', getBlogs);

// Get blog by ID
router.get('/:id', getBlogById);

// Save draft
router.post('/save-draft', saveDraft);

// Publish blog
router.post('/publish', publishBlog);

export default router;
