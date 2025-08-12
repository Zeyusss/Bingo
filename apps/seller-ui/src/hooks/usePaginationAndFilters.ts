import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationState {
  page: number
  limit: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  [key: string]: any
}

interface UsePaginationAndFiltersProps {
  defaultLimit?: number
  defaultSortBy?: string
  defaultSortOrder?: 'asc' | 'desc'
  additionalFilters?: Record<string, any>
}

export const usePaginationAndFilters = ({
  defaultLimit = 10,
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
  additionalFilters = {},
}: UsePaginationAndFiltersProps = {}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = useState<PaginationState>(() => ({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || defaultLimit.toString()),
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || defaultSortBy,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder,
    ...Object.keys(additionalFilters).reduce((acc, key) => {
      acc[key] = searchParams.get(key) || additionalFilters[key]
      return acc
    }, {} as Record<string, any>),
  }))

  const updateURL = useCallback((newState: Partial<PaginationState>) => {
    const params = new URLSearchParams()
    const updatedState = { ...state, ...newState }

    Object.entries(updatedState).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all') {
        params.set(key, value.toString())
      }
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }, [state, router])


  const updateState = useCallback((newState: Partial<PaginationState>) => {
    const updatedState = { ...state, ...newState }
    setState(updatedState)
    updateURL(updatedState)
  }, [state, updateURL])


  const setPage = useCallback((page: number) => {
    updateState({ page })
  }, [updateState])

  const setLimit = useCallback((limit: number) => {
    updateState({ limit, page: 1 }) 
  }, [updateState])

  const setSearch = useCallback((search: string) => {
    updateState({ search, page: 1 }) 
  }, [updateState])

  const setSortBy = useCallback((sortBy: string) => {
    updateState({ sortBy, page: 1 })
  }, [updateState])

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    updateState({ sortOrder, page: 1 })
  }, [updateState])

  const setFilter = useCallback((key: string, value: any) => {
    updateState({ [key]: value, page: 1 }) 
  }, [updateState])

  const clearFilters = useCallback(() => {
    const clearedState = {
      page: 1,
      limit: state.limit,
      search: '',
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
      ...Object.keys(additionalFilters).reduce((acc, key) => {
        acc[key] = 'all'
        return acc
      }, {} as Record<string, any>),
    }
    setState(clearedState)
    updateURL(clearedState)
  }, [state.limit, defaultSortBy, defaultSortOrder, additionalFilters, updateURL])

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: state.page,
      limit: state.limit,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    }

    if (state.search) {
      params.search = state.search
    }


    Object.keys(additionalFilters).forEach(key => {
      if (state[key] && state[key] !== 'all') {
        params[key] = state[key]
      }
    })

    return params
  }, [state, additionalFilters])


  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString())
      }
    })
    return params.toString()
  }, [queryParams])

  return {
    page: state.page,
    limit: state.limit,
    search: state.search,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    filters: Object.keys(additionalFilters).reduce((acc, key) => {
      acc[key] = state[key]
      return acc
    }, {} as Record<string, any>),
    
    setPage,
    setLimit,
    setSearch,
    setSortBy,
    setSortOrder,
    setFilter,
    clearFilters,
    
    queryParams,
    queryString,
  }
}
