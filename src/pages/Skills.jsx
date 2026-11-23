import EditableSections from '../components/EditableSections.jsx'
import SkillCard from '../components/SkillCard.jsx'
import useSiteContent from '../context/useSiteContent.js'

function Skills() {
  const { content } = useSiteContent()
  const skills = content.skills

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
      <EditableSections
        content={content}
        page="skills"
        sections={{
          intro: (
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{skills.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">{skills.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">{skills.description}</p>
            </header>
          ),
          categories: (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {skills.categories.map((category) => (
                <SkillCard key={category.title} {...category} />
              ))}
            </div>
          ),
        }}
      />
    </section>
  )
}

export default Skills
