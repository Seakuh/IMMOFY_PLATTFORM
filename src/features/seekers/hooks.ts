import { useState, useEffect } from 'react'
import { Seeker, SearchFilters, SeekersResponse } from './types'
import { mockSeekers } from './mockData'

const MOCK_API_DELAY = 800

function filterSeekers(seekers: Seeker[], filters: SearchFilters): Seeker[] {
  return seekers.filter(seeker => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        seeker.name.toLowerCase().includes(searchLower) ||
        seeker.locations.some(loc => loc.toLowerCase().includes(searchLower)) ||
        seeker.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        seeker.bio?.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }

    if (filters.locations && filters.locations.length > 0) {
      const hasMatchingLocation = seeker.locations.some(loc => 
        filters.locations!.includes(loc)
      )
      if (!hasMatchingLocation) return false
    }

    if (filters.budgetMin && seeker.budgetMax && seeker.budgetMax < filters.budgetMin) {
      return false
    }

    if (filters.budgetMax && seeker.budgetMin && seeker.budgetMin > filters.budgetMax) {
      return false
    }

    if (filters.roomsMin && seeker.roomsMin && seeker.roomsMin < filters.roomsMin) {
      return false
    }

    if (filters.pets !== undefined && seeker.pets !== filters.pets) {
      return false
    }

    return true
  })
}

function sortSeekers(seekers: Seeker[], sort?: SearchFilters['sort']): Seeker[] {
  const sorted = [...seekers]
  
  switch (sort) {
    case 'budget_asc':
      return sorted.sort((a, b) => (a.budgetMin || 0) - (b.budgetMin || 0))
    case 'budget_desc':
      return sorted.sort((a, b) => (b.budgetMax || 0) - (a.budgetMax || 0))
    case 'newest':
    default:
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}

export function useSeekers(filters: SearchFilters = {}) {
  const [data, setData] = useState<SeekersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY))

        const filtered = filterSeekers(mockSeekers, filters)
        const sorted = sortSeekers(filtered, filters.sort)
        
        const page = filters.page || 1
        const limit = filters.limit || 20
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        
        const paginatedSeekers = sorted.slice(startIndex, endIndex)
        
        setData({
          seekers: paginatedSeekers,
          total: sorted.length,
          page,
          limit,
          hasMore: endIndex < sorted.length
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [JSON.stringify(filters)])

  return { data, loading, error }
}

export function useSeeker(id: string) {
  const [seeker, setSeeker] = useState<Seeker | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetchSeeker = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY))
        
        const foundSeeker = mockSeekers.find(s => s.id === id)
        if (!foundSeeker) {
          throw new Error('Seeker not found')
        }
        
        setSeeker(foundSeeker)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSeeker()
    }
  }, [id])

  return { seeker, loading, error }
}

export function useSimilarSeekers(id: string) {
  const [seekers, setSeekers] = useState<Seeker[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    setLoading(true)

    const fetchSimilar = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY))
        
        const currentSeeker = mockSeekers.find(s => s.id === id)
        if (!currentSeeker) return

        const similar = mockSeekers
          .filter(s => s.id !== id)
          .filter(s => 
            s.locations.some(loc => currentSeeker.locations.includes(loc)) ||
            Math.abs((s.budgetMin || 0) - (currentSeeker.budgetMin || 0)) < 300
          )
          .slice(0, 4)
        
        setSeekers(similar)
      } catch (err) {
        setSeekers([])
      } finally {
        setLoading(false)
      }
    }

    fetchSimilar()
  }, [id])

  return { seekers, loading }
}