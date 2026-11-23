import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { Link, useNavigate } from 'react-router-dom'
import { auth, functions } from '../firebase/firebase.js'

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
      const currentToken = await user.getIdTokenResult(true)
      if (currentToken.claims.admin !== true) {
        await httpsCallable(functions, 'activateSingleAdmin')()
        await user.getIdToken(true)
      }
      navigate('/admin', { replace: true })
    } catch (signInError) {
      const credentialErrors = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found']
      setError(
        credentialErrors.includes(signInError.code)
          ? 'The email or password is incorrect.'
          : `Sign-in or admin access failed: ${signInError.message}`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-5 py-12">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-45px_rgba(15,23,42,.35)] sm:p-9">
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-950">
          Ange UMUMARARUNGU
        </Link>
        <div className="mt-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Private area</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Admin sign in</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in with the email and password already registered in Firebase to edit your portfolio.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="admin-email">Email address</label>
            <input
              autoComplete="username"
              className="w-full rounded-md border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="admin-email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="admin-password">Password</label>
            <input
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="admin-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

          <button
            className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/" className="mt-7 inline-block text-sm text-slate-500 hover:text-slate-950">← Back to portfolio</Link>
      </section>
    </main>
  )
}

export default AdminLogin
