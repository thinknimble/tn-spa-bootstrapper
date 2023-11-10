/**
 *
 * Define shapes for the api to consume
 * You can also use GetInferredFromRaw to get the TS type from the shape
 *
 */

import { GetInferredFromRaw } from '@thinknimble/tn-models'
import { z } from 'zod'
import { baseModelShape } from '../base-model'
import { donorProfileShape, recipientProfileShape } from '../profile'

export const userShape = {
  ...baseModelShape,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  token: z.string().nullable().optional(),
  chatAuthToken: z.string().nullable().optional(),
  profile: z.object(donorProfileShape).or(z.object(recipientProfileShape)),
}
export type UserShape = GetInferredFromRaw<typeof userShape>

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
