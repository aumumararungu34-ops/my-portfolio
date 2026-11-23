import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { auth } from '../firebase/firebase.js'

function AdminRoute({ children }) {
  const navigate = useNavigate()
  const [access, setAccess] = useState({ loading: true, user: null, isAdmin: false, error: '' })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setAccess({ loading: false, user: null, isAdmin: false, error: '' })
          return
        }

        try {
          const token = await user.getIdTokenResult()
          setAccess({
            loading: false,
            user,
            isAdmin: token.claims.admin === true,
            error: '',
          })
        } catch (error) {
          setAccess({ loading: false, user, isAdmin: false, error: error.message })
        }
      },
      (error) => setAccess({ loading: false, user: null, isAdmin: false, error: error.message }),
    )

    return unsubscribe
  }, [])

  async function handleSignOut() {
    try {
      await signOut(auth)
      navigate('/admin/login', { replace: true })
    } catch (error) {
      setAccess((current) => ({ ...current, error: `Could not sign out: ${error.message}` }))
    }
  }

  if (access.loading) {
    return <p className="mx-auto max-w-xl px-5 py-24 text-center text-slate-500" role="status">Checking administrator access…</p>
  }

  if (!access.user) return <Navigate to="/admin/login" replace />

  if (access.error || !access.isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-5">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Portfolio admin</p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">Administrator access required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {access.error || 'This account does not have the administrator role.'}
          </p>
          <button className="mt-6 font-semibold text-blue-700 hover:text-blue-800" onClick={handleSignOut} type="button">
            Sign out and return to login
          </button>
          <Link className="mt-4 block text-sm text-slate-500 hover:text-slate-950" to="/">Back to portfolio</Link>
        </section>
      </main>
    )
  }

  return children
}

export default AdminRoute
