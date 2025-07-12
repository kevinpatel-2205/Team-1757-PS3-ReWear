interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    throw new ApiError(
      'Network error. Please check your connection and try again.',
      0
    )
  }
}

export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    register: (userData: any) =>
      apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    logout: () =>
      apiRequest('/api/auth/logout', {
        method: 'POST',
      }),
    
    me: () => apiRequest('/api/auth/me'),
  },

  // Items endpoints
  items: {
    list: (params?: Record<string, string>) => {
      const searchParams = params ? `?${new URLSearchParams(params)}` : ''
      return apiRequest(`/api/items${searchParams}`)
    },
    
    get: (id: string) => apiRequest(`/api/items/${id}`),
    
    create: (itemData: any) =>
      apiRequest('/api/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
      }),
    
    update: (id: string, itemData: any) =>
      apiRequest(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      }),
    
    delete: (id: string) =>
      apiRequest(`/api/items/${id}`, {
        method: 'DELETE',
      }),
  },

  // Admin endpoints
  admin: {
    approveItem: (id: string) =>
      apiRequest(`/api/admin/items/${id}/approve`, {
        method: 'POST',
      }),
    
    rejectItem: (id: string, reason?: string) =>
      apiRequest(`/api/admin/items/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },
}

export { ApiError }
export type { ApiResponse }
