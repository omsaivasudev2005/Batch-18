import { useEffect, useState } from 'react'

export default function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fn()
      .then((res) => mounted && setData(res))
      .catch((err) => mounted && setError(err))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
