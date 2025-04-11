import { MultiPlatformSafeAreaView } from '@components/multi-platform-safe-area-view'
import { BounceableWind } from '@components/styled'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { FlatList, Text, TextInput, View } from 'react-native'
import { ChatProvider, useChatStore } from './chat-provider'
import { ConnectionStatusIndicator } from './connection-status-indicator'
import { useAtomValue } from 'jotai'
import { navioAtom } from '@stores/navigation'

const ChatInner = () => {
  const messages = useChatStore((s) => s.messages)
  const inputRef = useRef<TextInput>(null)
  const listRef = useRef<FlatList>(null)
  const [input, setInput] = useState('')
  const { sendMessage } = useChatStore((s) => s.actions)

  const onSend = () => {
    if (input.trim()) {
      sendMessage({
        content: input,
        role: 'user',
      })
      inputRef.current?.clear()
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const navio = useAtomValue(navioAtom)
  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  return (
    <View className="flex-1 p-3 justify-between">
      <View aria-label="header" className="flex-row justify-between w-full">
        <Text className="text-xl font-primary-bold">Chat demo</Text>
        <BounceableWind
          onPress={() => {
            navio?.goBack()
          }}
        >
          <Ionicons name="close" size={24} color="black" />
        </BounceableWind>
      </View>
      <FlatList
        contentContainerClassName="flex-grow pb-20"
        ref={listRef}
        data={messages}
        snapToEnd
        renderItem={(item) => {
          return (
            <View className="my-2">
              <View>
                <Text
                  className={
                    item.item.role === 'user'
                      ? 'text-black font-primary-bold'
                      : 'text-primary-orange font-primary-bold'
                  }
                >
                  {item.item.role === 'user' ? 'You' : 'AI'}
                </Text>
              </View>
              <View className="pl-3 font-primary-regular">
                <Text>{item.item.content}</Text>
              </View>
            </View>
          )
        }}
      />
      <View className="h-8">
        <ConnectionStatusIndicator />
      </View>
      <View className="border border-gray-300 rounded-lg p-2 flex-row items-center">
        <TextInput
          placeholder="Type a message..."
          className="flex-grow font-primary-regular"
          onChangeText={(t) => {
            setInput(t)
          }}
          onSubmitEditing={onSend}
          ref={inputRef}
        />
        <BounceableWind onPress={onSend}>
          <Ionicons name="send" size={24} color="black" />
        </BounceableWind>
      </View>
    </View>
  )
}

export const ChatScreen = () => {
  return (
    <MultiPlatformSafeAreaView safeAreaClassName="flex-1">
      <ChatProvider>
        <ChatInner />
      </ChatProvider>
    </MultiPlatformSafeAreaView>
  )
}
