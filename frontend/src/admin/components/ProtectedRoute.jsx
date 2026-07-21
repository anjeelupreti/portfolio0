import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Route guard that redirects to /admin/login when unauthenticated, preserving the attempted location for post-login redirect. Shows a loading state while auth status is still resolving. */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-fixed">
        <p className="font-mono text-sm text-cream-fixed/50">Checking session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
