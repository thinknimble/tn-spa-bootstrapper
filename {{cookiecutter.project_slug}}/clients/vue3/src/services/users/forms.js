import Form, { FormField, RequiredValidator, EmailValidator } from '@thinknimble/tn-forms'

export class LoginForm extends Form {
  static email = new FormField({ validators: [new RequiredValidator(), new EmailValidator()] })
  static password = new FormField({ validators: [new RequiredValidator()] })
}


export class SignupForm extends Form {
  static firstName = new FormField({ validators: [new RequiredValidator()] })
  static lastName = new FormField({ validators: [new RequiredValidator()] })
  static email = new FormField({ validators: [new RequiredValidator(), new EmailValidator()] })
  static password = new FormField({ validators: [new RequiredValidator()] })
}