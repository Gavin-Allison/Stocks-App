import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.tsx'

// App bootstrap and provider wrapping
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={"706593098315-3gdddn111fv6cbrj8f029f4o5l62nuhb.apps.googleusercontent.com"}>
        <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
