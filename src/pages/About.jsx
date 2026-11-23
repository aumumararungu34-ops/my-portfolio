import EditableSections from '../components/EditableSections.jsx'
import useSiteContent from '../context/useSiteContent.js'

function About() {
  const { content } = useSiteContent()
  const about = content.about

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.25fr_.75fr] lg:px-8 lg:py-20">
      <EditableSections
        content={content}
        page="about"
        sections={{
          intro: (
            <header className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{about.eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl">{about.title}</h1>
            </header>
          ),
          biography: (
            <article className="space-y-5 text-base leading-8 text-slate-400">
              {about.biography.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
            </article>
          ),
          education: (
            <aside className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold">{about.educationHeading}</h2>
              <div className="mt-5 space-y-5 text-sm">
                {about.education.map((item, index) => (
                  <div key={`${index}-${item.title}`} className="border-l-2 border-blue-400 pl-4">
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </aside>
          ),
          goals: (
            <div className="lg:col-span-2 border-t border-slate-200 pt-10">
              <h2 className="text-2xl font-semibold">{about.goalsHeading}</h2>
              <ul className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                {about.goals.map((goal) => (
                  <li key={goal} className="rounded-md border border-slate-200 px-4 py-3">{goal}</li>
                ))}
              </ul>
            </div>
          ),
        }}
      />
    </section>
  )
}

export default About
