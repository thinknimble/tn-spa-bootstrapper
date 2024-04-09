import { z } from 'zod'

export const baseModelShape = {
  id: z.string().uuid(),
  created: z.string().datetime().optional(),
  lastEdited: z.string().datetime().optional(),
}
