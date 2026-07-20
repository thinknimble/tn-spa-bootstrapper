import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from 'src/utils/style'

type ToastType = 'default' | 'success' | 'error' | 'warning'

interface Toast {
  id: string
  title?: string
  description: string
  type: ToastType
}

interface ToastContextValue {
  toast: (options: { title?: string; description: string; type?: ToastType }) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const toastStyles: Record<ToastType, string> = {
  default: 'bg-white border-gray-200',
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
}

const titleStyles: Record<ToastType, string> = {
  default: 'text-gray-900',
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
}

const descriptionStyles: Record<ToastType, string> = {
  default: 'text-gray-600',
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    ({ title, description, type = 'default' }: { title?: string; description: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, type }])
    },
    [],
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={8000}>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={cn(
              'relative rounded-lg border p-4 pr-8 shadow-lg transition-all duration-300 ease-out',
              'data-[state=open]:translate-x-0 data-[state=open]:opacity-100',
              'data-[state=closed]:translate-x-4 data-[state=closed]:opacity-0',
              toastStyles[toast.type],
            )}
            onOpenChange={(open: boolean) => {
              if (!open) removeToast(toast.id)
            }}
          >
            {toast.title && (
              <ToastPrimitive.Title className={cn('text-sm font-semibold', titleStyles[toast.type])}>
                {toast.title}
              </ToastPrimitive.Title>
            )}
            <ToastPrimitive.Description
              className={cn('text-sm', toast.title && 'mt-1', descriptionStyles[toast.type])}
            >
              {toast.description}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
