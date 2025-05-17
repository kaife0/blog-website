import React from 'react';
import { Link } from 'react-router-dom';
import { BlogType } from '../types/blog';

interface BlogListProps {
  blogs: BlogType[];
  title: string;
  emptyMessage?: string;
}

const BlogList: React.FC<BlogListProps> = ({ 
  blogs, 
  title, 
  emptyMessage = 'No blogs found' 
}) => {
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
                {blog.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <Link to={`/edit/${blog._id}`} className="edit-link">
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
