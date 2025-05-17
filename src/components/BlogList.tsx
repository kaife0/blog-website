// filepath: c:\study\revoltronX aasignment\src\components\BlogList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { BlogTypeAPI } from '../services/api';
import { useBlogContext } from '../context/BlogContext';

interface BlogListProps {
  blogs: BlogTypeAPI[];
  title: string;
  emptyMessage?: string;
}

const BlogList: React.FC<BlogListProps> = ({ 
  blogs, 
  title, 
  emptyMessage = 'No blogs found' 
}) => {
  const { deleteBlog } = useBlogContext();
  
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const success = await deleteBlog(id);
      if (success) {
        toast.success('Blog deleted successfully');
      } else {
        toast.error('Failed to delete blog');
      }
    }
  };
  return (
    <div className="blog-list">
      <h2>{title}</h2>
      {blogs.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <h3>{blog.title || 'Untitled'}</h3>
              <p className="blog-meta">
                Last updated: {new Date(blog.updatedAt).toLocaleDateString()}
              </p>
              <div className="blog-tags">
                {blog.tags.map((tag: string, index: number) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}              </div>
              <div className="blog-actions">
                <Link to={`/edit/${blog._id}`} className="edit-link">
                  Edit
                </Link>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(blog._id, blog.title)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
