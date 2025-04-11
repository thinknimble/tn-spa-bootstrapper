import { connectSocket, WsProtocol } from 'src/utils/socket'
import { StoreApi } from 'zustand'

const MAX_RECONNECT_ATTEMPTS = 5

export const connectionStatusEnum = {
  connecting: 'connecting',
  reconnecting: 'reconnecting',
  connected: 'connected',
  disconnected: 'disconnected',
} as const

export type ConnectionStatus = (typeof connectionStatusEnum)[keyof typeof connectionStatusEnum]

export const connectionMessageTypeEnum = {
  error: 'error',
  warning: 'warning',
  success: 'success',
} as const

export type ConnectionMessageType =
  (typeof connectionMessageTypeEnum)[keyof typeof connectionMessageTypeEnum]

export type BaseSocketState = {
  connectionStatus: ConnectionStatus
  connectionMessage: {
    message: string
    type: ConnectionMessageType
  } | null
  reconnectionAttempts: number
  websocket: WebSocket | null
  actions: {
    connect: (args: {
      token: string
      slug: string
      host: string
      socketProtocol: WsProtocol
    }) => void
    registerListeners: (ws: WebSocket) => void
    reconnect: (args: { token: string; host: string; socketProtocol: WsProtocol }) => void
    forceCloseConnection: () => void
    closeConnectionAndConnect: (serverUrl: string) => void
    updateSocket: (websocket: WebSocket) => void
    clearStore: () => void
    increaseReconnectAttempts: () => void
    clearReconnectAttempts: () => void
    changeConnectionMessage: (args: { message: string; type: ConnectionMessageType } | null) => void
  }
}

export type ExtendBaseSocketState<T extends { actions: object }> = Omit<T, 'actions'> &
  Omit<BaseSocketState, 'actions'> & {
    actions: T['actions'] & BaseSocketState['actions']
  }

export const defaultBaseSocketValues: Omit<BaseSocketState, 'actions'> = {
  reconnectionAttempts: 0,
  connectionStatus: connectionStatusEnum.disconnected,
  connectionMessage: null,
  websocket: null,
}

export const createBaseSocketActions = <T extends BaseSocketState>({
  get,
  set,
  slug,
  defaultValues,
}: {
  get: StoreApi<T>['getState']
  set: StoreApi<T>['setState']
  slug: string
  defaultValues: Omit<T, 'actions'>
}): Omit<BaseSocketState['actions'], 'registerListeners'> => {
  const actions: T['actions'] = {
    registerListeners() {
      return
    },
    increaseReconnectAttempts() {
      set((s) => ({
        ...s,
        reconnectionAttempts: s.reconnectionAttempts + 1,
      }))
    },
    clearReconnectAttempts() {
      set((s) => ({
        ...s,
        reconnectionAttempts: 0,
      }))
    },
    /**
     * Connects to the websocket and sets up the event listeners.
     */
    connect({ host, slug: connectSlug, socketProtocol }) {
      const ws = connectSocket({
        host,
        slug: connectSlug,
        socketProtocol,
      })
      get().actions.updateSocket(ws)
      get().actions.registerListeners(ws)
    },
    reconnect({ host, socketProtocol, token }) {
      get().actions.increaseReconnectAttempts()
      const reconnectAttempts = get().reconnectionAttempts
      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        console.warn('Max reconnect attempts reached, not attempting further reconnects.')
        return
      }
      const timeout = Math.pow(2, reconnectAttempts) * 1000 // Exponential backoff
      setTimeout(() => {
        console.info('Attempting to reconnect...', reconnectAttempts)
        set((s) => ({
          ...s,
          connectionStatus: connectionStatusEnum.reconnecting,
          connectionMessage: {
            message: 'Reconnecting...',
            type: connectionMessageTypeEnum.warning,
          },
        }))
        get().actions.connect({
          host,
          slug,
          socketProtocol,
          token,
        }) // Attempt to reconnect
      }, timeout)
    },
    forceCloseConnection() {
      const ws = get().websocket
      if (ws) {
        ws.close()
        get().actions.clearStore()
      }
    },
    updateSocket(websocket) {
      set((s) => ({ ...s, websocket }))
    },
    clearStore() {
      set((s) => ({ ...s, ...defaultValues }))
    },
    changeConnectionMessage(connectionMessage) {
      set((s) => ({
        ...s,
        connectionMessage,
      }))
    },
    closeConnectionAndConnect(serverUrl) {
      get().actions.forceCloseConnection()
      const newWS = new WebSocket(serverUrl)
      get().actions.updateSocket(newWS)
      get().actions.registerListeners(newWS)
    },
  }
  //HACK: defining it directly in the above object as Omit<T['actions'], 'registerListeners'> wouldn't work.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { registerListeners: _, ...actionsWithoutListeners } = actions
  return actionsWithoutListeners
}
