function ProjectCard({ project }) {
  return (
    <article className="overflow-hidden border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-400 hover:shadow-[0_18px_45px_-30px_rgba(15,23,42,.45)]">
      <div className="flex h-48 items-center justify-center border-b border-slate-200 px-6" style={{ backgroundColor: 'var(--site-surface)' }}>
        {project.imageUrl ? (
          <img className="h-full w-full object-cover" src={project.imageUrl} alt={project.title} />
        ) : (
          <p className="text-center text-2xl font-medium tracking-[-0.02em] text-slate-400">{project.title}</p>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-xl font-semibold">{project.title}</h2>
        <p className="mt-3 min-h-20 text-sm leading-7 text-slate-400">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <span key={technology} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600">
              {technology}
            </span>
          ))}
        </div>
        {(project.github || project.live) && (
          <div className="mt-6 flex gap-3">
            {project.github && (
              <a className="text-sm font-semibold text-blue-400 hover:text-blue-300" href={project.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {project.live && (
              <a className="text-sm font-semibold text-slate-950 hover:text-blue-600" href={project.live} target="_blank" rel="noreferrer">
                Live Demo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default ProjectCard
