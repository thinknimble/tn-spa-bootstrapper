import Model, { fields } from '@thinknimble/tn-models'

import UserAPI from './api'

export default class User extends Model {
  static api = UserAPI.create(User)

  static id = new fields.CharField({ readOnly: true })
  static firstName = new fields.CharField()
  static lastName = new fields.CharField()
  static email = new fields.CharField()
  static fullName = new fields.CharField({ readOnly: true })
  static token = new fields.CharField()
}
