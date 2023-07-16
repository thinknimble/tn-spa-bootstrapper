import { z } from 'zod'
import { baseModelShape } from '../base-model'

export const userShape = {
  ...baseModelShape,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  token: z.string().nullable(),
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

