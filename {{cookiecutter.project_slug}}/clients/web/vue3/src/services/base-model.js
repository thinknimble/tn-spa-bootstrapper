import { z } from 'zod'
import {readonly} from '@thinknimble/tn-models-fp'

export const baseModelShape = {
  id: readonly(z.string().uuid()),
  datetimeCreated: readonly(z.string().datetime().optional()),
  lastEdited: readonly(z.string().datetime().optional()),
}