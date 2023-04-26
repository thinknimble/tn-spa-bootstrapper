import Form, {
  EmailValidator,
  FormField,
  IFormField,
  MustMatchValidator,
  RequiredValidator,
} from '@thinknimble/tn-forms'

export type SignupInputs = {
  firstName: IFormField<string>
  lastName: IFormField<string>
  email: IFormField<string>
  password: IFormField<string>
  confirmPassword: IFormField<string>
}

export class SignupForm extends Form<SignupInputs> {
  static firstName = new FormField({
    label: 'First name',
    placeholder: 'First name',
    validators: [new RequiredValidator()],
  })
  static lastName = new FormField({
    label: 'Last name',
    placeholder: 'Last name',
    validators: [new RequiredValidator()],
  })
  static email = new FormField({
    label: 'Email',
    placeholder: 'Email',
    validators: [new RequiredValidator(), new EmailValidator()],
  })
  static password = new FormField({
    label: 'Password',
    placeholder: 'Password',
    validators: [new RequiredValidator()],
  })
  static confirmPassword = new FormField({
    label: 'Confirm password',
    placeholder: 'Confirm password',
  })
  static dynamicFormValidators = {
    confirmPassword: [
      new MustMatchValidator({ message: 'Passwords must match!', matcher: 'password' }),
    ],
  }
}

export type TSignupForm = SignupInputs & SignupForm
