
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState, type ReactNode } from 'react'
import { StudentProvider } from '@/features/student/StudentProvider'
interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  )

return (
  <QueryClientProvider client={queryClient}>
    <StudentProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </StudentProvider>
  </QueryClientProvider>
)
}
