import { z } from 'zod'
import { baseModelShape, readonly } from '../base-model'

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
  confirmPassword: z.string(),
}

export const forgotPasswordShape = {
  email: z.string().email(),
}


export const loginShape = {
  email: z.string().email(),
  password: z.string(),
}

