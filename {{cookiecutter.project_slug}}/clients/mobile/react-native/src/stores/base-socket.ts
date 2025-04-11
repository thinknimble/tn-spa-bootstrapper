import { connectSocket, WsProtocol } from '@utils/socket'
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

/**
 * Wrap the specific store with this type util to get the base socket state and actions embedded in it.
 */
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

/**
 * Provides the basic actions for handling the socket connection. This allows to extend a store and make it socket-aware.
 *
 * Some considerations:
 * - In these base actions the `registerEventListeners` is not implemented as it depends on the specific store that will be extending the base socket store. Thus, the user will have to implement it, a type error would show indicating that the function is not implemented.
 *
 * - `connectionStatus` on this store only updates the reconnecting status. For `onopen` or `onclose` you should set the connection status when registering these events in the `registerEventListeners` implementation.
 */
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
    connect({ host, slug: connectSlug, socketProtocol, token }) {
      const ws = connectSocket({
        host,
        slug: connectSlug,
        socketProtocol,
        token,
      })
      get().actions.updateSocket(ws)
      get().actions.registerListeners(ws)
    },
    reconnect({ host, socketProtocol, token }) {
      get().actions.increaseReconnectAttempts()
      const reconnectAttempts = get().reconnectionAttempts
      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        console.warn('Max reconnect attempts reached, not attempting further reconnects.')
        set((s) => ({
          ...s,
          connectionStatus: connectionStatusEnum.disconnected,
          connectionMessage: {
            message: 'Max reconnect attempts reached',
            type: connectionMessageTypeEnum.error,
          },
        }))
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
  //@eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { registerListeners: _, ...actionsWithoutListeners } = actions
  return actionsWithoutListeners
}
