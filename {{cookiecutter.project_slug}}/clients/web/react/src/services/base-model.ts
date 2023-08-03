import { z } from 'zod'


export const baseModelShape = {
  id: z.string().uuid(),
  datetimeCreated: readonly(z.string().datetime().optional()),
  lastEdited: readonly(z.string().datetime().optional()),
}
