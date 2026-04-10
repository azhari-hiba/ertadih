import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { categoryLabel, formatPrice } from '../utils/format'
import { toast } from '../utils/alerts'
import { errorAlert } from '../utils/alerts'
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2'

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
        // حيدنا اللون من هنا باش ما يمشيش للسلة كاسم
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
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#f9f9f9'
              }}
            >
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  position: 'absolute',
                  right: '10px',
                  zIndex: 2,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  color: '#7a5c46',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '20px'
                }}
              >
                <HiOutlineChevronRight />
              </button>

              <img
                src={currentVariant?.imageUrl}
                alt={product.name}
                className="details-image"
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                    display: 'block'
                }}
              />

              <button
                type="button"
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  left: '10px',
                  zIndex: 2,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  color: '#7a5c46',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '20px'
                }}
              >
                <HiOutlineChevronLeft />
              </button>
            </div>

            {/* عرض الصور الصغيرة للألوان فقط بدون كتابة الاسم */}
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
                    minWidth: '70px',
                    border: index === currentIndex ? '2px solid #7a5c46' : '1px solid #eee',
                    borderRadius: '12px',
                    background: '#fff',
                    padding: '4px',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  <img
                    src={variant.imageUrl}
                    alt={`variant-${index}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      display: 'block',
                    }}
                  />
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
            {/* حيدنا قسم "اختيار اللون" اللي كان كيعرض أزرار فيها نص، دابا الصور الصغيرة الفوق كافية */}
            
            {Array.isArray(currentVariant.sizes) && currentVariant.sizes.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '15px' }}>اختيار المقاس</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {currentVariant.sizes.map((size, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        border: selectedSize === size ? '2px solid #7a5c46' : '1px solid #ddd',
                        background: selectedSize === size ? '#f3ebe5' : '#fff',
                        color: selectedSize === size ? '#7a5c46' : '#333',
                        fontWeight: selectedSize === size ? 'bold' : 'normal',
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

        <div style={{ marginTop: '30px' }}>
          <button className="primary-btn" onClick={handleAddToCart} style={{ width: '100%' }}>
            أضيفي إلى السلة
          </button>
        </div>
      </div>
    </section>
  )
}