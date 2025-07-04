import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Make sure the root element exists in your index.html
const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </StrictMode>
  )
} else {
  console.error('Root element not found.')
}