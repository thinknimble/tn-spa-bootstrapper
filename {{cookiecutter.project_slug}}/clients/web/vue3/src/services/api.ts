import { isAxiosError } from 'axios'

/**
 * This function accepts any type of value and reduces it to a single
 * string. This is particularly useful for translating objects with
 * nested values into a string.
 **/
function toMessageString(data: unknown) {
  if (typeof data === 'string' || typeof data === 'number') {
    return `<h2>${String(data)}</h2>`
  } else if (data instanceof Array) {
    return '<h2>' + data.map((i) => String(i)).join(', ') + '</h2>'
  } else if (data instanceof Object) {
    let message = ''
    for (const v of Object.values(data)) {
      message += '<h2>' + toMessageString(v) + '</h2>'
    }
    return message
  }
}

/**
 * A generic handler for API Errors.
 *
 * Shows an alert-alert notification for response error codes.
 **/
export function apiErrorHandler({
  apiName = '',
  enable400Alert = false,
  enable500Alert = false,
  rethrowErrors = true,
} = {}) {
  return (error: unknown) => {
    if (isAxiosError(error)) {
      // Console log for dev debug
      // eslint-disable-next-line no-console
      console.log(`${apiName} Error:`, error)

      let message = '<h2>Error...</h2>'
      const status = error.response?.status
      // Show error to user
      if (status && status >= 400 && status < 500) {
        // Handle 4xx errors (probably bad user input)
        let message = '<h2>Error...</h2>'
        // Handle common error structures
        if (error.response?.data.detail) {
          message += `<h2>${error.response.data.detail}</h2>`
        } else if (error.response?.data.non_field_errors) {
          message += `<h2>${error.response.data.non_field_errors}</h2>`
        } else {
          message = toMessageString(error.response?.data) ?? message
        }
        if (enable400Alert) {
          return message
        }
        // Optionally re-raise for further optional error handling
        if (rethrowErrors) {
          throw error
        }

        return
      }

      if (enable500Alert) {
        // Generic handling for other errors (ex: 500 errors)
        return message
      }
      // Optionally re-raise for further optional error handling
      if (rethrowErrors) {
        throw error
      }
    }
  }
}
