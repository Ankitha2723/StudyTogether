import { useState } from 'react'
import './App.css'

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://192.168.1.3:8080/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to process your request.'
        )
      }

      setMessage(
        data.message ||
          'If this email is registered, password reset instructions will be sent.'
      )
    } catch (error) {
      console.error('Forgot password error:', error)

      setMessage(
        error.message ||
          'Cannot connect to the server. Please check whether Spring Boot is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Forgot Password?</h2>

        <p>
          Enter the email address you used to register for StudyTogether.
        </p>

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        {message && <p role="status">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Send Reset Link'}
        </button>

        <button type="button" onClick={onBackToLogin}>
          Back to Login
        </button>
      </form>
    </div>
  )
}

export default ForgotPassword