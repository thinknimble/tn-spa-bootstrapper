import { Validator } from '@thinknimble/tn-forms'

export class MaxLengthValidator extends Validator<string> {
  maxLength: number

  constructor({
    maxLength = 255,
    message,
    code = 'maxLength',
    isRequired = true,
  }: { maxLength?: number; message?: string; code?: string; isRequired?: boolean } = {}) {
    super({ message: message ?? `Must be no more than ${maxLength} characters`, code, isRequired })
    this.maxLength = maxLength
  }

  call(value: string) {
    if (!this.enableValidate && !value) return
    if (!value) return
    if (value.length > this.maxLength) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

const NAME_PATTERN = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/

export class NameValidator extends Validator<string> {
  constructor({
    message = 'Name may only contain letters, hyphens, apostrophes, and spaces',
    code = 'invalidName',
    isRequired = true,
  }: { message?: string; code?: string; isRequired?: boolean } = {}) {
    super({ message, code, isRequired })
  }

  call(value: string) {
    if (!this.enableValidate && !value) return
    if (!value) return
    if (!NAME_PATTERN.test(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class PasswordStrengthValidator extends Validator<string> {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecialChar: boolean

  constructor({
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
    message = 'Password does not meet requirements',
    code = 'invalidPassword',
    isRequired = true,
  }: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumber?: boolean
    requireSpecialChar?: boolean
    message?: string
    code?: string
    isRequired?: boolean
  } = {}) {
    super({ message, code, isRequired })
    this.minLength = minLength
    this.requireUppercase = requireUppercase
    this.requireLowercase = requireLowercase
    this.requireNumber = requireNumber
    this.requireSpecialChar = requireSpecialChar
  }

  call(value: string) {
    if (!this.enableValidate && !value) return
    if (!value) return

    const errors: string[] = []

    if (value.length < this.minLength) {
      errors.push(`Must be at least ${this.minLength} characters`)
    }
    if (this.requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('Must contain at least one uppercase letter')
    }
    if (this.requireLowercase && !/[a-z]/.test(value)) {
      errors.push('Must contain at least one lowercase letter')
    }
    if (this.requireNumber && !/\d/.test(value)) {
      errors.push('Must contain at least one number')
    }
    if (this.requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value)) {
      errors.push('Must contain at least one special character')
    }

    if (errors.length) {
      throw new Error(JSON.stringify({ code: this.code, message: errors.join('. ') }))
    }
  }
}
