import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login, register } = useAuth()
  const location = useLocation()
  const from = (location.state && location.state.from) || '/'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already logged in (or just logged in): go back to where they came from.
  if (user) return <Navigate to={from} replace />

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const switchMode = (m) => {
    setMode(m)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="wrap page">
      <div className="auth-card">
        <h1 className="h1">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <div className="seg">
          <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Log in</button>
          <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => switchMode('register')}>Sign up</button>
        </div>
        <form onSubmit={submit} className="form">
          {mode === 'register' && (
            <label>Name
              <input name="name" value={form.name} onChange={update} autoComplete="name" required />
            </label>
          )}
          <label>Email
            <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
          </label>
          <label>Password
            <input name="password" type="password" value={form.password} onChange={update}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 6 : undefined} required />
          </label>
          {error && <p className="alert" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
