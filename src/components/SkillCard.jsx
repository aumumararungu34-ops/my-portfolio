function SkillCard({ title, skills }) {
  return (
    <article className="border border-slate-200 bg-white p-6">
      <h2 className="border-b border-slate-200 pb-4 text-lg font-semibold text-slate-950">{title}</h2>
      <ul className="mt-5 space-y-3">
        {skills.map((skill) => (
          <li key={skill} className="flex items-center gap-3 text-sm text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {skill}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default SkillCard
