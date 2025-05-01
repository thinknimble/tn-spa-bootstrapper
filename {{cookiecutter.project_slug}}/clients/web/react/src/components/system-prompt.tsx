import { useState, useEffect } from 'react'
import axios from 'axios'

export const SystemPrompt = () => {
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await axios.get('/api/chat/system-prompt/')
        setPrompt(response.data.content)
        setError(null)
      } catch (error) {
        const axiosError = error as any
        const message = axiosError.response?.data?.error || 'Failed to load system prompt'
        setError(message)
        console.error('Error fetching system prompt:', error)
      }
    }

    fetchPrompt()
  }, [])

  const getAdminUrl = () => {
    if (import.meta.env.DEV) {
      return `${import.meta.env.VITE_DEV_BACKEND_URL}/staff/chat/prompttemplate/`
    }
    return '/staff/chat/prompttemplate/'
  }

  return (
    <>
      <div className="mt-2 border-t border-gray-200 pt-2 text-left">
        <a
          href={getAdminUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          ✎ Edit in Django
        </a>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 text-left">
        <pre className={`whitespace-pre-wrap text-sm text-left ${error ? 'text-red-600' : ''}`}>
          {error || prompt}
        </pre>
      </div>
    </>
  )
}
