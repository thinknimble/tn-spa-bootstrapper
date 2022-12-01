import Form, { FormField, IFormField } from '@thinknimble/tn-forms'

type LoginFormInputs = {
  email: IFormField<string>
  password: IFormField<string>
}

export class LoginForm extends Form<LoginFormInputs> {
  static email = new FormField()
  static password = new FormField()
}

export type TLoginForm = LoginForm & LoginFormInputs
