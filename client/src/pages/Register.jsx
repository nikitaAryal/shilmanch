import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import logoo from '../assets/shillpeelogo2.png'

export default function Register() {
  const [username, setUsername] = useState('')
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
      await axios.post('/api/register', { username, email, password })
      navigate('/login')
    } catch (err) {
      if (err.response) setError(err.response.data || 'Register failed')
      else setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='register-container'>
      
      <div className='register-box'>
        <div className='register-logo'>
        <img src={logoo} alt='Company Logo'/>
      </div>
        <h2 className='register'>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <InputField
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          name="username"
          autoComplete="username"
        />
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
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      
    </div>
  )
} 