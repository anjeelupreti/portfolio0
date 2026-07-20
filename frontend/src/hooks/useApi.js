import { useEffect, useRef, useState } from 'react'

/**
 * Runs an async fetcher on mount, tracking loading/error/data state.
 * fetcher must resolve gracefully (the api/resources.js helpers already
 * catch network errors and return fallbacks), but this hook also guards
 * against setting state after unmount and against thrown errors.
 *
 * @param {() => Promise<any>} fetcher
 * @param {any[]} deps
 * @param {any} initialData
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
