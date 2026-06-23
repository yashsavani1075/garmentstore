import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { ToastContainer } from "react-toastify";
import { WishlistProvider } from "./context/WishlistContext";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <WishlistProvider>
      <SearchProvider>
        <AdminAuthProvider>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={1700}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </AdminAuthProvider>
      </SearchProvider>
      </WishlistProvider>
    </CartProvider>
  </StrictMode>,
)

