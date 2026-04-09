import { signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL
      if (allowedEmail && cred.user.email !== allowedEmail) {
        alert('هذا الحساب غير مخول للدخول إلى لوحة الإدارة')
        return
      }
      navigate('/admin')
    } catch (error) {
      console.log(error.code,error.message)
      alert(error.code)
    }
  }

  return (
    <div className="admin-auth-page">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <img src="/logo-ertadih.jpeg" alt="إرتديه" className="admin-logo" />
        <h2>دخول الإدارة</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          required
        />
        <button className="primary-btn full-btn" disabled={loading}>
          {loading ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>
    </div>
  )
}
