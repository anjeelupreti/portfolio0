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

import SEO from '../components/ui/SEO'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import ExperienceTimeline from '../components/sections/ExperienceTimeline'
import TechStack from '../components/sections/TechStack'
import Services from '../components/sections/Services'
import Portfolio from '../components/sections/Portfolio'
import Pricing from '../components/sections/Pricing'
import BlogPreview from '../components/sections/BlogPreview'
import Contact from '../components/sections/Contact'

/** Fallback section order when the site-sections endpoint is empty/unreachable. */
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

/** Public homepage — fetches all section data and renders sections in the order/visibility defined by the site-sections admin flags, falling back to DEFAULT_ORDER if unavailable. */
export default function Home({ profile, socialLinks }) {
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

  const SECTION_REGISTRY = {
    hero: () => <Hero profile={profile} socialLinks={socialLinks} skillCategories={skillCategories || []} />,
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

  const personJsonLd = profile && {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name,
    jobTitle: profile.title,
    description: profile.tagline || profile.summary,
    email: profile.email || undefined,
    image: profile.profile_image || undefined,
    url: typeof window !== 'undefined' ? window.location.origin : undefined,
    sameAs: (socialLinks || []).filter((s) => s.is_visible).map((s) => s.url),
  }

  return (
    <>
      <SEO
        title={profile ? `${profile.full_name} — ${profile.title}` : undefined}
        description={profile?.tagline || profile?.summary}
        image={profile?.profile_image}
        jsonLd={personJsonLd}
      />
      {order.map((key) => {
        const Component = SECTION_REGISTRY[key]
        if (!Component) return null
        if (key !== 'hero' && !isVisible(sections, key)) return null
        return <Component key={key} />
      })}
    </>
  )
}
