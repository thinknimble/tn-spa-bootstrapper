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
  //TODO:add back `readonly` https://github.com/thinknimble/tn-models-fp/issues/161
  token: z.string().nullable(),
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

type ZodOptionalRecord<T extends z.ZodRawShape> = {
  [TKey in keyof T]: z.ZodOptional<T[TKey]>
}

export const zodPartialize = <T extends z.ZodRawShape>(zShape: T) => {
  return Object.fromEntries(
    Object.entries(zShape).map(([k, v]) => {
      return [k, v.optional()]
    }),
  ) as ZodOptionalRecord<T>
}

export const fullNameZod = z.string().refine(
  (value) => {
    return value.split(' ').filter(Boolean).length >= 2
  },
  { message: 'Please provide a full name (first and last name)' },
)

export const partialUserShape = { ...zodPartialize(userShape), id: z.string().uuid() }
