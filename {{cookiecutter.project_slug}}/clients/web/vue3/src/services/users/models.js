/**
 *
 * Define shapes for the api to consume
 * You can also use GetInferredFromRaw to get the TS type from the shape
 *
 */


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

