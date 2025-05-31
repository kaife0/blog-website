import express from 'express';
import { getBlogs, getBlogById, saveDraft, publishBlog, deleteBlog } from '../controllers/blogController.js';

const router = express.Router();

// Get all blogs
router.get('/', getBlogs);

// Get blog by ID
router.get('/:id', getBlogById);

// Save draft (create new blog)
router.post('/save-draft', saveDraft);

// Update blog (edit existing blog)
router.patch('/update/:id', (req, res) => {
  // Add the id from params to the body
  req.body.id = req.params.id;
  saveDraft(req, res);
});

// Publish blog
router.post('/publish', publishBlog);

// Delete blog
router.delete('/:id', deleteBlog);

export default router;
