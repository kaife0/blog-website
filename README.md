# Blog Editor Application

A full-stack blog editor application with an auto-save draft feature built with React, Node.js, Express, and MongoDB.

## Features

- Create, edit, and publish blog posts
- Rich text editor for content
- Auto-save drafts after 5 seconds of inactivity
- Tag management
- Separate views for drafts and published posts
- Preview mode to see how posts will look when published
- Delete functionality for removing unwanted posts

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- React Quill for rich text editing
- React Toastify for notifications
- Axios for API requests

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- RESTful API architecture

## API Endpoints

| Method | Endpoint           | Description                  |
|--------|-------------------|------------------------------|
| GET    | /api/blogs        | Retrieve all blogs           |
| GET    | /api/blogs/:id    | Retrieve a blog by ID        |
| POST   | /api/blogs/save-draft | Save or update a draft    |
| POST   | /api/blogs/publish    | Save and publish an article |
| DELETE | /api/blogs/:id    | Delete a blog by ID          |

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### MongoDB Atlas Setup

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new project
3. Build a cluster (choose the free tier)
4. Configure network access to allow connections from anywhere (for development)
5. Create a database user
6. Get your connection string from Atlas (click on "Connect" -> "Connect your application")
7. Update the `.env` file with your connection string:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blog-app?retryWrites=true&w=majority
```

### Local Development Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/blog-app
   ```
   (Replace with your MongoDB Atlas URI if using Atlas)

4. Start the development server:
   ```
   npm run start
   ```
   This will start both the frontend dev server and the backend API server concurrently.

## Production Deployment

1. Build the frontend:
   ```
   npm run build
   ```

2. The build artifacts will be stored in the `dist/` directory

3. Deploy the backend to your preferred hosting service (Heroku, Render, etc.)

4. Make sure to set the environment variables on your hosting service

## Testing the API

You can test the API endpoints using tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [curl](https://curl.se/) command line tool

### Example API Requests

#### Get all blogs
```
GET http://localhost:5000/api/blogs
```

#### Get a blog by ID
```
GET http://localhost:5000/api/blogs/60d21b4667d0d8992e610c85
```

#### Save a draft
```
POST http://localhost:5000/api/blogs/save-draft
Content-Type: application/json

{
  "title": "My New Blog",
  "content": "<p>This is my blog content.</p>",
  "tags": "tag1, tag2"
}
```

#### Publish a blog
```
POST http://localhost:5000/api/blogs/publish
Content-Type: application/json

{
  "title": "My Published Blog",
  "content": "<p>This is my published blog content.</p>",
  "tags": "tag1, tag2"
}
```

## License

MIT
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
