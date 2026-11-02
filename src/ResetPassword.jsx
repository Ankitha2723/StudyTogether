
import { useState } from 'react'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (!token) {
      setMessage('Invalid or missing reset link. Please request a new one.')
      return
    }

    if (password.length < 8) {
      setMessage('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:8080/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            newPassword: password,
          }),
        },
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unable to reset password.')
      }

      setMessage(
        data.message || 'Password reset successful. Please log in.',
      )
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage(error.message || 'Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-page">
      <h1>StudyTogether</h1>
      <h2>Reset Your Password</h2>

      <p>Enter your new password below.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <button
        type="button"
        onClick={() => {
          window.location.href = '/'
        }}
      >
        Back to Home
      </button>
    </div>
  )
}

export default ResetPassword
