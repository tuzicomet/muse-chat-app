import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wrap the App with BrowserRouter so it can use React Router components */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
