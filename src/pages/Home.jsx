import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { categories } from '../data/cities'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setProducts(items)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [])

  const grouped = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      items: products.filter((product) => product.category === category.id).slice(0, 2),
    }))
  }, [products])

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-badge">إرتديه | أناقة وحشمة في كل التفاصيل</span>
            <h2>اختاري أناقتك بكل حشمة وذوق</h2>
            <p>
              إرتديه، وجهتك لأزياء محتشمة تجمع بين الأناقة والحشمة، مع تشكيلة راقية من
              الحجابات والعباءات والعطور والأمساك، وتوصيل لجميع المدن المغربية.
            </p>
            <div className="hero-actions">
              <Link to="/category/hijabs" className="primary-btn">
                تسوقي الآن
              </Link>
              <a href="#sections" className="secondary-btn">
                شاهدي الأقسام
              </a>
            </div>
          </div>

          <div className="hero-card">
            <img src="/logo-ertadih.jpeg" alt="إرتديه" />
          </div>
        </div>
      </section>

      <section className="container section" id="sections">
        <div className="section-head">
          <h2>أقسام المتجر</h2>
          <p>
            تشكيلة مختارة بعناية من العباءات، الحجابات، والعطور والأمساك، بأناقة تليق
            بذوقك.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-box" key={category.id} to={`/category/${category.id}`}>
              <h3>{category.label}</h3>
              <p>اكتشفي أحدث منتجات قسم {category.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        grouped.map((group) => (
          <section className="container section" key={group.id}>
            <div className="section-head row-between">
              <h2>{group.label}</h2>
              <Link to={`/category/${group.id}`} className="text-link">
                عرض الكل
              </Link>
            </div>

            <div className="products-grid">
              {group.items.length > 0 ? (
                group.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, categoryLabel: group.label }}
                  />
                ))
              ) : (
                <p className="text-link">لا توجد منتجات حالياً في هذا القسم.</p>
              )}
            </div>
          </section>
        ))
      )}
    </>
  )
}