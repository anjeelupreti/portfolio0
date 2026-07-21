import client from './client'

/**
 * Generic safe GET helper — returns fallback data instead of throwing,
 * so a section of the page can render gracefully even if the API/network fails.
 */
async function safeGet(url, fallback) {
  try {
    const { data } = await client.get(url)
    return data
  } catch (err) {
    console.warn(`API request failed: ${url}`, err?.message || err)
    return fallback
  }
}

export const getProfile = async () => {
  const data = await safeGet('/profile/', null)
  if (!data) return null
  return Array.isArray(data) ? data[0] || null : data
}

export const getExperience = () => safeGet('/experience/', [])
export const getProjects = () => safeGet('/projects/', [])
export const getSkillCategories = () => safeGet('/skill-categories/', [])
export const getEducation = () => safeGet('/education/', [])
export const getTraining = () => safeGet('/training/', [])
export const getReferences = () => safeGet('/references/', [])
export const getLanguages = () => safeGet('/languages/', [])
export const getServices = () => safeGet('/services/', [])
export const getPricingPlans = () => safeGet('/pricing-plans/', [])
/** Feature-flag/visibility registry for homepage sections. Returns `[{id, key, label, is_visible, order}]`, already sorted by `order`. */
export const getSiteSections = () => safeGet('/site-sections/', [])
export const getBlogCategories = () => safeGet('/blog-categories/', [])
export const getBlogTags = () => safeGet('/blog-tags/', [])
export const getBlogPosts = () => safeGet('/blog-posts/', [])
export const getBlogPost = (slug) => safeGet(`/blog-posts/${slug}/`, null)
/** Site-wide color theme (singleton), read-only from this client. */
export const getSiteTheme = () => safeGet('/site-theme/', null)
/** Site-wide widget settings (singleton — WhatsApp button, scroll-to-top, cookie banner, blog sharing), read-only from this client. */
export const getSiteWidgets = () => safeGet('/site-widgets/', null)
/** Public social/contact links `[{id, platform, platform_label, url, is_visible, order}]`, already sorted by `order`. */
export const getSocialLinks = () => safeGet('/social-links/', [])

export const postBlogComment = (payload) => client.post('/blog-comments/', payload)
export const postContact = (payload) => client.post('/contact/', payload)

/** Fire-and-forget pageview tracker — never blocks the UI and never throws. */
export const trackVisit = (path, referrer) => {
  client
    .post('/track-visit/', { path, referrer })
    .catch(() => {})
}
