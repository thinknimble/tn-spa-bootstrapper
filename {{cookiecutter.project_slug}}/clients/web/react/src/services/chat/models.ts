import { z } from 'zod'

export const chatShape = {
  id: z.string(),
  name: z.string(),
  completed: z.boolean(),
}
