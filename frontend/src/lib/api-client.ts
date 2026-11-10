
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5229'
).replace(/\/+$/, '')

interface ApiErrorBody {
  message?: string
  title?: string
}

export class ApiError extends Error {
  public readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions extends RequestInit {
  studentId?: string
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { studentId, headers, ...requestOptions } = options

  const requestHeaders = new Headers(headers)

  if (studentId) {
    requestHeaders.set('X-Student-Id', studentId)
  }

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !requestHeaders.has('Content-Type')
  ) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: requestHeaders,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`

    try {
      const body = (await response.json()) as ApiErrorBody
      message = body.message || body.title || message
    } catch {
   
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
