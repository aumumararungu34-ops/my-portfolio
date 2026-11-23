import { useCallback, useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { defaultSiteContent, mergeSiteContent } from '../data/siteContent.js'
import SiteContentContext from './siteContentContext.js'

const siteContentRef = doc(db, 'portfolioSettings', 'siteContent')

function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultSiteContent)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const unsubscribe = onSnapshot(
      siteContentRef,
      (snapshot) => {
        if (!active) return
        if (snapshot.exists()) setContent(mergeSiteContent(snapshot.data()))
        setError('')
        setLoading(false)
      },
      (loadError) => {
        if (!active) return
        setError(`Website settings could not be loaded: ${loadError.message}`)
        setLoading(false)
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const saveContent = useCallback(async (nextContent) => {
    const normalized = mergeSiteContent(nextContent)
    await setDoc(siteContentRef, normalized)
    setContent(normalized)
    setError('')
    return normalized
  }, [])

  const value = useMemo(
    () => ({ content, loading, error, saveContent }),
    [content, loading, error, saveContent],
  )

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export default SiteContentProvider
