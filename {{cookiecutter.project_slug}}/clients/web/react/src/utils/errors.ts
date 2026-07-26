import { isAxiosError } from 'axios'

type ErrorData = string[] | { [key: string]: string[] | string }

function extractErrorMessages(data: ErrorData | undefined): string[] {
  if (Array.isArray(data) && data.length && typeof data[0] === 'string') {
    return data
  } else if (typeof data === 'object' && data !== null) {
    if ('detail' in data && typeof data['detail'] === 'string') {
      return [data['detail']]
    }
    if (Object.values(data).every((v) => Array.isArray(v))) {
      return Object.values(data as { [key: string]: string[] }).flat()
    }
  }
  return ['Something went wrong']
}

export function getErrorMessages(e: Error, defaultMessage = 'Something went wrong'): string[] {
  if (isAxiosError(e)) {
    const { data } = e.response ?? {}
    return extractErrorMessages(data)
  } else {
    return [defaultMessage]
  }
}
