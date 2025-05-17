import React from 'react';
import { Link } from 'react-router-dom';
import { useBlogContext } from '../context/BlogContext';
import BlogList from '../components/BlogList';

const HomePage: React.FC = () => {
  const { blogs, loading, error } = useBlogContext();

  // Separate published blogs and drafts
  const publishedBlogs = blogs.filter(blog => blog.status === 'published');
  const draftBlogs = blogs.filter(blog => blog.status === 'draft');

  if (loading) {
    return <div className="loading">Loading blogs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Blog Manager</h1>
        <Link to="/new" className="new-blog-btn">
          Create New Blog
        </Link>
      </div>

      <div className="blog-sections">
        <BlogList
          blogs={publishedBlogs}
          title="Published Blogs"
          emptyMessage="No published blogs yet"
        />

        <BlogList
          blogs={draftBlogs}
          title="Drafts"
          emptyMessage="No drafts yet"
        />
      </div>
    </div>
  );
};

export default HomePage;
