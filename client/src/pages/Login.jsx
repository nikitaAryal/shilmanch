import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import logo from '../assets/shilpeelogo1.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  // Redirect if already logged in
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      // Redirect to the page they tried to visit or home
      const from = location.state?.from?.pathname || '/'
      // If admin, redirect to admin panel
      if (data.user?.is_admin) {
        navigate('/admin')
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data) {
        setError(err.response.data)
      } else {
        setError('Network error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-container'>
      <div className='login-box'>
        <div className='login-logo'>
          <img src={logo} alt="Company logo"/>
        </div>
        <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          name="email"
          autoComplete="email"
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          name="password"
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>

      </form>
      <div className='signup-link'>
        <p>Don't have an account?<a href="/Register">Sign Up</a></p>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      
    </div>
  )
} 