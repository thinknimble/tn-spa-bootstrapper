import { z } from 'zod'

export const baseModelShape = {
  id: z.string().uuid(),
  datetimeCreated: z.string().datetime().optional(),
  lastEdited: z.string().datetime().optional(),
}
