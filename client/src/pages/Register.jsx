import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import logoo from '../assets/shillpeelogo2.png'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/', { replace: true })
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const errors = {}

    if (!username.trim()) {
      errors.username = 'Username is required'
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (username.trim().length > 20) {
      errors.username = 'Username must be less than 20 characters'
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/')
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
    <div className='register-container'>
      
      <div className='register-box'>
        <div className='register-logo'>
        <img src={logoo} alt='Company Logo'/>
      </div>
        <h2 className='register'>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <div>
          <InputField
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' })
            }}
            name="username"
            autoComplete="username"
            className={fieldErrors.username ? 'input-error' : ''}
          />
          {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
        </div>
        <div>
          <InputField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
            }}
            name="email"
            autoComplete="email"
            className={fieldErrors.email ? 'input-error' : ''}
          />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
        <div>
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
            }}
            name="password"
            autoComplete="new-password"
            className={fieldErrors.password ? 'input-error' : ''}
          />
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        </div>
        <div>
          <InputField
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' })
            }}
            name="confirmPassword"
            autoComplete="new-password"
            className={fieldErrors.confirmPassword ? 'input-error' : ''}
          />
          {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      
    </div>
  )
} 