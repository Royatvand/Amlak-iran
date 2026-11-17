import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import './index.css'
import './theme.css'

const isAdmin = window.location.pathname.startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {!isAdmin && <ThemeToggle />}
  </React.StrictMode>,
)
