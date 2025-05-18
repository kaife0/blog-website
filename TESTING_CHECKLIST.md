# Testing Checklist for Blog Editor Application

## Setup and Installation
- [x] Install all dependencies with `npm install`
- [x] Start the application with `npm start`
- [x] Server running on port 5000
- [x] Frontend accessible at http://localhost:5174 (or similar port)

## Core Functionality Tests

### Home Page
- [ ] Home page loads correctly
- [ ] "Create New Blog" button is visible
- [ ] Published blogs section is visible
- [ ] Drafts section is visible

### Creating a New Blog
- [ ] Click "Create New Blog" button navigates to editor
- [ ] Can enter a title
- [ ] Rich text editor loads and allows content entry
- [ ] Can add tags (comma-separated)
- [ ] Auto-save works after 5 seconds of inactivity
- [ ] Save status indicator shows "Saving..." when saving
- [ ] Save status indicator shows "Last saved: [time]" after saving
- [ ] "Save as Draft" button works
- [ ] "Preview" button toggles preview mode
- [ ] Preview mode correctly displays formatted content
- [ ] "Publish" button works

### Editing an Existing Blog
- [ ] Blogs in list have "Edit" button
- [ ] Clicking "Edit" loads the blog in the editor
- [ ] All fields (title, content, tags) are pre-populated
- [ ] Changes are auto-saved
- [ ] Can toggle preview mode
- [ ] Can save as draft or publish changes

### Deleting a Blog
- [ ] Blogs in list have "Delete" button
- [ ] Clicking "Delete" shows confirmation dialog
- [ ] Confirming deletion removes the blog from the list
- [ ] Blog is permanently deleted from the system

### API Tests
- [ ] GET /api/blogs returns all blogs
- [ ] GET /api/blogs/:id returns a specific blog
- [ ] POST /api/blogs/save-draft saves a draft blog
- [ ] POST /api/blogs/publish publishes a blog
- [ ] DELETE /api/blogs/:id deletes a blog

## Edge Cases and Error Handling
- [ ] Attempting to publish with an empty title shows error message
- [ ] Attempting to publish with empty content shows error message
- [ ] Server handles invalid data gracefully
- [ ] Application continues to work if MongoDB connection fails (uses in-memory storage)
- [ ] Network error notifications are displayed when API calls fail

## UI/UX Tests
- [ ] Application is responsive and works on different screen sizes
- [ ] Rich text editor toolbar functions properly
- [ ] Toast notifications appear for successful/failed operations
- [ ] Navigation between pages works as expected
- [ ] UI elements are properly aligned and styled

## Performance Tests
- [ ] Application loads quickly
- [ ] Auto-save doesn't cause performance issues
- [ ] Rich text editor remains responsive with large amounts of content

## Final Check
- [ ] All features described in README.md work as expected
- [ ] All features described in USER_GUIDE.md work as expected
- [ ] No console errors are present during normal operation
- [ ] Application state persists between page refreshes (if using in-memory storage, this won't be the case)

## Notes
- If using in-memory storage (MongoDB connection failed), all data will be lost when the server restarts
- For a production deployment, ensure a proper MongoDB connection is configured
