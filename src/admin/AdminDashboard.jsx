import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { categories } from '../data/cities'
import { categoryLabel, formatPrice, getStatusLabel } from '../utils/format'
import { Link } from 'react-router-dom' 

import { HiOutlineShoppingBag } from 'react-icons/hi2'

import { useCart } from '../context/CartContext'
const emptyVariant = {
  // حيدنا color من هنا
  imageUrl: '',
  stock: '',
  sizes: '',
}

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: 'hijabs',
  imageUrl: '',
}

export default function AdminDashboard() {
  const [userReady, setUserReady] = useState(false)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [variants, setVariants] = useState([{ ...emptyVariant }])
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const usesVariants = form.category === 'abayas' || form.category === 'hijabs'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin-login')
        return
      }

      const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL
      if (allowedEmail && user.email !== allowedEmail) {
        signOut(auth)
        navigate('/admin-login')
        return
      }

      setUserReady(true)
    })

    return unsubscribe
  }, [navigate])

  useEffect(() => {
    if (!userReady) return

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      }
    )

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setOrders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      }
    )

    return () => {
      unsubProducts()
      unsubOrders()
    }
  }, [userReady])

  const stats = useMemo(() => {
    return {
      products: products.length,
      orders: orders.length,
      pending: orders.filter((order) => order.status === 'new').length,
    }
  }, [products, orders])

  const resetForm = () => {
    setForm(emptyProduct)
    setVariants([{ ...emptyVariant }])
    setEditingId(null)
  }

  const addVariant = () => {
    setVariants((prev) => [...prev, { ...emptyVariant }])
  }

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const updateVariantField = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    )
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      let payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        createdAt: form.createdAt || serverTimestamp(),
      }

      if (usesVariants) {
        const cleanedVariants = variants
          .filter((variant) => variant.imageUrl.trim()) // الفلترة بقات فقط بالصورة
          .map((variant) => ({
            imageUrl: variant.imageUrl.trim(),
            stock: Number(variant.stock || 0),
            sizes: variant.sizes
              .split(',')
              .map((size) => size.trim())
              .filter(Boolean),
          }))

        payload = {
          ...payload,
          variants: cleanedVariants,
          imageUrl: cleanedVariants[0]?.imageUrl || '',
          stock: cleanedVariants.reduce((sum, item) => sum + Number(item.stock || 0), 0),
        }
      } else {
        payload = {
          ...payload,
          imageUrl: form.imageUrl || '',
          stock: Number(form.stock || 0),
          variants: [],
        }
      }

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), payload)
      } else {
        await addDoc(collection(db, 'products'), payload)
      }

      resetForm()
    } catch (error) {
      console.error(error)
      alert('وقع خطأ أثناء حفظ المنتج')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)

    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.category || 'hijabs',
      imageUrl: product.imageUrl || '',
      createdAt: product.createdAt || null,
    })

    if (
      (product.category === 'abayas' || product.category === 'hijabs') &&
      Array.isArray(product.variants) &&
      product.variants.length
    ) {
      setVariants(
        product.variants.map((variant) => ({
          imageUrl: variant.imageUrl || '',
          stock: variant.stock || '',
          sizes: Array.isArray(variant.sizes) ? variant.sizes.join(', ') : '',
        }))
      )
    } else {
      setVariants([{ ...emptyVariant }])
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('واش متأكدة من حذف هذا المنتج؟')) return
    await deleteDoc(doc(db, 'products', id))
  }

  const updateOrderStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status })
  }

  const deleteOrder = async (id) => {
    if (!confirm('واش متأكدة من حذف هذه الطلبية؟')) return

    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', id)
        const orderSnap = await transaction.get(orderRef)

        if (!orderSnap.exists()) {
          throw new Error('الطلبية غير موجودة')
        }

        const orderData = orderSnap.data()
        const items = orderData.items || []

        for (const item of items) {
          if (!item.productId) continue

          const productRef = doc(db, 'products', item.productId)
          const productSnap = await transaction.get(productRef)

          if (!productSnap.exists()) continue

          const productData = productSnap.data()

          if (
            (productData.category === 'abayas' || productData.category === 'hijabs') &&
            Array.isArray(productData.variants) &&
            typeof item.variantIndex === 'number' &&
            productData.variants[item.variantIndex]
          ) {
            const updatedVariants = [...productData.variants]
            updatedVariants[item.variantIndex] = {
              ...updatedVariants[item.variantIndex],
              stock: Number(updatedVariants[item.variantIndex].stock || 0) + Number(item.quantity || 0),
            }

            transaction.update(productRef, {
              variants: updatedVariants,
              stock: updatedVariants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0),
            })
          } else {
            transaction.update(productRef, {
              stock: Number(productData.stock || 0) + Number(item.quantity || 0),
            })
          }
        }

        transaction.delete(orderRef)
      })
    } catch (error) {
      console.error(error)
      alert('وقع خطأ أثناء حذف الطلبية')
    }
  }

  const logout = async () => {
    await signOut(auth)
    navigate('/admin-login')
  }

  if (!userReady) return null

  return (
    
    <>
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
  {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
</Link>
          </div>
        </div>
      </header>
    <div className="admin-page">
      <div className="admin-topbar">
  <h1>لوحة إدارة إرتديه</h1>
  <div style={{ display: 'flex', gap: '10px' }}>
    <button 
      className="primary-btn" 
      onClick={() => document.querySelector('.orders-panel').scrollIntoView({ behavior: 'smooth' })}
      style={{ background: '#222' }}
    >
      عرض الطلبيات ({stats.orders})
    </button>
    <button className="secondary-btn" onClick={logout}>تسجيل الخروج</button>
  </div>
</div>

<div className="admin-stats">
  <div className="stat-card" onClick={() => window.scrollTo({ top: document.querySelector('.admin-grid').offsetTop - 100, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
    <span>المنتجات</span>
    <strong>{stats.products}</strong>
  </div>
  
  <div className="stat-card" onClick={() => window.scrollTo({ top: document.querySelector('.orders-panel').offsetTop - 20, behavior: 'smooth' })} style={{ cursor: 'pointer', border: '2px solid var(--primary-color)' }}>
    <span>الطلبيات</span>
    <strong>{stats.orders}</strong>
    <small style={{ display: 'block', fontSize: '12px', color: 'var(--primary-color)' }}>اضغط للمشاهدة ↓</small>
  </div>

  <div className="stat-card">
    <span>الطلبيات الجديدة</span>
    <strong>{stats.pending}</strong>
  </div>
</div>

      <div className="admin-grid">
        <section className="admin-panel">
          <h2>{editingId ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>

          <form className="admin-form" onSubmit={handleSaveProduct}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="اسم المنتج"
              required
            />

            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف المنتج"
              rows="4"
              required
            />

            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="الثمن"
              required
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>

            {usesVariants ? (
              <>
                <div className="variants-head">
                  <h3>الصور / المقاسات / المخزون</h3>
                </div>

                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="variant-box"
                    style={{
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '16px',
                      padding: '14px',
                      marginBottom: '14px',
                      background: '#fff',
                    }}
                  >
                    {/* حيدنا input ديال "اسم اللون" من هنا */}

                    <input
                      type="url"
                      value={variant.imageUrl}
                      onChange={(e) => updateVariantField(index, 'imageUrl', e.target.value)}
                      placeholder="رابط الصورة من Cloudinary"
                      required
                    />

                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariantField(index, 'stock', e.target.value)}
                      placeholder="المخزون الخاص بهذا اللون"
                      required
                    />

                    <input
                      type="text"
                      value={variant.sizes}
                      onChange={(e) => updateVariantField(index, 'sizes', e.target.value)}
                      placeholder="المقاسات: S,M,L,XL أو Standard"
                    />

                    {variant.imageUrl && (
                      <img
                        src={variant.imageUrl}
                        alt="preview"
                        className="preview-image"
                      />
                    )}

                    {variants.length > 1 && (
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => removeVariant(index)}
                        style={{ marginTop: '10px' }}
                      >
                        حذف هذا اللون
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={addVariant}
                >
                  + إضافة صورة لون جديد
                </button>
              </>
            ) : (
              <>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="المخزون"
                  required
                />

                <input
                  type="url"
                  value={form.imageUrl || ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="رابط الصورة من Cloudinary"
                />

                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt={form.name || 'preview'}
                    className="preview-image"
                  />
                )}
              </>
            )}

            <div className="admin-form-actions">
              <button className="primary-btn" disabled={saving}>
                {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديل' : 'إضافة المنتج'}
              </button>

              {editingId && (
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <h2>المنتجات</h2>

          <div className="admin-list">
            {products.map((product) => (
              <div className="admin-item" key={product.id}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="no-image">لا توجد صورة</div>
                )}

                <div>
                  <h3>{product.name}</h3>
                  <p>
                    {categoryLabel(product.category)} - {formatPrice(product.price)}
                  </p>
                  <p>المخزون الإجمالي: {product.stock || 0}</p>

                  {(product.category === 'abayas' || product.category === 'hijabs') &&
                    Array.isArray(product.variants) &&
                    product.variants.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {product.variants.map((variant, index) => (
                          <img 
                            key={index}
                            src={variant.imageUrl} 
                            alt="variant" 
                            style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                        ))}
                      </div>
                    )}
                </div>

                <div className="admin-actions">
                  <button className="secondary-btn" onClick={() => handleEdit(product)}>
                    تعديل
                  </button>
                  <button className="danger-btn" onClick={() => handleDeleteProduct(product.id)}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel orders-panel">
        <h2>الطلبيات</h2>

        <div className="admin-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <h3>{order.customerName}</h3>
                  <p>{order.phone} - {order.cityName}</p>
                  <p>{order.address}</p>
                </div>

                <div className="order-status-block">
                  <span className={`status-badge status-${order.status}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              </div>

              <div className="order-items">
                {order.items?.map((item, index) => (
                  <div key={index} className="summary-line" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {item.name} × {item.quantity}
                          {/* حيدنا عرض اسم اللون هنا */}
                          {item.size ? ` — ${item.size}` : ''}
                        </span>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {order.notes && <p className="order-notes">ملاحظات: {order.notes}</p>}

              <div className="order-controls">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  <option value="new">جديدة</option>
                  <option value="confirmed">مؤكدة</option>
                  <option value="delivered">تم التوصيل</option>
                </select>

                <button className="danger-btn" onClick={() => deleteOrder(order.id)}>
                  حذف الطلبية
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  )
}