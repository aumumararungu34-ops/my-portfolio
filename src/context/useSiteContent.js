import { useContext } from 'react'
import SiteContentContext from './siteContentContext.js'

function useSiteContent() {
  const context = useContext(SiteContentContext)
  if (!context) throw new Error('useSiteContent must be used within SiteContentProvider')
  return context
}

export default useSiteContent
