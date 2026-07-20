import { useApi } from '../hooks/useApi'
import {
  getExperience,
  getProjects,
  getSkillCategories,
  getEducation,
  getTraining,
  getLanguages,
  getReferences,
  getServices,
  getPricingPlans,
  getBlogPosts,
  getSiteSections,
} from '../api/resources'
import { isVisible } from '../lib/flags'

import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import ExperienceTimeline from '../components/sections/ExperienceTimeline'
import TechStack from '../components/sections/TechStack'
import Services from '../components/sections/Services'
import Portfolio from '../components/sections/Portfolio'
import Pricing from '../components/sections/Pricing'
import BlogPreview from '../components/sections/BlogPreview'
import Contact from '../components/sections/Contact'

// Fallback order used when the site-sections endpoint is empty/unreachable,
// so the page never renders blank just because the flag service is down.
const DEFAULT_ORDER = [
  'hero',
  'about',
  'timeline',
  'tech-stack',
  'services',
  'projects',
  'pricing',
  'blog',
  'contact',
]

export default function Home({ profile }) {
  const { data: experience } = useApi(getExperience, [], [])
  const { data: projects } = useApi(getProjects, [], [])
  const { data: skillCategories } = useApi(getSkillCategories, [], [])
  const { data: education } = useApi(getEducation, [], [])
  const { data: training } = useApi(getTraining, [], [])
  const { data: languages } = useApi(getLanguages, [], [])
  const { data: references } = useApi(getReferences, [], [])
  const { data: services } = useApi(getServices, [], [])
  const { data: pricingPlans } = useApi(getPricingPlans, [], [])
  const { data: blogPosts } = useApi(getBlogPosts, [], [])
  const { data: siteSections } = useApi(getSiteSections, [], [])

  // Registry mapping a site-section `key` to the component + props it needs.
  const SECTION_REGISTRY = {
    hero: () => <Hero profile={profile} />,
    about: () => (
      <About
        profile={profile}
        education={education || []}
        training={training || []}
        languages={languages || []}
        references={references || []}
      />
    ),
    timeline: () => <ExperienceTimeline experience={experience || []} />,
    'tech-stack': () => <TechStack skillCategories={skillCategories || []} />,
    services: () => <Services services={services || []} />,
    projects: () => <Portfolio projects={projects || []} />,
    pricing: () => <Pricing plans={pricingPlans || []} />,
    blog: () => <BlogPreview posts={blogPosts || []} />,
    contact: () => <Contact profile={profile} />,
  }

  const sections = siteSections && siteSections.length > 0 ? siteSections : null
  const order = sections ? sections.map((s) => s.key) : DEFAULT_ORDER

  return (
    <>
      {order.map((key) => {
        const Component = SECTION_REGISTRY[key]
        if (!Component) return null
        // Hero always renders regardless of its flag — it's the page's entry
        // point and hiding it would leave the page looking broken.
        if (key !== 'hero' && !isVisible(sections, key)) return null
        return <Component key={key} />
      })}
    </>
  )
}
