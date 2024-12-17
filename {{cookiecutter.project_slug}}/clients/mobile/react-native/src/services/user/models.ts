/**
 *
 * Define shapes for the api to consume
 * You can also use GetInferredFromRaw to get the TS type from the shape
 *
 */

import { GetInferredFromRaw } from '@thinknimble/tn-models'
import { z } from 'zod'
import { baseModelShape } from '../base-model'

export const userShape = {
  ...baseModelShape,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
}

/**
 * Only used during sign up - after this we shouldn't consider the user to have this token in any other request
 */
export const userShapeWithToken = {
  ...userShape,
  token: z.string().readonly(),
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

export const fullNameZod = z.string().refine(
  (value) => {
    return value.split(' ').filter(Boolean).length >= 2
  },
  { message: 'Please provide a full name (first and last name)' },
)
