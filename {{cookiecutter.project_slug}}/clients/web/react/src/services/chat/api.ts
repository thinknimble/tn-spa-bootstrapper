import { createApi } from '@thinknimble/tn-models'
import { chatShape } from './models'
import { axiosInstance } from '../axios-instance'

export const chatApi = createApi({
  client: axiosInstance,
  baseUri: '/chat',
  models: {
    entity: chatShape,
  },
})
