/**
 * main.tsx - Application Entry Point
 * 
 * This is the entry point for the React application. It:
 * - Renders the root React component into the DOM
 * - Wraps the app with React.StrictMode for development warnings
 * - Provides BrowserRouter for client-side routing
 * - Imports global CSS styles
 * 
 * The root element (#root) is defined in index.html.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Render the application into the DOM
// BrowserRouter enables client-side routing with React Router
// StrictMode helps identify potential problems during development
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
