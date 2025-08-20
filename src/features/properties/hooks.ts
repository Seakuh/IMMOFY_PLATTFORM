import { useState, useEffect } from 'react'
import { Property, PropertyFormData } from './types'
import { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  PropertyFilters,
  PropertiesResponse 
} from './api'

export function useProperties(filters: PropertyFilters = {}) {
  const [data, setData] = useState<PropertiesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getProperties(filters)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [JSON.stringify(filters)])

  return { data, loading, error, refetch: fetchProperties }
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getProperty(id)
        setProperty(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch property')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProperty()
    }
  }, [id])

  return { property, loading, error }
}

export function useCreateProperty() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: PropertyFormData): Promise<Property | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await createProperty(data)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}

export function useUpdateProperty() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = async (id: string, data: Partial<PropertyFormData>): Promise<Property | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await updateProperty(id, data)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}

export function useDeleteProperty() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteProperty(id)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { remove, loading, error }
}