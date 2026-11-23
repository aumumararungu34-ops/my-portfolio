import profilePhoto from '../assets/profile-photo.png'

export const defaultSiteContent = {
  branding: {
    name: 'Ange UMUMARARUNGU',
    hireButtonLabel: 'Hire Me',
    footerTagline: 'Software Developer',
    copyright: 'Ange UMUMARARUNGU',
  },
  theme: {
    accent: '#1d4ed8',
    background: '#fcfcfb',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
  },
  navigation: [
    { id: 'home', label: 'Home', path: '/', visible: true },
    { id: 'about', label: 'About', path: '/about', visible: true },
    { id: 'skills', label: 'Skills', path: '/skills', visible: true },
    { id: 'projects', label: 'Projects', path: '/projects', visible: true },
    { id: 'contact', label: 'Contact', path: '/contact', visible: true },
  ],
  layout: {
    sections: {
      home: [
        { id: 'intro', label: 'Introduction', visible: true },
        { id: 'portrait', label: 'Profile photo', visible: true },
      ],
      about: [
        { id: 'intro', label: 'About heading', visible: true },
        { id: 'biography', label: 'Biography', visible: true },
        { id: 'education', label: 'Education', visible: true },
        { id: 'goals', label: 'Professional goals', visible: true },
      ],
      skills: [
        { id: 'intro', label: 'Skills heading', visible: true },
        { id: 'categories', label: 'Skill categories', visible: true },
      ],
      projects: [
        { id: 'intro', label: 'Projects heading', visible: true },
        { id: 'list', label: 'Project cards', visible: true },
      ],
      contact: [
        { id: 'intro', label: 'Contact heading', visible: true },
        { id: 'details', label: 'Contact details', visible: true },
        { id: 'form', label: 'Contact form', visible: true },
      ],
    },
  },
  home: {
    eyebrow: 'Software Developer',
    name: 'Ange UMUMARARUNGU',
    summary: 'I build responsive websites and practical software solutions while developing my frontend and backend skills in Rwanda.',
    location: 'Rwanda',
    discipline: 'Software Development',
    profileImage: profilePhoto,
    profileImageAlt: 'Ange UMUMARARUNGU',
    primaryButton: 'View Projects',
    secondaryButton: 'Contact Me',
  },
  about: {
    eyebrow: 'About',
    title: 'Learning technology and building practical solutions.',
    biography: [
      'My interest in technology began through Networking and Internet Technology. That background developed my understanding of computer systems and motivated me to continue into software development.',
      'I am currently studying Software Development at IDATECH. I enjoy creating responsive interfaces and learning how frontend applications connect with databases and backend services.',
    ],
    educationHeading: 'Education',
    education: [
      { title: 'Networking and Internet Technology', detail: 'High school background' },
      { title: 'Software Development — IDATECH', detail: 'Current studies' },
    ],
    goalsHeading: 'Professional goals',
    goals: [
      'Develop useful websites and applications',
      'Improve my frontend and backend skills',
      'Work with databases and backend technologies',
      'Build practical software solutions',
      'Grow professionally as a Full Stack Developer',
    ],
  },
  skills: {
    eyebrow: 'Skills',
    title: 'Technology & tools',
    description: 'Technologies used or learned through my portfolio projects and software development studies.',
    categories: [
      { title: 'Frontend Development', skills: ['HTML', 'CSS', 'JavaScript', 'React.js', 'Tailwind CSS'] },
      { title: 'Backend and Database', skills: ['Firebase', 'Firebase Authentication', 'Cloud Firestore', 'PHP', 'MySQL'] },
      { title: 'Development Tools', skills: ['Git', 'GitHub', 'Visual Studio Code', 'Vite'] },
    ],
  },
  projectsPage: {
    eyebrow: 'Projects',
    title: 'Selected work',
    description: 'Verified projects from my portfolio and development experience.',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Get in touch',
    emailLabel: 'Email',
    email: 'aumumararungu34@gmail.com',
    phoneLabel: 'Phone',
    phoneDisplay: '+250 783 300 438',
    phoneInternational: '250783300438',
    whatsappLabel: 'WhatsApp',
    whatsappText: 'Message on WhatsApp',
    locationLabel: 'Location',
    location: 'Rwanda',
    formTitle: 'Send a message',
    formNameLabel: 'Full name',
    formEmailLabel: 'Email address',
    formSubjectLabel: 'Subject',
    formMessageLabel: 'Message',
    formSubmitLabel: 'Send Message',
    formSuccessMessage: 'Your message was sent successfully.',
  },
}

export function mergeSiteContent(savedContent = {}) {
  const savedSections = savedContent.layout?.sections || {}
  const sections = Object.fromEntries(
    Object.entries(defaultSiteContent.layout.sections).map(([page, defaults]) => {
      const saved = Array.isArray(savedSections[page]) ? savedSections[page] : defaults
      const savedById = new Map(saved.map((section) => [section.id, section]))
      const ordered = saved
        .filter((section) => defaults.some((item) => item.id === section.id))
        .map((section) => ({
          ...defaults.find((item) => item.id === section.id),
          ...section,
        }))

      defaults.forEach((section) => {
        if (!savedById.has(section.id)) ordered.push(section)
      })

      return [page, ordered]
    }),
  )

  const navigationDefaults = new Map(defaultSiteContent.navigation.map((item) => [item.id, item]))
  const navigation = Array.isArray(savedContent.navigation)
    ? savedContent.navigation
      .filter((item) => navigationDefaults.has(item.id))
      .map((item) => ({ ...navigationDefaults.get(item.id), ...item }))
    : defaultSiteContent.navigation
  const savedNavigationIds = new Set(navigation.map((item) => item.id))
  defaultSiteContent.navigation.forEach((item) => {
    if (!savedNavigationIds.has(item.id)) navigation.push(item)
  })

  return {
    ...defaultSiteContent,
    ...savedContent,
    branding: { ...defaultSiteContent.branding, ...savedContent.branding },
    theme: { ...defaultSiteContent.theme, ...savedContent.theme },
    navigation,
    layout: { sections },
    home: { ...defaultSiteContent.home, ...savedContent.home },
    about: { ...defaultSiteContent.about, ...savedContent.about },
    skills: { ...defaultSiteContent.skills, ...savedContent.skills },
    projectsPage: { ...defaultSiteContent.projectsPage, ...savedContent.projectsPage },
    contact: { ...defaultSiteContent.contact, ...savedContent.contact },
  }
}
