import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/ui/WhatsAppButton'
import ScrollToTopButton from './components/ui/ScrollToTopButton'
import CookieBanner from './components/ui/CookieBanner'
import Home from './pages/Home'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
import NotFound from './pages/NotFound'
import { useApi } from './hooks/useApi'
import { getProfile, getSocialLinks, trackVisit } from './api/resources'

import { AuthProvider } from './admin/context/AuthContext'
import { ToastProvider } from './admin/components/Toast'
import { ThemeProvider } from './lib/theme'
import ProtectedRoute from './admin/components/ProtectedRoute'
import DashboardLayout from './admin/layout/DashboardLayout'
import Login from './admin/pages/Login'
import ForgotPassword from './admin/pages/ForgotPassword'
import ResetPassword from './admin/pages/ResetPassword'
import Overview from './admin/pages/Overview'
import Sections from './admin/pages/Sections'
import ProfileEdit from './admin/pages/ProfileEdit'
import Experience from './admin/pages/Experience'
import Skills from './admin/pages/Skills'
import Education from './admin/pages/Education'
import Training from './admin/pages/Training'
import Projects from './admin/pages/Projects'
import Services from './admin/pages/Services'
import Pricing from './admin/pages/Pricing'
import References from './admin/pages/References'
import Languages from './admin/pages/Languages'
import BlogPostList from './admin/pages/BlogPostList'
import BlogPostEditor from './admin/pages/BlogPostEditor'
import Comments from './admin/pages/Comments'
import Messages from './admin/pages/Messages'
import ChangePassword from './admin/pages/ChangePassword'
import Personalization from './admin/pages/Personalization'

/** Renders nothing; fires a visit-tracking call and resets scroll position on every route change. */
function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    trackVisit(location.pathname, document.referrer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return null
}

/** Layout for all public (non-admin) routes — navbar, footer, and the persistent floating widgets (WhatsApp, scroll-to-top, cookie banner). */
function PublicLayout() {
  const { data: profile } = useApi(getProfile, [], null)
  const { data: socialLinks } = useApi(getSocialLinks, [], [])

  return (
    <>
      <Navbar profile={profile} />
      <main>
        <Routes>
          <Route path="/" element={<Home profile={profile} socialLinks={socialLinks} />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer profile={profile} socialLinks={socialLinks} />
      <WhatsAppButton />
      <ScrollToTopButton />
      <CookieBanner />
    </>
  )
}

/** Route table for the /admin subtree — public auth routes plus the protected dashboard and its nested pages. */
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password/:uid/:token" element={<ResetPassword />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="sections" element={<Sections />} />
        <Route path="profile" element={<ProfileEdit />} />
        <Route path="experience" element={<Experience />} />
        <Route path="skills" element={<Skills />} />
        <Route path="education" element={<Education />} />
        <Route path="training" element={<Training />} />
        <Route path="projects" element={<Projects />} />
        <Route path="services" element={<Services />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="references" element={<References />} />
        <Route path="languages" element={<Languages />} />
        <Route path="blog" element={<BlogPostList />} />
        <Route path="blog/new" element={<BlogPostEditor />} />
        <Route path="blog/:slug/edit" element={<BlogPostEditor />} />
        <Route path="comments" element={<Comments />} />
        <Route path="messages" element={<Messages />} />
        <Route path="personalization" element={<Personalization />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  )
}

/** Picks between the admin route tree and the public site layout based on the current path. */
function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return <AdminRoutes />
  }

  return <PublicLayout />
}

/** App root — sets up routing and the theme/auth/toast providers shared by both the public site and the admin dashboard. */
export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <RouteTracker />
              <Layout />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
