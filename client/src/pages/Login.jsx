import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post('/api/login', { email, password })
      if (data?.userId) {
        localStorage.setItem('userId', String(data.userId))
        navigate('/')
      } else {
        setError('Unexpected response')
      }
    } catch (err) {
      if (err.response) setError(err.response.data || 'Login failed')
      else setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
} 