import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, firebaseConfigured } from '../firebase/firebase.js'
import useSiteContent from '../context/useSiteContent.js'

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

function ContactForm() {
  const { content } = useSiteContent()
  const contact = content.contact
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [submitting, setSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()

    if (submitting) return

    const isEmpty = Object.values(form).some((value) => !value.trim())
    if (isEmpty) {
      setStatus({ type: 'error', text: 'Please complete every field.' })
      return
    }

    if (!firebaseConfigured || !db) {
      setStatus({
        type: 'error',
        text: 'The Firestore connection is not configured. Please use email or phone instead.',
      })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', text: '' })

    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        createdAt: serverTimestamp(),
      })
      setForm(initialForm)
      setStatus({ type: 'success', text: contact.formSuccessMessage })
    } catch (error) {
      console.error('Contact form submission failed:', error)
      setStatus({ type: 'error', text: 'Your message could not be sent. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'mt-2 w-full rounded-[2px] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950'

  return (
    <form onSubmit={submit} className="border border-slate-200 bg-white p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-slate-700">
          {contact.formNameLabel}
          <input className={fieldClass} name="name" value={form.name} onChange={updateField} required />
        </label>
        <label className="text-sm text-slate-700">
          {contact.formEmailLabel}
          <input className={fieldClass} name="email" type="email" value={form.email} onChange={updateField} required />
        </label>
      </div>
      <label className="mt-5 block text-sm text-slate-700">
        {contact.formSubjectLabel}
        <input className={fieldClass} name="subject" value={form.subject} onChange={updateField} required />
      </label>
      <label className="mt-5 block text-sm text-slate-700">
        {contact.formMessageLabel}
        <textarea className={`${fieldClass} min-h-36 resize-y`} name="message" value={form.message} onChange={updateField} required />
      </label>

      {status.text && (
        <p
          role="status"
          className={`mt-5 text-sm ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {status.text}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Sending...' : contact.formSubmitLabel}
      </button>
    </form>
  )
}

export default ContactForm
