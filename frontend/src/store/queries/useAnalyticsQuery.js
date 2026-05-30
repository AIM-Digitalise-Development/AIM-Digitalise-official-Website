import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../api'
import { queryKeys } from './queryKeys'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: () => analyticsApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000,
  })
}

export const useRevenueData = (params) => {
  return useQuery({
    queryKey: queryKeys.analytics.revenue(params),
    queryFn: () => analyticsApi.getRevenueData(params),
  })
}

export const useOrdersData = (params) => {
  return useQuery({
    queryKey: ['analytics', 'orders', params],
    queryFn: () => analyticsApi.getOrdersData(params),
  })
}