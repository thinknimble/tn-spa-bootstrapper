import { z } from 'zod'

export const baseModelShape = {
  id: z.string().uuid(),
  created: z.string().datetime().optional().readonly(),
  lastEdited: z.string().datetime().optional().readonly(),
}
