import { isAxiosError } from 'axios'

type ErrorData = string[] | { [key: string]: string[] }

function extractErrorMessages(data: ErrorData | undefined): string[] {
  if (Array.isArray(data) && data.length && typeof data[0] === 'string') {
    return data
  } else if (
    typeof data === 'object' &&
    Object.keys(data).every((key) => Array.isArray((data as { [key: string]: string[] })[key]))
  ) {
    // Use type assertion within every callback to access property with key
    return Object.values(data).flat()
  } else {
    return ['Something went wrong']
  }
}

export function getErrorMessages(e: Error, defaultMessage = 'Something went wrong'): string[] {
  if (isAxiosError(e)) {
    const { data } = e.response ?? {}
    return extractErrorMessages(data)
  } else {
    return [defaultMessage]
  }
}
