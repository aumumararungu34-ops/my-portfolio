import { Link } from 'react-router-dom'
import EditableSections from '../components/EditableSections.jsx'
import useSiteContent from '../context/useSiteContent.js'

function Home() {
  const { content } = useSiteContent()
  const home = content.home

  return (
    <section className="mx-auto grid min-h-[calc(100vh-176px)] max-w-6xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-20">
      <EditableSections
        content={content}
        page="home"
        sections={{
          intro: (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{home.eyebrow}</p>
              <h1 className="mt-5 max-w-3xl text-5xl font-medium leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[76px]">
                {home.name}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">{home.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/projects"
                  className="rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {home.primaryButton}
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:border-slate-950"
                >
                  {home.secondaryButton}
                </Link>
              </div>
            </div>
          ),
          portrait: (
            <div className="mx-auto w-full max-w-md">
              <div className="aspect-[4/5] overflow-hidden rounded-[2px] border border-slate-200 bg-slate-100 shadow-[0_24px_60px_-35px_rgba(15,23,42,.38)]">
                <img
                  src={home.profileImage}
                  alt={home.profileImageAlt}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                <span>{home.location}</span>
                <span>{home.discipline}</span>
              </div>
            </div>
          ),
        }}
      />
    </section>
  )
}

export default Home
