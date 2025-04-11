import { getSocketProtocol, wsProtocolEnum } from '@utils/socket'
import { createStore } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  connectionMessageTypeEnum,
  connectionStatusEnum,
  createBaseSocketActions,
  defaultBaseSocketValues,
  ExtendBaseSocketState,
} from './base-socket'
import Config from '../../Config'

const backendUrlEnv = Config.backendServerUrl
const host = new URL(backendUrlEnv).host
const socketProtocol = getSocketProtocol(new URL(backendUrlEnv))

type Message = {
  content: string
  role: 'user' | 'assistant'
}

export type ChatState = ExtendBaseSocketState<{
  messages: Message[]
  actions: {
    appendMessage: (message: Message) => void
    updateMessages: (messages: Message[] | ((prevMessages: Message[]) => Message[])) => void
    streamToLastMessage: (content: string) => void
    sendMessage: (message: Message) => void
  }
}>

const defaultValues = {
  ...defaultBaseSocketValues,
  messages: [],
} satisfies Omit<ChatState, 'actions'>

export const createChatStore = (token: string, slug: string) => {
  const chatStore = createStore(
    subscribeWithSelector<ChatState>((set, get) => {
      const baseActions = createBaseSocketActions({
        defaultValues,
        get,
        set,
        slug,
      })
      return {
        ...defaultValues,
        actions: {
          ...baseActions,
          appendMessage: (message: Message) => {
            set((s) => ({
              ...s,
              messages: [...s.messages, message],
            }))
          },
          updateMessages(messageOrUpdater) {
            if (typeof messageOrUpdater === 'function') {
              set((s) => {
                const messages = messageOrUpdater(s.messages)
                return {
                  ...s,
                  messages,
                }
              })
              return
            }
            set({
              messages: messageOrUpdater,
            })
          },
          streamToLastMessage(content) {
            set((s) => {
              const messagesCopy = [...s.messages]
              const lastMessageCopy = { ...messagesCopy[messagesCopy.length - 1] }
              lastMessageCopy.content += content
              messagesCopy[messagesCopy.length - 1] = lastMessageCopy
              return {
                ...s,
                messages: messagesCopy,
              }
            })
          },
          sendMessage(message) {
            const {
              websocket,
              actions: { appendMessage },
            } = get()
            appendMessage(message)
            if (!websocket) {
              console.error('WebSocket is not connected')
              return
            }
            websocket.send(
              JSON.stringify({
                messages: get().messages,
                stream: true,
              }),
            )
          },
          registerListeners(ws) {
            const { appendMessage, updateMessages, streamToLastMessage, reconnect } = get().actions
            ws.onopen = () => {
              console.log('WebSocket connected')
              const connectionMessage =
                get().connectionStatus === connectionStatusEnum.reconnecting
                  ? {
                      message: 'Back online',
                      type: connectionMessageTypeEnum.success,
                    }
                  : {
                      message: 'Connected',
                      type: connectionMessageTypeEnum.success,
                    }
              set({ connectionStatus: connectionStatusEnum.connected, connectionMessage })
            }

            ws.onerror = (error) => {
              console.error('WebSocket error:', error)
            }

            ws.onmessage = (event) => {
              const data = JSON.parse(event.data)

              if (data.error) {
                updateMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content += `\nError: ${data.error}`
                  }
                  return newMessages
                })
                return
              }

              if (data.delta && data.delta?.content) {
                // Handling streaming response
                streamToLastMessage(data.delta.content)
              } else if (data.message && data.message?.content) {
                appendMessage({
                  content: data.message.content,
                  role: 'assistant',
                })
              }
            }

            ws.onclose = (event) => {
              console.log('WebSocket connection closed:', event.code, event.reason)
              if (event.code === 4003) {
                // Handle authentication failure
                console.error('WebSocket authentication failed')
              }
              const currentConnectionStatus = get().connectionStatus
              const connectionMessage =
                currentConnectionStatus === connectionStatusEnum.connected
                  ? {
                      message: 'Lost connection. Will try to reconnect soon...',
                      type: connectionMessageTypeEnum.warning,
                    }
                  : currentConnectionStatus === connectionStatusEnum.reconnecting
                  ? {
                      message: 'Failed to reconnect. Will try again soon...',
                      type: connectionMessageTypeEnum.error,
                    }
                  : {
                      message: 'Disconnected',
                      type: connectionMessageTypeEnum.error,
                    }
              set({ connectionStatus: connectionStatusEnum.disconnected, connectionMessage })
              reconnect({
                token,
                host: host,
                socketProtocol,
              })
            }
          },
        },
      }
    }),
  )
  chatStore.getState().actions.connect({
    host,
    socketProtocol,
    slug,
    token,
  })

  // Register subscriptions to the store here ig: chatStore.subscribe((state)=>state.messages,(state)=>{ // do something with the messages })

  // return the created store
  return chatStore
}
