/**
 *
 * Define shapes for the api to consume
 * You can also use GetInferredFromRaw to get the TS type from the shape
 *
 */

import { z } from 'zod'
import { GetInferredFromRaw, readonly } from '@thinknimble/tn-models'
import { baseModelShape } from '../base-model'

export const userShape = {
  ...baseModelShape,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  token: readonly(z.string().nullable().optional()),
}
export type User = GetInferredFromRaw<typeof userShape>

export const userCreateShape = {
  email: userShape.email,
  firstName: userShape.firstName,
  lastName: userShape.lastName,
  password: z.string(),
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
