import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import useSiteContent from '../context/useSiteContent.js'

function Navbar() {
  const { content } = useSiteContent()
  const [open, setOpen] = useState(false)
  const links = content.navigation.filter((item) => item.visible)

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors ${
      isActive ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950'
    }`

  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-200/80 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 lg:px-8" aria-label="Main navigation">
        <Link to="/" className="text-[13px] font-semibold tracking-[0.18em] text-slate-950" onClick={() => setOpen(false)}>
          {content.branding.name}
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map(({ id, label, path }) => (
            <NavLink key={id} to={path} className={linkClass}>{label}</NavLink>
          ))}
          <Link
            to="/admin/login"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-slate-950"
          >
            Admin
          </Link>
          <Link
            to="/contact"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-blue-500 hover:bg-blue-50"
          >
            {content.branding.hireButtonLabel}
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 md:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="text-xl leading-none">{open ? '×' : '☰'}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map(({ id, label, path }) => (
              <NavLink
                key={id}
                to={path}
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-sm ${
                    isActive ? 'bg-slate-100 text-slate-950' : 'text-slate-600'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/admin/login"
              className="mt-2 rounded-md border border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700"
              onClick={() => setOpen(false)}
            >
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
