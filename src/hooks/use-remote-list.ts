import { useCallback, useEffect, useState } from 'react'

export function useRemoteList<T>(loader: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const nextData = await loader()
      setData(nextData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong while loading data.')
    } finally {
      setIsLoading(false)
    }
  }, [loader])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    data,
    error,
    isLoading,
    reload,
    setData,
  }
}
