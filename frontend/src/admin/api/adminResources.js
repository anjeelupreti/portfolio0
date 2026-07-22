import adminClient from './adminClient'

export const login = (username, password) =>
  adminClient.post('/auth/login/', { username, password }).then((r) => r.data)

export const getMe = () => adminClient.get('/auth/me/').then((r) => r.data)

export const updateMe = (payload) => adminClient.patch('/auth/me/', payload).then((r) => r.data)

export const changePassword = (payload) =>
  adminClient.post('/auth/change-password/', payload).then((r) => r.data)

export const forgotPassword = (email) =>
  adminClient.post('/auth/forgot-password/', { email }).then((r) => r.data)

export const resetPassword = (payload) =>
  adminClient.post('/auth/reset-password/', payload).then((r) => r.data)

export const getSiteSections = () => adminClient.get('/site-sections/').then((r) => r.data)

export const patchSiteSection = (id, payload) =>
  adminClient.patch(`/site-sections/${id}/`, payload).then((r) => r.data)

export const getProfile = () => adminClient.get('/profile/').then((r) => r.data)

export const updateProfile = (id, payload) =>
  adminClient.patch(`/profile/${id}/`, payload).then((r) => r.data)

/** Uploads a resume file via multipart form data. Do not set Content-Type manually — the browser must generate the boundary itself, or Django rejects the body. */
export const uploadResume = (id, file) => {
  const formData = new FormData()
  formData.append('resume_file', file)
  return adminClient.patch(`/profile/${id}/`, formData).then((r) => r.data)
}

/** Uploads a profile photo via multipart form data; same Content-Type caveat as uploadResume. */
export const uploadProfileImage = (id, file) => {
  const formData = new FormData()
  formData.append('profile_image', file)
  return adminClient.patch(`/profile/${id}/`, formData).then((r) => r.data)
}

export const getTrainingAdmin = () => adminClient.get('/training/').then((r) => r.data)

export const createTraining = (payload) =>
  adminClient.post('/training/', payload).then((r) => r.data)

export const updateTraining = (id, payload) =>
  adminClient.patch(`/training/${id}/`, payload).then((r) => r.data)

export const deleteTraining = (id) => adminClient.delete(`/training/${id}/`)

/** Uploads a certificate file via multipart form data; same Content-Type caveat as uploadResume. */
export const uploadTrainingCertificate = (id, file) => {
  const formData = new FormData()
  formData.append('certificate_file', file)
  return adminClient.patch(`/training/${id}/`, formData).then((r) => r.data)
}

export const getServicesAdmin = () => adminClient.get('/services/').then((r) => r.data)

export const createService = (payload) =>
  adminClient.post('/services/', payload).then((r) => r.data)

export const updateService = (id, payload) =>
  adminClient.patch(`/services/${id}/`, payload).then((r) => r.data)

export const deleteService = (id) => adminClient.delete(`/services/${id}/`)

export const getProjectsAdmin = () => adminClient.get('/projects/').then((r) => r.data)

export const createProject = (payload) =>
  adminClient.post('/projects/', payload).then((r) => r.data)

export const updateProject = (id, payload) =>
  adminClient.patch(`/projects/${id}/`, payload).then((r) => r.data)

export const deleteProject = (id) => adminClient.delete(`/projects/${id}/`)

/** Uploads a project cover image via multipart form data; same Content-Type caveat as uploadResume. */
export const uploadProjectImage = (id, file) => {
  const formData = new FormData()
  formData.append('image', file)
  return adminClient.patch(`/projects/${id}/`, formData).then((r) => r.data)
}

export const getReferencesAdmin = () => adminClient.get('/references/').then((r) => r.data)

export const createReference = (payload) =>
  adminClient.post('/references/', payload).then((r) => r.data)

export const updateReference = (id, payload) =>
  adminClient.patch(`/references/${id}/`, payload).then((r) => r.data)

export const deleteReference = (id) => adminClient.delete(`/references/${id}/`)

export const getBlogPosts = () => adminClient.get('/blog-posts/').then((r) => r.data)

export const getBlogPost = (slug) => adminClient.get(`/blog-posts/${slug}/`).then((r) => r.data)

export const createBlogPost = (payload) =>
  adminClient.post('/blog-posts/', payload).then((r) => r.data)

export const updateBlogPost = (slug, payload) =>
  adminClient.patch(`/blog-posts/${slug}/`, payload).then((r) => r.data)

export const deleteBlogPost = (slug) => adminClient.delete(`/blog-posts/${slug}/`)

export const getBlogCategories = () => adminClient.get('/blog-categories/').then((r) => r.data)

export const createBlogCategory = (payload) =>
  adminClient.post('/blog-categories/', payload).then((r) => r.data)

export const getBlogTags = () => adminClient.get('/blog-tags/').then((r) => r.data)

export const createBlogTag = (payload) => adminClient.post('/blog-tags/', payload).then((r) => r.data)

export const getBlogComments = () => adminClient.get('/blog-comments/').then((r) => r.data)

export const approveBlogComment = (id) =>
  adminClient.patch(`/blog-comments/${id}/`, { is_approved: true }).then((r) => r.data)

export const deleteBlogComment = (id) => adminClient.delete(`/blog-comments/${id}/`)

export const getSiteThemeAdmin = () => adminClient.get('/site-theme/').then((r) => r.data)

export const updateSiteTheme = (payload) =>
  adminClient.patch('/site-theme/', payload).then((r) => r.data)

export const getSiteWidgetsAdmin = () => adminClient.get('/site-widgets/').then((r) => r.data)

export const updateSiteWidgets = (payload) =>
  adminClient.patch('/site-widgets/', payload).then((r) => r.data)

export const getEmailSettingsAdmin = () => adminClient.get('/email-settings/').then((r) => r.data)

export const updateEmailSettings = (payload) =>
  adminClient.patch('/email-settings/', payload).then((r) => r.data)

export const getSocialLinksAdmin = () => adminClient.get('/social-links/').then((r) => r.data)

export const createSocialLink = (payload) =>
  adminClient.post('/social-links/', payload).then((r) => r.data)

export const updateSocialLink = (id, payload) =>
  adminClient.patch(`/social-links/${id}/`, payload).then((r) => r.data)

export const deleteSocialLink = (id) => adminClient.delete(`/social-links/${id}/`)

export const getPricingPlansAdmin = () => adminClient.get('/pricing-plans/').then((r) => r.data)

export const createPricingPlan = (payload) =>
  adminClient.post('/pricing-plans/', payload).then((r) => r.data)

export const updatePricingPlan = (id, payload) =>
  adminClient.patch(`/pricing-plans/${id}/`, payload).then((r) => r.data)

export const deletePricingPlan = (id) => adminClient.delete(`/pricing-plans/${id}/`)

export const createPricingFeature = (payload) =>
  adminClient.post('/pricing-features/', payload).then((r) => r.data)

export const updatePricingFeature = (id, payload) =>
  adminClient.patch(`/pricing-features/${id}/`, payload).then((r) => r.data)

export const deletePricingFeature = (id) => adminClient.delete(`/pricing-features/${id}/`)

export const getSkillCategoriesAdmin = () => adminClient.get('/skill-categories/').then((r) => r.data)

export const createSkillCategory = (payload) =>
  adminClient.post('/skill-categories/', payload).then((r) => r.data)

export const updateSkillCategory = (id, payload) =>
  adminClient.patch(`/skill-categories/${id}/`, payload).then((r) => r.data)

export const deleteSkillCategory = (id) => adminClient.delete(`/skill-categories/${id}/`)

export const createSkill = (payload) => adminClient.post('/skills/', payload).then((r) => r.data)

export const updateSkill = (id, payload) =>
  adminClient.patch(`/skills/${id}/`, payload).then((r) => r.data)

export const deleteSkill = (id) => adminClient.delete(`/skills/${id}/`)

export const getLanguagesAdmin = () => adminClient.get('/languages/').then((r) => r.data)

export const createLanguage = (payload) =>
  adminClient.post('/languages/', payload).then((r) => r.data)

export const updateLanguage = (id, payload) =>
  adminClient.patch(`/languages/${id}/`, payload).then((r) => r.data)

export const deleteLanguage = (id) => adminClient.delete(`/languages/${id}/`)

export const getExperienceAdmin = () => adminClient.get('/experience/').then((r) => r.data)

export const createExperience = (payload) =>
  adminClient.post('/experience/', payload).then((r) => r.data)

export const updateExperience = (id, payload) =>
  adminClient.patch(`/experience/${id}/`, payload).then((r) => r.data)

export const deleteExperience = (id) => adminClient.delete(`/experience/${id}/`)

export const createExperienceHighlight = (payload) =>
  adminClient.post('/experience-highlights/', payload).then((r) => r.data)

export const updateExperienceHighlight = (id, payload) =>
  adminClient.patch(`/experience-highlights/${id}/`, payload).then((r) => r.data)

export const deleteExperienceHighlight = (id) => adminClient.delete(`/experience-highlights/${id}/`)

export const getEducationAdmin = () => adminClient.get('/education/').then((r) => r.data)

export const createEducation = (payload) =>
  adminClient.post('/education/', payload).then((r) => r.data)

export const updateEducation = (id, payload) =>
  adminClient.patch(`/education/${id}/`, payload).then((r) => r.data)

export const deleteEducation = (id) => adminClient.delete(`/education/${id}/`)

export const getAnalyticsSummary = () => adminClient.get('/analytics/summary/').then((r) => r.data)

export const getContactMessages = () => adminClient.get('/contact-messages/').then((r) => r.data)

export const markContactMessageRead = (id) =>
  adminClient.patch(`/contact-messages/${id}/mark_read/`).then((r) => r.data)

/**
 * Sends an email (reply to a contact message, or standalone compose). SMTP failures come back
 * as a non-2xx response with a `send_error` field rather than a clean success, so this catches
 * that rejection and returns `{ data, ok: false }` instead of throwing, preserving the created record.
 */
export const sendEmail = (payload) =>
  adminClient
    .post('/send-email/', payload)
    .then((r) => ({ data: r.data, ok: true }))
    .catch((err) => {
      if (err.response?.data) {
        return { data: err.response.data, ok: false }
      }
      throw err
    })
