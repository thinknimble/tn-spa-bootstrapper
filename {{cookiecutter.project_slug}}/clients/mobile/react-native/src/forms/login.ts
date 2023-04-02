import Form, {
  EmailValidator,
  FormField,
  IFormField,
  RequiredValidator,
} from '@thinknimble/tn-forms'

export type LoginFormInputs = {
  email: IFormField<string>
  password: IFormField<string>
}

export class LoginForm extends Form<LoginFormInputs> {
  static email = new FormField({
    value: '',
    placeholder: 'Email',
    label: 'Email',
    validators: [new RequiredValidator(), new EmailValidator()],
  })
  static password = new FormField({
    value: '',
    placeholder: 'Password',
    label: 'Password',
    validators: [new RequiredValidator()],
  })
}

export type TLoginForm = LoginForm & LoginFormInputs
