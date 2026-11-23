import { Fragment } from 'react'

function EditableSections({ content, page, sections }) {
  const settings = content.layout.sections[page] || []

  return settings
    .filter((section) => section.visible && sections[section.id])
    .map((section) => <Fragment key={section.id}>{sections[section.id]}</Fragment>)
}

export default EditableSections
