import { useState, useRef, FormEvent, useEffect } from 'react'
import { useAuth } from 'src/stores/auth'
import { Sidebar } from './sidebar'

type Message = {
  content: string
  role: 'user' | 'assistant'
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [, setStreamingContent] = useState('')
  const chatHistoryRef = useRef<HTMLDivElement>(null)
  const token = useAuth.use.token()

  useEffect(() => {
    // Create WebSocket connection with auth token
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.DEV ? window.location.host : window.location.host
    const ws = new WebSocket(`${protocol}//${host}/ws/chat/?token=${token}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.error) {
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage?.role === 'assistant') {
            lastMessage.content += `\nError: ${data.error}`
          }
          return newMessages
        })
        return
      }

      if (data.delta) {
        // Handling streaming response
        if (data.delta.content) {
          setStreamingContent((prev) => {
            const newContent = prev + data.delta.content
            setMessages((messages) => {
              const newMessages = [...messages]
              newMessages[newMessages.length - 1].content = newContent
              return newMessages
            })
            return newContent
          })
        }
      } else if (data.message) {
        // Handling regular response
        setMessages((prev) => [...prev, { content: data.message.content, role: 'assistant' }])
      }
    }

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason)
      if (event.code === 4003) {
        // Handle authentication failure
        console.error('WebSocket authentication failed')
      }
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [token])

  useEffect(() => {
    // Scroll to bottom when messages change
    chatHistoryRef.current?.scrollTo(0, chatHistoryRef.current.scrollHeight)
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const content = inputMessage.trim()
    if (!content || !socket) return

    // Add user message to conversation
    const userMessage: Message = { content, role: 'user' }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setStreamingContent('')

    // Add empty assistant message that will be updated
    setMessages((prev) => [...prev, { content: '', role: 'assistant' }])

    // Send full conversation history through WebSocket
    socket.send(
      JSON.stringify({
        messages: [...messages, userMessage], // Include previous messages plus new user message
        stream: true,
      }),
    )
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // Add this new function to handle textarea height
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    setInputMessage(textarea.value)

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    // Set new height based on scrollHeight, capped at 5 lines (approximately 120px)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  return (
    <div className="flex h-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col">
        {/* Mobile Sidebar Toggle */}
        <div className="border-b border-gray-200 p-4 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Menu
          </button>
        </div>

        {/* Main Chat Area - Scrollable */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div ref={chatHistoryRef} className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-3xl">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-left ${
                      message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input Area - Fixed at Bottom */}
          <div className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-3xl">
              <form onSubmit={handleSubmit} className="flex flex-col">
                {/* Text Input */}
                <div className="p-4 pb-2">
                  <textarea
                    value={inputMessage}
                    onChange={handleTextareaInput}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="max-h-[120px] min-h-[40px] w-full resize-none overflow-y-auto rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
                  <div className="flex items-center gap-2">
                    {/* Add more toolbar buttons here */}
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primaryLight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
