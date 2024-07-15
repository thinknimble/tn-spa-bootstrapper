import { isAxiosError, AxiosError } from 'axios'

export function handleDRFAPIErrorsOrReThrow(e: AxiosError | Error): string[]{
  if (isAxiosError(e as AxiosError)){
    const { data } = e?.response ?? {}
    if (data) {
      const isArrayOfStrings =
        Array.isArray(data) && data.length && typeof data[0] === 'string'
      const isObjectOfErrors = Object.keys(data).every((key) => Array.isArray(data[key]))
      return (isArrayOfStrings
          ? data
          : isObjectOfErrors
          ? Object.keys(data).map((key) => data[key])
          : ['Something went wrong']) as string[]

    }
    return []
  }
  throw e as Error
}

