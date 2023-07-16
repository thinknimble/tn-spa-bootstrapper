import { z } from 'zod'
import {readonly} from '@thinkimble/tn-models-fp'

export const baseModelShape = {
  id: readonly(z.string().uuid().optional()),
  datetimeCreated: readonly(z.string().datetime().optional()),
  lastEdited: readonly(z.string().datetime().optional()),
}
