import { useQueryClient } from '@tanstack/react-query'

export const usePrefetch = () => {
  const queryClient = useQueryClient()

  const prefetchQuery = (queryKey, queryFn, options = {}) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options,
    })
  }

  const prefetchInfiniteQuery = (queryKey, queryFn, options = {}) => {
    return queryClient.prefetchInfiniteQuery({
      queryKey,
      queryFn,
      ...options,
    })
  }

  return { prefetchQuery, prefetchInfiniteQuery }
}