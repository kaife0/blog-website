
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BlogProvider } from './context/BlogContext'
import HomePage from './pages/HomePage'
import BlogEditorPage from './pages/BlogEditorPage'

function App() {
  return (
    <Router>
      <BlogProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<BlogEditorPage />} />
            <Route path="/edit/:id" element={<BlogEditorPage />} />
          </Routes>
        </div>
      </BlogProvider>
    </Router>
  )
}

export default App
