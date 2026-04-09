import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { categories } from '../data/cities'
import Footer from './Footer'
import { HiOutlineShoppingBag } from 'react-icons/hi2'
export default function Layout() {
  const { totalItems } = useCart()

  return (
    <div className="site-shell">
      <header className="header">
        <div className="container header-inner">
          <div className="header-top">
            <Link to="/" className="brand">
              <img src="/logo-ertadih.jpeg" alt="إرتديه" className="brand-logo" />
              <div>
                <h1>إرتديه</h1>
                <p>بأناقة و حشمة</p>
              </div>
            </Link>

            <Link to="/cart" className="cart-icon-link">
  <HiOutlineShoppingBag />

  {totalItems > 0 && (
    <span className="cart-badge">{totalItems}</span>
  )}
</Link>
          </div>

          <nav className="nav-links nav-bottom">
            {categories.map((category) => (
              <NavLink
                key={category.id}
                to={`/category/${category.id}`}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {category.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}