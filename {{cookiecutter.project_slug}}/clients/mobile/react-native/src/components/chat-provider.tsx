import { useAuth } from '@stores/auth'
import { ChatState, createChatStore } from '@stores/chat'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { FC, ReactNode, useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { StoreApi, useStore } from 'zustand'

type ChatStoreApi = StoreApi<ChatState>

export const chatStoreAtom = atom<ChatStoreApi | null>(null)

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // const { token } = useAuth()
  const [initializedStore, setInitializedStore] = useState(false)
  const setGlobalChatStore = useSetAtom(chatStoreAtom)
  const { token } = useAuth()

  useEffect(() => {
    if (!initializedStore && token) {
      setGlobalChatStore(createChatStore(token, 'chat'))
      setInitializedStore(true)
      return
    }
    return () => {
      //TODO: I am having trouble defining the right cleanup functions but looks like this would run too many times and would kill the websocket connection
      // storeRef.current?.getState().actions.forceCloseConnection()
    }
  }, [initializedStore, setGlobalChatStore, token])

  if (!initializedStore)
    return (
      <View className="flex h-full w-full items-center justify-center">
        <ActivityIndicator />
      </View>
    )

  return <>{children}</>
}

/**
 * Get the vanilla store wrapped in a react hook.
 * @param selector Selector for getting a specific piece of the state
 * @returns
 */
export const useChatStore = <S extends ChatState[keyof ChatState]>(
  selector: (state: ChatState) => S,
) => {
  const vanillaStore = useAtomValue(chatStoreAtom)
  if (!vanillaStore) {
    throw new Error('ChatStore has not been initialized')
  }
  return useStore(vanillaStore, selector)
}
