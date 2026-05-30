import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../api'
import { queryKeys } from './queryKeys'

export const useOrders = (params) => {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.getOrders(params),
  })
}

export const useOrder = (id) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() })
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.cancelOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() })
    },
  })
}