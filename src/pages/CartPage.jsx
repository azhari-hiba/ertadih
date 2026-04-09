import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import Swal from 'sweetalert2'
export default function CartPage() {
  const {
    cartItems,
    subtotal,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart()

  if (!cartItems.length) {
    return (
      <section className="container section">
        <EmptyState
          title="السلة فارغة"
          description="أضيفي بعض المنتجات أولاً ثم أكملي الطلب."
        />
      </section>
    )
  }

  return (
    <section className="container section cart-layout">
      <div className="cart-list">
        <div className="section-head">
          <h2>سلة المشتريات</h2>
          <button className="secondary-btn" onClick={clearCart}>
            تفريغ السلة
          </button>
        </div>

        {cartItems.map((item, index) => (
          <div className="cart-item" key={`${item.id}-${item.variantIndex ?? 'default'}-${item.size || 'nosize'}-${index}`}>
            <div className="cart-item-image-wrap">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
              ) : (
                <div className="cart-no-image">لا توجد صورة</div>
              )}
            </div>

            <div className="cart-item-content">
              <h3>{item.name}</h3>

              <div className="cart-meta">
                {item.color && <span>اللون: {item.color}</span>}
                {item.size && <span>المقاس: {item.size}</span>}
              </div>

              <p className="cart-price">{formatPrice(item.price)}</p>

              <div className="cart-actions-row">
                <div className="quantity-box">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => decreaseQuantity(index)}
                  >
                    -
                  </button>

                  <span className="qty-value">{item.quantity}</span>

                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => increaseQuantity(index)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => Swal.fire({
  title: 'واش متأكدة؟',
  text: 'غادي يتحيد المنتج',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'نعم',
  cancelButtonText: 'لا',
  confirmButtonColor: '#7a5c46',
}).then((result) => {
  if (result.isConfirmed) {
    removeFromCart(index)
  }
})}
                >
                  حذف
                </button>
              </div>
            </div>

            <div className="cart-item-total">
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          </div>
        ))}
      </div>

      <aside className="cart-summary">
        <h3>ملخص الطلب</h3>

        <div className="summary-line">
          <span>عدد المنتجات</span>
          <strong>{cartItems.length}</strong>
        </div>

        <div className="summary-line total-line">
          <span>المجموع</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>

        <Link to="/checkout" className="primary-btn full-btn">
          إتمام الطلب
        </Link>
      </aside>
    </section>
  )
}