import { ChatInterface } from '../components/chat-interface'

export const ChatDemo = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex h-16 w-full flex-col justify-center bg-primary">
        <div className="w-full px-4">
          <h1 className="text-xl font-bold uppercase text-white">Chat Sandbox</h1>
        </div>
      </header>
      <div className="h-[calc(100%-4rem)]">
        <ChatInterface />
      </div>
    </div>
  )
}
