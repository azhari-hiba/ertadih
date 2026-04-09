import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { categoryLabel, formatPrice } from '../utils/format'
import {toast} from'../utils/alerts'
import { errorAlert } from '../utils/alerts'
export default function ProductDetails() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    const load = async () => {
      try {
        const productRef = doc(db, 'products', productId)
        const snapshot = await getDoc(productRef)

        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() }
          setProduct(data)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [productId])

  const usesVariants = useMemo(() => {
    return product?.category === 'abayas' || product?.category === 'hijabs'
  }, [product])

  const variants = useMemo(() => {
    if (!usesVariants) return []
    return Array.isArray(product?.variants) ? product.variants : []
  }, [product, usesVariants])

  const currentVariant = usesVariants ? variants[currentIndex] : null

  useEffect(() => {
    if (usesVariants && currentVariant?.sizes?.length) {
      setSelectedSize(currentVariant.sizes[0])
    } else {
      setSelectedSize('')
    }
  }, [usesVariants, currentIndex, currentVariant])

  const handlePrev = () => {
    if (!variants.length) return
    setCurrentIndex((prev) => (prev === 0 ? variants.length - 1 : prev - 1))
  }

  const handleNext = () => {
    if (!variants.length) return
    setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1))
  }

  const handleAddToCart = () => {
    if (!product) return

    if (usesVariants) {
      if (!currentVariant) {
        errorAlert('اختاري اللون أولاً')
        return
      }

      if (!selectedSize && currentVariant.sizes?.length) {
        errorAlert('اختاري المقاس أولاً')
        return
      }

      addToCart({
        ...product,
        imageUrl: currentVariant.imageUrl,
        color: currentVariant.color || '',
        size: selectedSize || '',
        variantIndex: currentIndex,
      })
      toast("تمت إضافة المنتج للسلة 🛍️")
      return
    }

    addToCart(product)
toast("تمت إضافة المنتج للسلة 🛍️")
  }

  if (loading) return <Loader />
  if (!product) {
    return (
      <EmptyState
        title="المنتج غير موجود"
        description="تحققي من الرابط أو أضيفي المنتج من الإدارة."
      />
    )
  }

  return (
    <section className="container section details-grid">
      <div className="details-media">
        {usesVariants && variants.length > 0 ? (
          <>
            <div
              className="details-slider"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={handlePrev}
                className="slider-arrow"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                ‹
              </button>

              <img
                src={currentVariant?.imageUrl}
                alt={product.name}
                className="details-image"
              />

              <button
                type="button"
                onClick={handleNext}
                className="slider-arrow"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                ›
              </button>
            </div>

            <div
              className="variant-thumbs"
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                marginTop: '14px',
                paddingBottom: '6px',
              }}
            >
              {variants.map((variant, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    minWidth: '72px',
                    border: index === currentIndex ? '2px solid #7a5c46' : '1px solid #ddd',
                    borderRadius: '14px',
                    background: '#fff',
                    padding: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={variant.imageUrl}
                    alt={variant.color || `variant-${index}`}
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      display: 'block',
                      margin: '0 auto 6px',
                    }}
                  />
                  <span style={{ fontSize: '12px' }}>
                    {variant.color || `لون ${index + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <img src={product.imageUrl} alt={product.name} className="details-image" />
        )}
      </div>

      <div>
        <span className="product-category">{categoryLabel(product.category)}</span>
        <h2>{product.name}</h2>
        <p className="details-price">{formatPrice(product.price)}</p>
        <p className="details-description">{product.description}</p>

        {usesVariants && currentVariant && (
          <>
            <div style={{ marginTop: '18px' }}>
              <h4 style={{ marginBottom: '10px' }}>اختيار اللون</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {variants.map((variant, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '999px',
                      border: index === currentIndex ? '2px solid #7a5c46' : '1px solid #ddd',
                      background: index === currentIndex ? '#f3ebe5' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {variant.color || `لون ${index + 1}`}
                  </button>
                ))}
              </div>
            </div>

            {Array.isArray(currentVariant.sizes) && currentVariant.sizes.length > 0 && (
              <div style={{ marginTop: '18px' }}>
                <h4 style={{ marginBottom: '10px' }}>اختيار المقاس</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {currentVariant.sizes.map((size, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '999px',
                        border: selectedSize === size ? '2px solid #7a5c46' : '1px solid #ddd',
                        background: selectedSize === size ? '#f3ebe5' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '22px' }}>
          <button className="primary-btn" onClick={handleAddToCart}>
            أضيفي إلى السلة
          </button>
        </div>
      </div>
    </section>
  )
}