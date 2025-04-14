export const wsProtocolEnum = {
  ws: 'ws',
  wss: 'wss',
} as const
export type WsProtocol = (typeof wsProtocolEnum)[keyof typeof wsProtocolEnum]

export const getSocketProtocol = (urlLike: { protocol: string }) => {
  return urlLike.protocol === 'https:' ? wsProtocolEnum.wss : wsProtocolEnum.ws
}

export const connectSocket = ({
  slug,
  host,
  socketProtocol,
  token,
}: {
  slug: string
  host: string
  socketProtocol: WsProtocol
  token: string
}) => {
  const wsUrl = `${socketProtocol}://${host}/ws/${slug}/?token=${token}` // Include token in the WebSocket URL`
  const ws = new WebSocket(wsUrl)
  ws.binaryType = 'arraybuffer'
  return ws
}
