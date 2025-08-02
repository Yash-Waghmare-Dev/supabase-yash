import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  //error message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGithub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
    console.log(data, error);
    
  }


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">OR</div>

        <div className="social-login-buttons">
          <button onClick={() => signInWithOAuth('google')} className="social-button google" type="button">
            <i className="fab fa-google"></i> Sign in with Google
          </button>
          <button onClick={() => signInWithOAuth('twitter')} className="social-button twitter" type="button">
            <i className="fab fa-twitter"></i> Sign in with Twitter
          </button>
          <button onClick={() => signInWithOAuth('facebook')} className="social-button facebook" type="button">
            <i className="fab fa-facebook"></i> Sign in with Facebook
          </button>
          <button onClick={signInWithGithub} className="social-button github" type="button">
            <i className="fab fa-github"></i> Sign in with GitHub
          </button>
        </div>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}
