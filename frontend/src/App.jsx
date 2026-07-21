import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
import { useApi } from './hooks/useApi'
import { getProfile, trackVisit } from './api/resources'

import { AuthProvider } from './admin/context/AuthContext'
import { ToastProvider } from './admin/components/Toast'
import ProtectedRoute from './admin/components/ProtectedRoute'
import DashboardLayout from './admin/layout/DashboardLayout'
import Login from './admin/pages/Login'
import ForgotPassword from './admin/pages/ForgotPassword'
import ResetPassword from './admin/pages/ResetPassword'
import Overview from './admin/pages/Overview'
import Sections from './admin/pages/Sections'
import ProfileEdit from './admin/pages/ProfileEdit'
import BlogPostList from './admin/pages/BlogPostList'
import BlogPostEditor from './admin/pages/BlogPostEditor'
import Comments from './admin/pages/Comments'
import Messages from './admin/pages/Messages'
import ChangePassword from './admin/pages/ChangePassword'

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

function PublicLayout() {
  const { data: profile } = useApi(getProfile, [], null)

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
      </main>
      <Footer profile={profile} />
    </>
  )
}

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
        <Route path="blog" element={<BlogPostList />} />
        <Route path="blog/new" element={<BlogPostEditor />} />
        <Route path="blog/:slug/edit" element={<BlogPostEditor />} />
        <Route path="comments" element={<Comments />} />
        <Route path="messages" element={<Messages />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  )
}

function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return <AdminRoutes />
  }

  return <PublicLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <RouteTracker />
          <Layout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
