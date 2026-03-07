import {
  Form,
  EmailValidator,
  FormField,
  IFormField,
  MinLengthValidator,
  RequiredValidator,
} from '@thinknimble/tn-forms'
import { MaxLengthValidator, NameValidator, PasswordStrengthValidator, ExtendedEmailValidator } from '../validators'

export type AccountFormInputs = {
  firstName: IFormField<string>
  lastName: IFormField<string>
  email: IFormField<string>
  password: IFormField<string>
  confirmPassword: IFormField<string>
}
export type AccountFormValues = {
  /**
   * HACK - PB - 2023-05-10
   * Temporary hack to get the fields because the form returns all field values as <T> | undefined
   */
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}
export class AccountForm extends Form<AccountFormInputs> {
  static firstName = FormField.create({
    label: 'First name',
    placeholder: 'First Name',
    type: 'text',
    validators: [
      new RequiredValidator({ message: 'Please enter your first name' }),
      new NameValidator({ message: 'First name contains invalid characters' }),
      new MaxLengthValidator({ maxLength: 50, message: 'First name is too long' }),
    ],
    value: '',
  })

  static lastName = FormField.create({
    label: 'Last Name',
    placeholder: 'Last Name',
    type: 'text',
    validators: [
      new RequiredValidator({ message: 'Please enter your last name' }),
      new NameValidator({ message: 'Last name contains invalid characters' }),
      new MaxLengthValidator({ maxLength: 50, message: 'Last name is too long' }),
    ],
    value: '',
  })

  static email = FormField.create({
    label: 'Email',
    placeholder: 'Email',
    type: 'email',
    value: '',
    validators: [new ExtendedEmailValidator({ message: 'Please enter a valid email' })],
  })

  static password = FormField.create({
    label: 'Password',
    placeholder: 'Password',
    type: 'password',
    validators: [
      new PasswordStrengthValidator({
        minLength: 8,
        message: 'Please enter a password with at least 8 characters',
      }),
      new MaxLengthValidator({ maxLength: 128, message: 'Password is too long' }),
    ],
    value: '',
  })

  static confirmPassword = FormField.create({
    label: 'Confirm Password',
    placeholder: 'Confirm Password',
    type: 'password',
    value: '',
    validators: [
      new PasswordStrengthValidator({
        minLength: 8,
        message: 'Please enter a password with at least 8 characters',
      }),
      new MaxLengthValidator({ maxLength: 128, message: 'Password is too long' }),
    ],
  })
}
export type TAccountForm = AccountForm & AccountFormInputs

export type EmailForgotPasswordInput = {
  email: IFormField<string>
}

export class EmailForgotPasswordForm extends Form<EmailForgotPasswordInput> {
  static email = FormField.create({
    label: 'Email',
    placeholder: 'Email',
    type: 'email',
    validators: [new ExtendedEmailValidator({ message: 'Please enter a valid email' })],
  })
}

export type TEmailForgotPasswordForm = EmailForgotPasswordForm & EmailForgotPasswordInput

export type ResetPasswordInput = {
  uid: IFormField<string>
  token: IFormField<string>
  password: IFormField<string>
  confirmPassword: IFormField<string>
}

export class ResetPasswordForm extends Form<ResetPasswordInput> {
  static uid = new FormField({
    label: 'UID',
    placeholder: 'uid',
    type: 'text',
    validators: [new RequiredValidator({ message: 'Please enter a valid uid' })],
  })
  static token = new FormField({
    placeholder: 'Verification Token',
    type: 'text',
    validators: [
      new MinLengthValidator({ message: 'Please enter a valid 5 digit code', minLength: 5 }),
    ],
  })
  static password = FormField.create({
    label: 'Password',
    placeholder: 'Password',
    type: 'password',

    validators: [
      new MinLengthValidator({
        minLength: 6,
        message: 'Please enter a password with at least 6 characters',
      }),
    ],
    value: '',
  })

  static confirmPassword = FormField.create({
    label: 'Confirm Password',
    placeholder: 'Confirm Password',
    type: 'password',
    value: '',
    validators: [],
  })
}

export type TResetPasswordForm = ResetPasswordForm & ResetPasswordInput

export type LoginFormInputs = {
  email: IFormField<string>
  confirmEmail: IFormField<string>
  password: IFormField<string>
}
export type TLoginForm = LoginFormInputs & LoginForm

export class LoginForm extends Form<LoginFormInputs> {
  static email = new FormField({
    placeholder: 'Email',
    type: 'emailAddress',
    validators: [new ExtendedEmailValidator({ message: 'Please enter a valid email' })],
  })
  static password = new FormField({
    validators: [new RequiredValidator({ message: 'Please enter your password' })],
    placeholder: 'Password',
    value: '',
    type: 'password',
  })
}

export type ForgotPasswordInput = {
  email: IFormField<string>
}

export class ForgotPasswordForm extends Form<ForgotPasswordInput> {
  static email = new FormField({
    placeholder: 'Email',
    type: 'emailAddress',
    validators: [new ExtendedEmailValidator({ message: 'Please enter a valid email' })],
  })
}

export type TForgotPasswordForm = ForgotPasswordForm & ForgotPasswordInput
