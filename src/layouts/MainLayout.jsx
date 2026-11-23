import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import useSiteContent from '../context/useSiteContent.js'

function MainLayout() {
  const { content, error } = useSiteContent()

  return (
    <div
      className="site-theme min-h-screen antialiased"
      style={{
        '--site-accent': content.theme.accent,
        '--site-background': content.theme.background,
        '--site-surface': content.theme.surface,
        '--site-text': content.theme.text,
        '--site-muted': content.theme.muted,
        '--site-border': content.theme.border,
      }}
    >
      <Navbar />
      {error && <p className="border-b border-amber-300 bg-amber-50 px-5 py-3 text-center text-sm text-amber-900" role="alert">{error}</p>}
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
