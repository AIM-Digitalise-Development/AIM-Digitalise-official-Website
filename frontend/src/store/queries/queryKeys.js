export const queryKeys = {
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
  orders: {
    all: ['orders'],
    lists: () => [...queryKeys.orders.all, 'list'],
    list: (filters) => [...queryKeys.orders.lists(), { filters }],
    details: () => [...queryKeys.orders.all, 'detail'],
    detail: (id) => [...queryKeys.orders.details(), id],
  },
  products: {
    all: ['products'],
    lists: () => [...queryKeys.products.all, 'list'],
    list: (filters) => [...queryKeys.products.lists(), { filters }],
    details: () => [...queryKeys.products.all, 'detail'],
    detail: (id) => [...queryKeys.products.details(), id],
  },
  analytics: {
    all: ['analytics'],
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'],
    revenue: (params) => [...queryKeys.analytics.all, 'revenue', params],
  },
}