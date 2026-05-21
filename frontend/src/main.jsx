import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import MyCart from './assets/hooks/CartContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import MyWishList from './assets/hooks/WishListContext.jsx'
import AuthProvider from './assets/hooks/AuthProvider.jsx'
import LikeProduct from './assets/hooks/Like.jsx'


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
