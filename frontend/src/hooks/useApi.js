import { useEffect, useRef, useState } from 'react'

/**
 * Runs an async fetcher on mount (and whenever `deps` changes), tracking
 * loading/error/data state. Guards against setting state after unmount.
 * Callers wrapping a parameterized fetcher (e.g. `getBlogPost(slug)`) must
 * pass a closure since this hook always invokes `fetcher` with no arguments.
 */
export function useApi(fetcher, deps = [], initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
