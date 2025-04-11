export const wsProtocolEnum = {
  ws: 'ws',
  wss: 'wss',
} as const
export type WsProtocol = (typeof wsProtocolEnum)[keyof typeof wsProtocolEnum]

export const connectSocket = ({
  slug,
  host,
  socketProtocol,
}: {
  slug: string
  host: string
  socketProtocol: WsProtocol
}) => {
  const wsUrl = `${socketProtocol}://${host}/ws/${slug}/`
  const ws = new WebSocket(wsUrl)
  ws.binaryType = 'arraybuffer'
  return ws
}
