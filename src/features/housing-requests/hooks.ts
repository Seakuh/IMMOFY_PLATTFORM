import { useState, useEffect } from 'react'
import { HousingRequest } from './types'
import { getHomepageData, getSimilarHousingRequests, HomepageData } from './api'

export function useHomepageData() {
  const [data, setData] = useState<HomepageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const result = await getHomepageData()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export function useSimilarHousingRequests(id: string, limit: number = 5) {
  const [housingRequests, setHousingRequests] = useState<HousingRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)

    const fetchSimilar = async () => {
      try {
        const result = await getSimilarHousingRequests(id, limit)
        setHousingRequests(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setHousingRequests([])
      } finally {
        setLoading(false)
      }
    }

    fetchSimilar()
  }, [id, limit])

  return { housingRequests, loading, error }
}