import adminClient from './adminClient'

// ---- Auth ----
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

// ---- Site sections ----
export const getSiteSections = () => adminClient.get('/site-sections/').then((r) => r.data)

export const patchSiteSection = (id, payload) =>
  adminClient.patch(`/site-sections/${id}/`, payload).then((r) => r.data)

// ---- Profile ----
export const getProfile = () => adminClient.get('/profile/').then((r) => r.data)

export const updateProfile = (id, payload) =>
  adminClient.patch(`/profile/${id}/`, payload).then((r) => r.data)

// ---- Blog posts ----
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

// ---- Blog comments ----
export const getBlogComments = () => adminClient.get('/blog-comments/').then((r) => r.data)

export const approveBlogComment = (id) =>
  adminClient.patch(`/blog-comments/${id}/`, { is_approved: true }).then((r) => r.data)

export const deleteBlogComment = (id) => adminClient.delete(`/blog-comments/${id}/`)

// ---- Site theme ----
export const getSiteThemeAdmin = () => adminClient.get('/site-theme/').then((r) => r.data)

export const updateSiteTheme = (payload) =>
  adminClient.patch('/site-theme/', payload).then((r) => r.data)

// ---- Analytics ----
export const getAnalyticsSummary = () => adminClient.get('/analytics/summary/').then((r) => r.data)

// ---- Contact messages ----
export const getContactMessages = () => adminClient.get('/contact-messages/').then((r) => r.data)

export const markContactMessageRead = (id) =>
  adminClient.patch(`/contact-messages/${id}/mark_read/`).then((r) => r.data)

// ---- Send email (reply to a contact message, or standalone compose) ----
// SMTP failures come back from the API as a 202/502-shaped body with a
// non-empty `send_error` field rather than a clean 2xx — axios still rejects
// on non-2xx, so we catch and surface the response body (with the record
// that WAS created) instead of losing it as a generic network error.
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
