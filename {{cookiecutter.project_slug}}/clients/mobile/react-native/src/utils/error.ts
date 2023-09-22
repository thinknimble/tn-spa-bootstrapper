import { AxiosError } from 'axios'
import { Config } from '../../Config'
import { useErrorStore } from '@stores/error'

/**
 * Set error message for modal message
 */
export const setErrorEffect = (error: unknown) => {
  const { changeErrorMessage } = useErrorStore.getState().actions
  if (error instanceof AxiosError && error.response) {
    error.response.status >= 500
      ? changeErrorMessage('There was an error in our servers')
      : changeErrorMessage(`There was a request error, we'll work on fixing this!`)
    Config.logger.error(
      `${error.response?.status} - ${JSON.stringify(error.response?.data, undefined, 2)}`,
    )
  }
}
