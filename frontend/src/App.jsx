import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
import { useApi } from './hooks/useApi'
import { getProfile, trackVisit } from './api/resources'

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

function Layout() {
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

export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Layout />
    </BrowserRouter>
  )
}
