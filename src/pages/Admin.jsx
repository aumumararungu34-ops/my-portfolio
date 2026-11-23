import { useCallback, useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebase.js'
import { starterProjects } from '../data/projects.js'
import useSiteContent from '../context/useSiteContent.js'

const tabs = [
  ['site', 'Site & layout'],
  ['home', 'Home'],
  ['about', 'About'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['contact', 'Contact'],
  ['footer', 'Footer'],
]

const emptyProject = { title: '', description: '', technologies: '', github: '', live: '', imageUrl: '' }

function Admin() {
  const { content, loading, error: contentError, saveContent } = useSiteContent()

  if (loading) {
    return <p className="mx-auto max-w-xl px-5 py-24 text-center text-slate-500" role="status">Loading website content…</p>
  }

  return <AdminWorkspace initialContent={content} contentError={contentError} saveContent={saveContent} />
}

function AdminWorkspace({ initialContent, contentError, saveContent }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(initialContent)
  const [tab, setTab] = useState('site')
  const [savingContent, setSavingContent] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [savingProject, setSavingProject] = useState(false)
  const [projects, setProjects] = useState([])
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadProjects = useCallback(async (seedIfEmpty = false) => {
    let snapshot = await getDocs(collection(db, 'portfolioProjects'))

    if (snapshot.empty && seedIfEmpty) {
      const catalog = await getDoc(doc(db, 'portfolioSettings', 'projectCatalog'))
      if (!catalog.exists()) {
        const batch = writeBatch(db)
        starterProjects.forEach(({ id, ...project }) => {
          batch.set(doc(db, 'portfolioProjects', id), { ...project, imageUrl: '' })
        })
        batch.set(doc(db, 'portfolioSettings', 'projectCatalog'), { initialized: true })
        await batch.commit()
        snapshot = await getDocs(collection(db, 'portfolioProjects'))
      }
    }

    return snapshot.docs
      .map((project) => ({ id: project.id, ...project.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [])

  useEffect(() => {
    let active = true

    async function loadInitialProjects() {
      try {
        const loadedProjects = await loadProjects(true)
        if (active) setProjects(loadedProjects)
      } catch (loadError) {
        if (active) setError(`Projects could not be loaded: ${loadError.message}`)
      } finally {
        if (active) setLoadingProjects(false)
      }
    }

    loadInitialProjects()
    return () => {
      active = false
    }
  }, [loadProjects])

  function updateGroup(group, key, value) {
    setDraft((current) => ({ ...current, [group]: { ...current[group], [key]: value } }))
  }

  function updateSectionSettings(page, sections) {
    setDraft((current) => ({
      ...current,
      layout: { ...current.layout, sections: { ...current.layout.sections, [page]: sections } },
    }))
  }

  async function handleSaveContent(event) {
    event.preventDefault()
    setSavingContent(true)
    setError('')
    setNotice('')
    try {
      const saved = await saveContent(draft)
      setDraft(saved)
      setNotice('Website changes saved and published.')
    } catch (saveError) {
      setError(`Website changes could not be saved: ${saveError.message}`)
    } finally {
      setSavingContent(false)
    }
  }

  function startEditingProject(project) {
    setEditingId(project.id)
    setProjectForm({
      title: project.title || '',
      description: project.description || '',
      technologies: (project.technologies || []).join(', '),
      github: project.github || '',
      live: project.live || '',
      imageUrl: project.imageUrl || '',
    })
    setError('')
    setNotice('')
  }

  function resetProjectForm() {
    setEditingId(null)
    setProjectForm(emptyProject)
    setError('')
  }

  async function handleSaveProject(event) {
    event.preventDefault()
    setSavingProject(true)
    setError('')
    setNotice('')

    const project = {
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      technologies: projectForm.technologies.split(',').map((technology) => technology.trim()).filter(Boolean),
      github: projectForm.github.trim(),
      live: projectForm.live.trim(),
      imageUrl: projectForm.imageUrl.trim(),
      order: editingId
        ? projects.find((item) => item.id === editingId)?.order ?? projects.length
        : Math.max(-1, ...projects.map((item) => item.order ?? -1)) + 1,
    }

    try {
      const id = editingId || doc(collection(db, 'portfolioProjects')).id
      await setDoc(doc(db, 'portfolioProjects', id), project)
      setProjects(await loadProjects())
      setNotice(editingId ? 'Project updated.' : 'Project added.')
      resetProjectForm()
    } catch (saveError) {
      setError(`Project could not be saved: ${saveError.message}`)
    } finally {
      setSavingProject(false)
    }
  }

  async function handleDeleteProject(project) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return

    setError('')
    setNotice('')
    try {
      await deleteDoc(doc(db, 'portfolioProjects', project.id))
      setProjects(await loadProjects())
      setNotice(`"${project.title}" was deleted.`)
      if (editingId === project.id) resetProjectForm()
    } catch (deleteError) {
      setError(`Project could not be deleted: ${deleteError.message}`)
    }
  }

  async function handleMoveProject(index, offset) {
    const destination = index + offset
    if (destination < 0 || destination >= projects.length) return

    const reordered = [...projects]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    const batch = writeBatch(db)
    reordered.forEach((project, order) => {
      batch.set(doc(db, 'portfolioProjects', project.id), {
        title: project.title,
        description: project.description,
        technologies: project.technologies || [],
        github: project.github || '',
        live: project.live || '',
        imageUrl: project.imageUrl || '',
        order,
      })
    })

    setError('')
    setNotice('')
    try {
      await batch.commit()
      setProjects(reordered.map((project, order) => ({ ...project, order })))
      setNotice('Project order updated.')
    } catch (moveError) {
      setError(`Project order could not be saved: ${moveError.message}`)
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth)
      navigate('/admin/login', { replace: true })
    } catch (signOutError) {
      setError(`Could not sign out: ${signOutError.message}`)
    }
  }

  const page = tabs.find(([id]) => id === tab)?.[1] || 'Site & layout'

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Portfolio admin</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">Website editor</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm font-medium text-slate-600 hover:text-slate-950" to="/">View website</Link>
            <button
              className="rounded-md border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <nav className="mb-8 flex gap-2 overflow-x-auto border-b border-slate-200" aria-label="Website editor sections">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === id ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-950'
              }`}
              onClick={() => { setTab(id); setError(''); setNotice('') }}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>

        {contentError && <p className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">{contentError}</p>}
        {error && <p className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        {notice && <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{notice}</p>}

        {tab === 'projects' ? (
          <ProjectsEditor
            content={draft}
            loading={loadingProjects}
            onChange={(key, value) => updateGroup('projectsPage', key, value)}
            onDelete={handleDeleteProject}
            onEdit={startEditingProject}
            onMove={handleMoveProject}
            onSaveContent={handleSaveContent}
            onProjectFormChange={setProjectForm}
            onProjectSave={handleSaveProject}
            onReset={resetProjectForm}
            projectForm={projectForm}
            projects={projects}
            savingContent={savingContent}
            saving={savingProject}
            editingId={editingId}
          />
        ) : (
          <form onSubmit={handleSaveContent}>
            <section className="max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{page} editor</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Edit {page.toLowerCase()}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Save and publish your changes to update the public portfolio immediately.</p>

              <div className="mt-8 space-y-8">
                {tab === 'site' && (
                  <SiteEditor
                    content={draft}
                    onBrandingChange={(key, value) => updateGroup('branding', key, value)}
                    onHomeEyebrowChange={(value) => updateGroup('home', 'eyebrow', value)}
                    onNavigationChange={(navigation) => setDraft((current) => ({ ...current, navigation }))}
                    onSectionSettingsChange={updateSectionSettings}
                    onThemeChange={(key, value) => updateGroup('theme', key, value)}
                  />
                )}
                {tab === 'home' && (
                  <HomeEditor
                    content={draft.home}
                    onChange={(key, value) => updateGroup('home', key, value)}
                  />
                )}
                {tab === 'about' && (
                  <AboutEditor
                    content={draft.about}
                    onChange={(key, value) => updateGroup('about', key, value)}
                  />
                )}
                {tab === 'skills' && (
                  <SkillsEditor
                    content={draft.skills}
                    onChange={(key, value) => updateGroup('skills', key, value)}
                  />
                )}
                {tab === 'contact' && (
                  <ContactEditor
                    content={draft.contact}
                    onChange={(key, value) => updateGroup('contact', key, value)}
                  />
                )}
                {tab === 'footer' && (
                  <BrandingEditor
                    content={draft.branding}
                    onChange={(key, value) => updateGroup('branding', key, value)}
                  />
                )}
              </div>

              {tab !== 'site' && tab !== 'footer' && <p className="mt-8 text-xs leading-5 text-slate-500">Page sections can be reordered or hidden from the Site &amp; layout tab.</p>}
              <button
                className="mt-8 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={savingContent}
                type="submit"
              >
                {savingContent ? 'Publishing…' : `Save & publish ${page.toLowerCase()}`}
              </button>
            </section>
          </form>
        )}
      </div>
    </main>
  )
}

function SiteEditor({ content, onBrandingChange, onHomeEyebrowChange, onNavigationChange, onSectionSettingsChange, onThemeChange }) {
  return (
    <>
      <div>
        <h3 className="text-lg font-semibold">Website identity</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField label="Name shown in the navigation" value={content.branding.name} onChange={(value) => onBrandingChange('name', value)} />
          <TextField label="Professional title" value={content.home.eyebrow} onChange={onHomeEyebrowChange} />
          <TextField label="Header button text" value={content.branding.hireButtonLabel} onChange={(value) => onBrandingChange('hireButtonLabel', value)} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Theme colors</h3>
        <p className="mt-1 text-sm text-slate-500">Choose colors for the site background, cards, text, borders, and accent buttons.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['accent', 'Accent color'],
            ['background', 'Page background'],
            ['surface', 'Card background'],
            ['text', 'Main text'],
            ['muted', 'Secondary text'],
            ['border', 'Borders'],
          ].map(([key, label]) => (
            <ColorField key={key} label={label} value={content.theme[key]} onChange={(value) => onThemeChange(key, value)} />
          ))}
        </div>
      </div>

      <NavigationEditor items={content.navigation} onChange={onNavigationChange} />
      <div>
        <h3 className="text-lg font-semibold">Page sections</h3>
        <p className="mt-1 text-sm text-slate-500">Show or hide sections, or change their order on each page.</p>
        <div className="mt-4 space-y-5">
          {Object.entries(content.layout.sections).map(([page, sections]) => (
            <div key={page} className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-3 font-semibold capitalize text-slate-900">{page}</h4>
              <SectionOrderEditor
                items={sections}
                onChange={(nextSections) => onSectionSettingsChange(page, nextSections)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function HomeEditor({ content, onChange }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Small heading" value={content.eyebrow} onChange={(value) => onChange('eyebrow', value)} />
        <TextField label="Name / main heading" value={content.name} onChange={(value) => onChange('name', value)} />
        <TextField label="Location under photo" value={content.location} onChange={(value) => onChange('location', value)} />
        <TextField label="Specialty under photo" value={content.discipline} onChange={(value) => onChange('discipline', value)} />
        <TextField label="First button text" value={content.primaryButton} onChange={(value) => onChange('primaryButton', value)} />
        <TextField label="Second button text" value={content.secondaryButton} onChange={(value) => onChange('secondaryButton', value)} />
      </div>
      <TextArea label="Introduction" value={content.summary} onChange={(value) => onChange('summary', value)} />
      <TextField label="Profile photo URL" value={content.profileImage} onChange={(value) => onChange('profileImage', value)} hint="Paste a direct image URL. Leave the existing value to keep the current photo." />
      <TextField label="Photo description (alt text)" value={content.profileImageAlt} onChange={(value) => onChange('profileImageAlt', value)} />
      {content.profileImage && <img className="max-h-64 rounded-md border border-slate-200 object-contain" src={content.profileImage} alt="Current profile preview" />}
    </>
  )
}

function AboutEditor({ content, onChange }) {
  return (
    <>
      <TextField label="Small heading" value={content.eyebrow} onChange={(value) => onChange('eyebrow', value)} />
      <TextArea label="Page title" value={content.title} onChange={(value) => onChange('title', value)} />
      <StringListEditor label="Biography paragraphs" values={content.biography} onChange={(value) => onChange('biography', value)} />
      <TextField label="Education section title" value={content.educationHeading} onChange={(value) => onChange('educationHeading', value)} />
      <ObjectListEditor
        label="Education entries"
        items={content.education}
        fields={[['title', 'School / program'], ['detail', 'Additional detail']]}
        onChange={(value) => onChange('education', value)}
      />
      <TextField label="Goals section title" value={content.goalsHeading} onChange={(value) => onChange('goalsHeading', value)} />
      <StringListEditor label="Professional goals" values={content.goals} onChange={(value) => onChange('goals', value)} />
    </>
  )
}

function SkillsEditor({ content, onChange }) {
  function updateCategory(index, key, value) {
    onChange('categories', content.categories.map((category, itemIndex) => (
      itemIndex === index ? { ...category, [key]: value } : category
    )))
  }

  function removeCategory(index) {
    onChange('categories', content.categories.filter((_, itemIndex) => itemIndex !== index))
  }

  function addCategory() {
    onChange('categories', [...content.categories, { title: 'New category', skills: [] }])
  }

  return (
    <>
      <TextField label="Small heading" value={content.eyebrow} onChange={(value) => onChange('eyebrow', value)} />
      <TextField label="Page title" value={content.title} onChange={(value) => onChange('title', value)} />
      <TextArea label="Introduction" value={content.description} onChange={(value) => onChange('description', value)} />
      <div>
        <h3 className="font-semibold">Skill categories</h3>
        <div className="mt-3 space-y-4">
          {content.categories.map((category, index) => (
            <div key={`${index}-${category.title}`} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <TextField label={`Category ${index + 1}`} value={category.title} onChange={(value) => updateCategory(index, 'title', value)} />
                <button className="mt-6 text-sm font-semibold text-red-700" onClick={() => removeCategory(index)} type="button">Remove</button>
              </div>
              <StringListEditor
                label="Skills"
                values={category.skills}
                onChange={(value) => updateCategory(index, 'skills', value)}
              />
            </div>
          ))}
        </div>
        <button className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={addCategory} type="button">
          Add category
        </button>
      </div>
    </>
  )
}

function ContactEditor({ content, onChange }) {
  const fields = [
    ['eyebrow', 'Small heading'],
    ['title', 'Page title'],
    ['emailLabel', 'Email card label'],
    ['email', 'Email address'],
    ['phoneLabel', 'Phone card label'],
    ['phoneDisplay', 'Phone as displayed'],
    ['phoneInternational', 'Phone number for links'],
    ['whatsappLabel', 'WhatsApp card label'],
    ['whatsappText', 'WhatsApp card text'],
    ['locationLabel', 'Location card label'],
    ['location', 'Location'],
    ['formTitle', 'Form heading'],
    ['formNameLabel', 'Name field label'],
    ['formEmailLabel', 'Email field label'],
    ['formSubjectLabel', 'Subject field label'],
    ['formMessageLabel', 'Message field label'],
    ['formSubmitLabel', 'Submit button text'],
    ['formSuccessMessage', 'Success message'],
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label]) => (
        <TextField key={key} label={label} value={content[key]} onChange={(value) => onChange(key, value)} />
      ))}
    </div>
  )
}

function BrandingEditor({ content, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField label="Footer role / tagline" value={content.footerTagline} onChange={(value) => onChange('footerTagline', value)} />
      <TextField label="Copyright name" value={content.copyright} onChange={(value) => onChange('copyright', value)} />
    </div>
  )
}

function ProjectsEditor({ content, loading, onChange, onDelete, onEdit, onMove, onSaveContent, onProjectFormChange, onProjectSave, onReset, projectForm, projects, savingContent, saving, editingId }) {
  const updateProjectField = (key, value) => onProjectFormChange((current) => ({ ...current, [key]: value }))

  return (
    <div className="grid gap-8 xl:grid-cols-[.9fr_1.1fr]">
      <div className="space-y-8">
        <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSaveContent}>
          <h2 className="text-xl font-semibold">Projects page heading</h2>
          <div className="mt-5 space-y-4">
            <TextField label="Small heading" value={content.projectsPage.eyebrow} onChange={(value) => onChange('eyebrow', value)} />
            <TextField label="Page title" value={content.projectsPage.title} onChange={(value) => onChange('title', value)} />
            <TextArea label="Introduction" value={content.projectsPage.description} onChange={(value) => onChange('description', value)} />
            <SaveContentButton disabled={savingContent} label={savingContent ? 'Publishing…' : 'Save & publish heading'} />
          </div>
        </form>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{editingId ? 'Edit project' : 'New project'}</p>
              <h2 className="mt-2 text-xl font-semibold">{editingId ? 'Update project details' : 'Add a project'}</h2>
            </div>
            {editingId && <button className="text-sm text-slate-500" onClick={onReset} type="button">Cancel</button>}
          </div>
          <form className="mt-5 space-y-4" onSubmit={onProjectSave}>
            <TextField label="Project name" required value={projectForm.title} onChange={(value) => updateProjectField('title', value)} />
            <TextArea label="Description" required value={projectForm.description} onChange={(value) => updateProjectField('description', value)} />
            <TextField label="Technologies (comma separated)" value={projectForm.technologies} onChange={(value) => updateProjectField('technologies', value)} />
            <TextField label="Project image URL (optional)" value={projectForm.imageUrl} onChange={(value) => updateProjectField('imageUrl', value)} />
            <TextField label="GitHub URL (optional)" type="url" value={projectForm.github} onChange={(value) => updateProjectField('github', value)} />
            <TextField label="Live demo URL (optional)" type="url" value={projectForm.live} onChange={(value) => updateProjectField('live', value)} />
            {projectForm.imageUrl && <img className="max-h-48 rounded-md border border-slate-200 object-contain" src={projectForm.imageUrl} alt="Project preview" />}
            <button className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">
              {saving ? 'Saving…' : editingId ? 'Save project' : 'Add project'}
            </button>
          </form>
        </section>
      </div>

      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Published content</p>
            <h2 className="mt-2 text-xl font-semibold">Your projects</h2>
          </div>
          <span className="text-sm text-slate-500">{projects.length} total</span>
        </div>
        {loading && <p className="mt-5 text-sm text-slate-500" role="status">Loading projects…</p>}
        {!loading && !projects.length && <p className="mt-5 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No projects found.</p>}
        <div className="mt-5 space-y-3">
          {projects.map((project, index) => (
            <article key={project.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-950">{project.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
                  <p className="mt-3 text-xs text-slate-500">{(project.technologies || []).join(' · ')}</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button aria-label={`Move ${project.title} up`} className="text-sm text-slate-600 disabled:opacity-40" disabled={index === 0} onClick={() => onMove(index, -1)} type="button">Up</button>
                  <button aria-label={`Move ${project.title} down`} className="text-sm text-slate-600 disabled:opacity-40" disabled={index === projects.length - 1} onClick={() => onMove(index, 1)} type="button">Down</button>
                  <button className="text-sm font-semibold text-blue-700" onClick={() => onEdit(project)} type="button">Edit</button>
                  <button className="text-sm font-semibold text-red-700" onClick={() => onDelete(project)} type="button">Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function NavigationEditor({ items, onChange }) {
  function update(index, key, value) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }

  function move(index, offset) {
    const destination = index + offset
    if (destination < 0 || destination >= items.length) return
    const reordered = [...items]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    onChange(reordered)
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Navigation links</h3>
      <p className="mt-1 text-sm text-slate-500">Change labels, hide links, or reorder them in the header and footer.</p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4">
            <div className="min-w-48 flex-1">
              <TextField label={`${item.path} label`} value={item.label} onChange={(value) => update(index, 'label', value)} />
            </div>
            <label className="flex items-center gap-2 pb-3 text-sm text-slate-700">
              <input checked={item.visible} onChange={(event) => update(index, 'visible', event.target.checked)} type="checkbox" />
              Show
            </label>
            <button aria-label={`Move ${item.label} up`} className="rounded border border-slate-300 px-3 py-2 text-sm" disabled={index === 0} onClick={() => move(index, -1)} type="button">Up</button>
            <button aria-label={`Move ${item.label} down`} className="rounded border border-slate-300 px-3 py-2 text-sm" disabled={index === items.length - 1} onClick={() => move(index, 1)} type="button">Down</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionOrderEditor({ items, onChange }) {
  function update(index, key, value) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }

  function move(index, offset) {
    const destination = index + offset
    if (destination < 0 || destination >= items.length) return
    const reordered = [...items]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    onChange(reordered)
  }

  return items.map((item, index) => (
    <div key={item.id} className="flex items-center justify-between gap-3 border-t border-slate-100 py-3">
      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input checked={item.visible} onChange={(event) => update(index, 'visible', event.target.checked)} type="checkbox" />
        {item.label}
      </label>
      <div className="flex gap-2">
        <button aria-label={`Move ${item.label} up`} className="rounded border border-slate-300 px-2.5 py-1 text-xs" disabled={index === 0} onClick={() => move(index, -1)} type="button">Up</button>
        <button aria-label={`Move ${item.label} down`} className="rounded border border-slate-300 px-2.5 py-1 text-xs" disabled={index === items.length - 1} onClick={() => move(index, 1)} type="button">Down</button>
      </div>
    </div>
  ))
}

function StringListEditor({ label, values, onChange }) {
  function update(index, value) {
    onChange(values.map((item, itemIndex) => itemIndex === index ? value : item))
  }

  return (
    <div>
      <h3 className="font-semibold">{label}</h3>
      <div className="mt-3 space-y-3">
        {values.map((value, index) => (
          <div key={`${label}-${index}`} className="flex items-start gap-2">
            <textarea
              className="min-h-12 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              onChange={(event) => update(index, event.target.value)}
              value={value}
            />
            <button
              aria-label={`Remove ${label} item ${index + 1}`}
              className="mt-2 text-sm font-semibold text-red-700"
              onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold" onClick={() => onChange([...values, ''])} type="button">
        Add item
      </button>
    </div>
  )
}

function ObjectListEditor({ label, items, fields, onChange }) {
  function update(index, key, value) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }

  return (
    <div>
      <h3 className="font-semibold">{label}</h3>
      <div className="mt-3 space-y-4">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="rounded-lg border border-slate-200 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(([key, fieldLabel]) => (
                <TextField key={key} label={fieldLabel} value={item[key]} onChange={(value) => update(index, key, value)} />
              ))}
            </div>
            <button className="mt-4 text-sm font-semibold text-red-700" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} type="button">
              Remove entry
            </button>
          </div>
        ))}
      </div>
      <button
        className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
        onClick={() => onChange([...items, Object.fromEntries(fields.map(([key]) => [key, '']))])}
        type="button"
      >
        Add entry
      </button>
    </div>
  )
}

function TextField({ label, value = '', onChange, type = 'text', required = false, hint = '' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

function TextArea({ label, value = '', onChange, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-md border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
    </label>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-slate-200 p-3">
      <input aria-label={label} className="h-10 w-12 cursor-pointer rounded border-0 p-0" onChange={(event) => onChange(event.target.value)} type="color" value={value} />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  )
}

function SaveContentButton({ disabled, label }) {
  return (
    <button className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={disabled} type="submit">
      {label}
    </button>
  )
}

export default Admin
