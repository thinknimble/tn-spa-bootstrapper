import { Validator, EmailValidator, PatternValidator } from '@thinknimble/tn-forms'

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

export class NameValidator extends PatternValidator {
  constructor({
    message = 'Name may only contain letters, hyphens, apostrophes, and spaces',
    code = 'invalidName',
    isRequired = true,
  }: { message?: string; code?: string; isRequired?: boolean } = {}) {
    super({ message, code, isRequired, pattern: NAME_PATTERN })
  }
}

/**
 * Practical strict subset of RFC 5322:
 *  - Local part: alphanumerics plus .!#$%&'*+/=?^_`{|}~-  (no quoted strings)
 *  - No leading/trailing/consecutive dots in local part
 *  - Local part max 64 chars, total max 254 chars
 *  - Domain labels: alphanumeric, hyphens allowed (not leading/trailing), 1-63 chars each
 *  - TLD must be at least 2 alpha characters (no bare IPs)
 */
const EMAIL_LOCAL_PART = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
const EMAIL_DOMAIN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export class ExtendedEmailValidator extends EmailValidator {
  call(value: string) {
    if (!this.enableValidate && !value) return
    if (!value) return

    const fail = () => {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }

    if (value.length > 254) fail()

    const atIdx = value.lastIndexOf('@')
    if (atIdx < 1) fail()

    const local = value.slice(0, atIdx)
    const domain = value.slice(atIdx + 1)

    if (local.length > 64 || local.length === 0) fail()
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) fail()
    if (!EMAIL_LOCAL_PART.test(local)) fail()
    if (!EMAIL_DOMAIN.test(domain)) fail()
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
