import { Link } from 'react-router-dom'
import useSiteContent from '../context/useSiteContent.js'

function Footer() {
  const { content } = useSiteContent()

  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-bold text-slate-950">{content.branding.name}</p>
          <p className="mt-2 text-sm text-slate-400">{content.branding.footerTagline}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400" aria-label="Footer navigation">
          {content.navigation.filter((item) => item.visible).map((item) => (
            <Link key={item.id} className="hover:text-slate-950" to={item.path}>{item.label}</Link>
          ))}
        </nav>
        <p className="text-sm text-slate-500 md:text-right">
          © {new Date().getFullYear()} {content.branding.copyright}
        </p>
      </div>
    </footer>
  )
}

export default Footer
