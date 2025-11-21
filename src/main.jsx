import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import MyCart from './assets/pages/marketPlace/hooks/CartContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <MyCart>
    <StrictMode>
      <GoogleOAuthProvider clientId="895747892575-j3vsffp8ukctrqppt8q22jat4402ap4j.apps.googleusercontent.com">
          <App />
      </GoogleOAuthProvider>
    </StrictMode>
  </MyCart>
  </BrowserRouter>
)
