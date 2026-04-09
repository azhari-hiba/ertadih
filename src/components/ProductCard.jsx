import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import { toast } from '../utils/alerts'
export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </Link>
      <div className="product-body">
        <span className="product-category">{product.categoryLabel}</span>
        <Link to={`/product/${product.id}`} className="product-title">
          {product.name}
        </Link>
        <p className="product-price">{formatPrice(product.price)}</p>
        <Link to={`/product/${product.id}`} className="primary-btn">
  عرض التفاصيل
</Link>
      </div>
    </div>
  )
}
