import { useEffect, useState } from 'react'
import { useChatStore } from './chat-store-provider'
import { connectionMessageTypeEnum } from '@/stores/base-socket'

const connectionMessageStyleByType = {
  [connectionMessageTypeEnum.warning]: 'bg-warning text-dark',
  [connectionMessageTypeEnum.error]: 'bg-error text-white',
  [connectionMessageTypeEnum.success]: 'bg-success text-white',
}

export const ConnectionStatusIndicator = () => {
  const connectionMessage = useChatStore((s) => s.connectionMessage)
  const [show, setShow] = useState(false)

  /**
   * Hide the message after some time
   */
  useEffect(() => {
    connectionMessage && setShow(true)
    const to = setTimeout(() => {
      // do not clear errors so that the user can see the error message
      if (connectionMessage?.type === connectionMessageTypeEnum.error) return
      setShow(false)
    }, 4000)

    return () => {
      clearTimeout(to)
    }
  }, [connectionMessage])

  return (
    <section className="flex h-10 w-full items-end justify-end p-2">
      <section
        className={`flex items-end justify-end rounded-full px-2 transition-opacity ${
          connectionMessage ? connectionMessageStyleByType[connectionMessage.type] : ''
        } ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="text-sm font-light">{connectionMessage?.message}</p>
      </section>
    </section>
  )
}
