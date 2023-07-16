import { z } from 'zod'
import { readonly } from '@thinknimble/tn-models-fp'
import { baseModelShape,  } from '../base-model'

export const userShape = {
  ...baseModelShape,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  token: readonly(z.string().nullable().optional()),
}

export const userCreateShape = {
  ...userShape,
  password: z.string(),
}

export const forgotPasswordShape = {
  email: z.string().email(),
}


export const loginShape = {
  email: z.string().email(),
  password: z.string(),
}

