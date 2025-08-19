import { apiRequest } from '@/lib/apiClient'
import { Seeker, SearchFilters, SeekersResponse, FavoriteItem, HistoryItem } from './types'

export async function getSeekers(filters: SearchFilters = {}): Promise<SeekersResponse> {
  const searchParams = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })

  return apiRequest<SeekersResponse>(`/seekers?${searchParams.toString()}`)
}

export async function getSeeker(id: string): Promise<Seeker> {
  return apiRequest<Seeker>(`/seekers/${id}`)
}

export async function getSimilarSeekers(id: string): Promise<Seeker[]> {
  return apiRequest<Seeker[]>(`/seekers/similar/${id}`)
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  return apiRequest<FavoriteItem[]>('/user/faves')
}

export async function addFavorite(seekerId: string): Promise<void> {
  await apiRequest('/user/faves', {
    method: 'POST',
    body: JSON.stringify({ seekerId })
  })
}

export async function removeFavorite(seekerId: string): Promise<void> {
  await apiRequest(`/user/faves/${seekerId}`, {
    method: 'DELETE'
  })
}

export async function addToHistory(seekerId: string): Promise<void> {
  await apiRequest('/user/history', {
    method: 'POST',
    body: JSON.stringify({ 
      seekerId, 
      viewedAt: new Date().toISOString() 
    })
  })
}

export async function getHistory(): Promise<HistoryItem[]> {
  return apiRequest<HistoryItem[]>('/user/history')
}