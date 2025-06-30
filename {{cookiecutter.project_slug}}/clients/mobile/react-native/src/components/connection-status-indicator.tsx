import { connectionMessageTypeEnum } from '@stores/base-socket'
import { FC, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useChatStore } from './chat-provider'

const connectionMessageStyleByType = {
  [connectionMessageTypeEnum.warning]: 'bg-primary-yellow text-dark',
  [connectionMessageTypeEnum.error]: 'bg-primary-orange text-white',
  [connectionMessageTypeEnum.success]: 'bg-primary-green text-white',
}

export const ConnectionStatusIndicator: FC<{
  timeoutMS?: number
}> = ({ timeoutMS }) => {
  const connectionMessage = useChatStore((s) => s.connectionMessage)
  const [show, setShow] = useState(false)

  /**
   * Hide the message after some time
   */
  useEffect(() => {
    connectionMessage && setShow(true)
    if (!timeoutMS) return
    const to = setTimeout(() => {
      // do not clear errors so that the user can see the error message
      if (connectionMessage?.type === connectionMessageTypeEnum.error) return
      setShow(false)
    }, timeoutMS)

    return () => {
      clearTimeout(to)
    }
  }, [connectionMessage, timeoutMS])

  return (
    <View className="flex w-full items-end justify-end p-2">
      <View
        className={`flex items-end justify-end rounded-full px-2 transition-opacity ${
          connectionMessage ? connectionMessageStyleByType[connectionMessage.type] : ''
        } ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        <Text className="font-primary-regular text-xs font-light">
          {connectionMessage?.message}
        </Text>
      </View>
    </View>
  )
}
