import { useEffect, useState } from 'react'
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import EditableSections from '../components/EditableSections.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { db } from '../firebase/firebase.js'
import useSiteContent from '../context/useSiteContent.js'
import { starterProjects } from '../data/projects.js'

function Projects() {
  const { content } = useSiteContent()
  const projectsPage = content.projectsPage
  const [projects, setProjects] = useState(starterProjects)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const unsubscribe = onSnapshot(
      collection(db, 'portfolioProjects'),
      (snapshot) => {
        if (!active) return
        let publishedProjects = snapshot.docs
          .map((project) => ({ id: project.id, ...project.data() }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

        if (snapshot.empty) {
          getDoc(doc(db, 'portfolioSettings', 'projectCatalog'))
            .then((catalog) => {
              if (!active) return
              setProjects(catalog.exists() ? [] : starterProjects)
              setLoading(false)
            })
            .catch((loadError) => {
              if (!active) return
              setError(`Projects could not be loaded: ${loadError.message}`)
              setLoading(false)
            })
          return
        }

        setProjects(publishedProjects)
        setError('')
        setLoading(false)
      },
      (loadError) => {
        if (!active) return
        setError(`Projects could not be loaded: ${loadError.message}`)
        setLoading(false)
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
      <EditableSections
        content={content}
        page="projects"
        sections={{
          intro: (
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{projectsPage.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">{projectsPage.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">{projectsPage.description}</p>
            </header>
          ),
          list: (
            <>
              {loading && <p className="mt-10 text-sm text-slate-500" role="status">Loading projects…</p>}
              {error && <p className="mt-10 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
              {!loading && !error && (projects.length ? (
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard key={project.id || project.title} project={project} />
                  ))}
                </div>
              ) : (
                <p className="mt-10 text-sm text-slate-500">No projects have been published yet.</p>
              ))}
            </>
          ),
        }}
      />
    </section>
  )
}

export default Projects
