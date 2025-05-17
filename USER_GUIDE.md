# User Guide: Blog Editor Application

## Overview

The Blog Editor Application is a full-stack blog management system that allows you to create, edit, and publish blog posts with an auto-save feature to prevent loss of work. This guide will walk you through how to use all features of the application.

## Getting Started

### Accessing the Application

Open your web browser and navigate to: http://localhost:5175

### Home Page

The home page displays two main sections:
- **Published Blogs**: Articles that have been finalized and published
- **Drafts**: Work-in-progress articles that are automatically saved

Each blog entry shows:
- Title
- Creation/update date
- Tags (if any)
- Status (published or draft)
- Action buttons (Edit)

## Creating a New Blog

1. From the home page, click the **Create New Blog** button at the top
2. You'll be taken to the blog editor page with empty fields
3. Enter a title in the "Title" field
4. Use the rich text editor to write your content
   - The toolbar provides formatting options (bold, italic, lists, etc.)
   - You can add links and format text as needed
5. Add tags in the "Tags" field (comma-separated)
6. The auto-save feature will automatically save your work every 5 seconds of inactivity
   - The save status indicator will show "Saving..." when in progress
   - When saved, it will display "Last saved: [time]"
7. To manually save at any point, click the **Save as Draft** button
8. Click the **Preview** button to see how your blog will look when published
9. When your blog is ready to publish, click the **Publish** button

## Editing an Existing Blog

1. From the home page, find the blog you want to edit
2. Click the **Edit** button next to that blog
3. Make your changes to the title, content, or tags
4. Your changes will be auto-saved every 5 seconds
5. Click **Preview** to see how your changes will look when published
6. Click **Save as Draft** to keep it as a draft or **Publish** to publish it

## Deleting a Blog

1. From the home page, find the blog you want to delete
2. Click the **Delete** button next to that blog
3. Confirm the deletion when prompted
4. The blog will be permanently removed from your list

## Understanding the Auto-Save Feature

The auto-save functionality works as follows:
- After 5 seconds of inactivity (no typing or editing), your work is automatically saved
- The save status indicator at the top right shows the current save state:
  - "Saving..." - Currently saving your work
  - "Last saved: [time]" - Successfully saved with timestamp
- If an error occurs during saving, an error notification will appear

## Rich Text Editor Features

The editor supports various formatting options:
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Paragraph Styles**: Headings, blockquotes, code blocks
- **Lists**: Bulleted and numbered lists
- **Indentation**: Increase and decrease indent
- **Links**: Insert and edit hyperlinks
- **Clear Formatting**: Remove all formatting

## Tips for Effective Use

1. **Regular Manual Saves**: While auto-save is enabled, it's good practice to manually save important changes
2. **Use Descriptive Titles**: Choose clear, concise titles for better organization
3. **Utilize Tags**: Add relevant tags to make your blogs easier to categorize and find
4. **Check Before Publishing**: Review your content thoroughly before publishing
5. **Watch the Save Status**: Keep an eye on the save status indicator to ensure your work is being saved

## Troubleshooting

### Common Issues and Solutions

1. **Changes Not Saving**:
   - Check your internet connection
   - Make sure the save status shows "Last saved" with a recent timestamp
   - Try manually saving with the "Save as Draft" button

2. **Rich Text Editor Not Working**:
   - Refresh the page
   - Clear browser cache and try again

3. **Can't Publish Blog**:
   - Ensure both title and content fields are filled
   - Check for any error messages in the notifications

4. **Blog Not Appearing in List**:
   - Refresh the home page
   - Check if you're looking in the correct section (Published/Drafts)

## Technical Notes

- The application uses a MongoDB database for storage
- If the MongoDB connection fails, the application will fall back to in-memory storage
- In-memory storage means data will be lost when the server restarts
- Auto-save uses debounce to prevent excessive API calls

## Next Steps

This application can be extended with:
- User authentication
- Image uploads
- Comments section
- Blog search functionality
- Blog post deletion
- Categories and advanced tagging
