import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { cities } from '../data/cities'
import { db } from '../firebase'
import { formatPrice } from '../utils/format'
import {toast,errorAlert} from '../utils/alerts'
const initialForm = {
  customerName: '',
  phone: '',
  cityId: '',
  address: '',
  notes: '',
}

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart()
  const [form, setForm] = useState(initialForm)
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === Number(form.cityId)),
    [form.cityId]
  )

  const shippingPrice = selectedCity?.price || 0
  const total = subtotal + shippingPrice

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cartItems.length) return

    try {
      setSending(true)

      await runTransaction(db, async (transaction) => {
        const preparedProducts = []

        // 1) نقراو كاملين أولاً
        for (const item of cartItems) {
          const productRef = doc(db, 'products', item.id)
          const productSnap = await transaction.get(productRef)

          if (!productSnap.exists()) {
            throw new Error(`المنتج "${item.name}" غير موجود`)
          }

          const productData = productSnap.data()
          const quantity = Number(item.quantity || 0)

          if (quantity <= 0) {
            throw new Error(`كمية غير صالحة للمنتج "${item.name}"`)
          }

          const isVariantProduct =
            productData.category === 'abayas' || productData.category === 'hijabs'

          if (isVariantProduct) {
            if (!Array.isArray(productData.variants) || typeof item.variantIndex !== 'number') {
              throw new Error(`اختيار اللون غير صالح للمنتج "${item.name}"`)
            }

            const variant = productData.variants[item.variantIndex]

            if (!variant) {
              throw new Error(`اللون المحدد غير موجود للمنتج "${item.name}"`)
            }

            const currentStock = Number(variant.stock || 0)

            if (currentStock < quantity) {
              throw new Error(`المخزون غير كافٍ للمنتج "${item.name}"`)
            }

            const updatedVariants = [...productData.variants]
            updatedVariants[item.variantIndex] = {
              ...variant,
              stock: currentStock - quantity,
            }

            preparedProducts.push({
              ref: productRef,
              data: {
                variants: updatedVariants,
                stock: updatedVariants.reduce(
                  (sum, currentVariant) => sum + Number(currentVariant.stock || 0),
                  0
                ),
              },
            })
          } else {
            const currentStock = Number(productData.stock || 0)

            if (currentStock < quantity) {
              throw new Error(`المخزون غير كافٍ للمنتج "${item.name}"`)
            }

            preparedProducts.push({
              ref: productRef,
              data: {
                stock: currentStock - quantity,
              },
            })
          }
        }

        // 2) من بعد نبداو الكتابات كاملين
        for (const prepared of preparedProducts) {
          transaction.update(prepared.ref, prepared.data)
        }

        const orderRef = doc(collection(db, 'orders'))

        transaction.set(orderRef, {
          customerName: form.customerName,
          phone: form.phone,
          cityId: Number(form.cityId),
          cityName: selectedCity?.name_ar || '',
          address: form.address,
          notes: form.notes || '',
          items: cartItems.map((item) => ({
            productId: item.id,
            variantIndex: typeof item.variantIndex === 'number' ? item.variantIndex : null,
            color: item.color || '',
            size: item.size || '',
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 0),
            imageUrl: item.imageUrl || '',
            category: item.category || '',
          })),
          subtotal: Number(subtotal),
          shippingPrice: Number(shippingPrice),
          total: Number(total),
          status: 'new',
          createdAt: serverTimestamp(),
        })
      })

      clearCart()
      navigate('/')
      toast('🎉تم إرسال الطلب بنجاح')
    } catch (error) {
      console.error(error)
      errorAlert(error.message || 'وقع خطأ أثناء إرسال الطلب')
    } finally {
      setSending(false)
    }
  }

  if (!cartItems.length) {
    return (
      <section className="container section">
        <EmptyState
          title="لا يمكن إتمام الطلب"
          description="السلة فارغة حالياً."
        />
      </section>
    )
  }

  return (
    <section className="container section checkout-layout">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2>إتمام الطلب</h2>

        <input
          type="text"
          placeholder="الاسم الكامل"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          required
        />

        <input
          type="tel"
          placeholder="رقم الهاتف"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <select
          value={form.cityId}
          onChange={(e) => setForm({ ...form, cityId: e.target.value })}
          required
        >
          <option value="">اختاري المدينة</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name_ar} - {city.price} د.م
            </option>
          ))}
        </select>

        <textarea
          placeholder="العنوان الكامل"
          rows="4"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />

        <textarea
          placeholder="ملاحظات إضافية (اختياري)"
          rows="3"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button className="primary-btn full-btn" disabled={sending}>
          {sending ? 'جاري الإرسال...' : 'تأكيد الطلب'}
        </button>
      </form>

      <div className="summary-card">
        <h3>ملخص الطلب</h3>

        {cartItems.map((item, index) => (
          <div className="summary-line" key={`${item.id}-${index}`}>
            <span>
              {item.name} × {item.quantity}
              {item.color ? ` - ${item.color}` : ''}
              {item.size ? ` - ${item.size}` : ''}
            </span>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        ))}

        <div className="summary-line">
          <span>مجموع المنتجات</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>

        <div className="summary-line">
          <span>التوصيل</span>
          <strong>{formatPrice(shippingPrice)}</strong>
        </div>

        <div className="summary-line total-line">
          <span>الإجمالي</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </div>
    </section>
  )
}