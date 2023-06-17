/**
 *
 * Define shapes for the api to consume
 * You can also use GetInferredFromRaw to get the TS type from the shape
 *
 */

import { GetInferredFromRaw } from '@thinknimble/tn-models-fp'
import { z } from 'zod'
import { baseModelShape } from '../baseModel'

export const userShape = {
  ...baseModelShape,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  token: z.string().nullable(),
}
export type UserShape = GetInferredFromRaw<typeof userShape>

export const userCreateShape = {
  ...userShape,
  password: z.string(),
  confirmPassword: z.string(),
}

export const forgotPasswordShape = {
  email: z.string().email(),
}

export type ForgotPassword = GetInferredFromRaw<typeof forgotPasswordShape>

export const loginShape = {
  email: z.string().email(),
  password: z.string(),
}

export type LoginShape = GetInferredFromRaw<typeof loginShape>
