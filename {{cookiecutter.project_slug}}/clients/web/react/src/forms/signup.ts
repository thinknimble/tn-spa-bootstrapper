import Form, {
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
    validators: [new RequiredValidator()],
  })
  static lastName = new FormField({
    validators: [new RequiredValidator()],
  })
  static email = new FormField({
    validators: [new RequiredValidator()],
  })
  static password = new FormField({
    validators: [new RequiredValidator()],
  })
  static confirmPassword = new FormField()
  static dynamicFormValidators = {
    confirmPassword: [
      new MustMatchValidator({ message: 'Passwords must match!', matcher: 'password' }),
    ],
  }
}

export type TSignupForm = SignupInputs & SignupForm
