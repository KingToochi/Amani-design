import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import MyCart from './context/CartContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import MyWishList from './context/WishlistContext.jsx'
import AuthProvider from './context/AuthContext.jsx'
import LikeProduct from './context/LikeContext.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
  <MyCart>
    <MyWishList>
    <StrictMode>
      <GoogleOAuthProvider clientId="895747892575-j3vsffp8ukctrqppt8q22jat4402ap4j.apps.googleusercontent.com">
        <LikeProduct>
          <App />
        </LikeProduct>
      </GoogleOAuthProvider>
    </StrictMode>
    </MyWishList>
  </MyCart>
  </AuthProvider>
  </BrowserRouter>
)
