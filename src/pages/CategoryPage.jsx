import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import { db } from '../firebase'
import { categories } from '../data/cities'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const currentCategory = useMemo(
    () => categories.find((item) => item.id === categoryId),
    [categoryId],
  )

  useEffect(() => {
    const q = query(collection(db, 'products'), where('category', '==', categoryId))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsubscribe
  }, [categoryId])

  if (loading) return <Loader />

  return (
    <section className="container section">
      <div className="section-head">
        <h2>{currentCategory?.label}</h2>
        <p>جميع المنتجات الخاصة بهذا القسم.</p>
      </div>

      {products.length === 0 ? (
        <EmptyState title="لا توجد منتجات حالياً" description="أضيفي منتجات جديدة من لوحة الإدارة." />
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={{ ...product, categoryLabel: currentCategory?.label }} />
          ))}
        </div>
      )}
    </section>
  )
}
