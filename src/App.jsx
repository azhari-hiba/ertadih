import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductDetails from './pages/ProductDetails'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    
    <>
    <ScrollToTop/>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="category/:categoryId" element={<CategoryPage />} />
        <Route path="product/:productId" element={<ProductDetails />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
      </Route>
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
    </>
  )
}
