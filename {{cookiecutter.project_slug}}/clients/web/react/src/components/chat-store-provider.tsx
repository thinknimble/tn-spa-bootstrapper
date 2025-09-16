import { atom, useAtomValue, useSetAtom } from 'jotai'
import { FC, ReactNode, useEffect, useState } from 'react'
import { useAuth } from 'src/stores/auth'
import { ChatState, createChatStore } from 'src/stores/chat'
import { StoreApi, useStore } from 'zustand'
import { Spinner } from './spinner'

type ChatStoreApi = StoreApi<ChatState>
/**
 * Whenever we need to access the store from outside of react we can use this atom (probably this should just replace the context)
 */
export const chatStoreAtom = atom<ChatStoreApi>()

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth()
  const [initializedStore, setInitializedStore] = useState(false)
  const setChatStore = useSetAtom(chatStoreAtom)

  useEffect(() => {
    if (!initializedStore && token) {
      const store = createChatStore(token, 'chat')
      setChatStore(store)
      setInitializedStore(true)
      return
    }
  }, [initializedStore, setChatStore, token])

  if (!initializedStore || !token)
    return (
      <section className="flex h-full w-full items-center justify-center">
        <Spinner size="md" />
      </section>
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
