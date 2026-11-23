import EditableSections from '../components/EditableSections.jsx'
import ContactForm from '../components/ContactForm.jsx'
import useSiteContent from '../context/useSiteContent.js'

function Contact() {
  const { content } = useSiteContent()
  const contact = content.contact
  const phone = contact.phoneInternational.replace(/[^\d]/g, '')

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[.75fr_1.25fr] lg:px-8 lg:py-20">
      <EditableSections
        content={content}
        page="contact"
        sections={{
          intro: (
            <header className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{contact.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">{contact.title}</h1>
            </header>
          ),
          details: (
            <aside className="space-y-4">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400">
                  <span className="text-xs uppercase tracking-wider text-slate-500">{contact.emailLabel}</span>
                  <span className="mt-2 block text-sm text-slate-950">{contact.email}</span>
                </a>
              )}
              {phone && (
                <>
                  <a href={`tel:+${phone}`} className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400">
                    <span className="text-xs uppercase tracking-wider text-slate-500">{contact.phoneLabel}</span>
                    <span className="mt-2 block text-sm text-slate-950">{contact.phoneDisplay}</span>
                  </a>
                  <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400">
                    <span className="text-xs uppercase tracking-wider text-slate-500">{contact.whatsappLabel}</span>
                    <span className="mt-2 block text-sm text-slate-950">{contact.whatsappText}</span>
                  </a>
                </>
              )}
              {contact.location && (
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <span className="text-xs uppercase tracking-wider text-slate-500">{contact.locationLabel}</span>
                  <span className="mt-2 block text-sm text-slate-950">{contact.location}</span>
                </div>
              )}
            </aside>
          ),
          form: (
            <div>
              <h2 className="mb-5 text-2xl font-semibold">{contact.formTitle}</h2>
              <ContactForm />
            </div>
          ),
        }}
      />
    </section>
  )
}

export default Contact
