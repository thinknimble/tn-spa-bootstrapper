import Form, { FormField, RequiredValidator } from '@thinknimble/tn-forms'

export class LoginForm extends Form {
  static email = new FormField({ validators: [new RequiredValidator()] })
  static password = new FormField({ validators: [new RequiredValidator()] })
}