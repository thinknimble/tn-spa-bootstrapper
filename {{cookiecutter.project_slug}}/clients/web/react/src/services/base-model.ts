import { GetInferredFromRaw } from '@thinknimble/tn-models'
import { z } from 'zod'

export const baseModelShape = {
  id: z.string().uuid(),
  created: z.string().datetime().optional().readonly(),
  lastEdited: z.string().datetime().optional().readonly(),
}

export const selectOptionsShape = {
  label: z.string(),
  value: z.string(),
}

export type SelectOption = GetInferredFromRaw<typeof selectOptionsShape>
