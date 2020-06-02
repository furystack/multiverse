import { roles } from './roles'

export class User {
  public _id!: string
  public username!: string
  public password!: string
  public registrationDate!: string
  public roles!: Array<typeof roles[number]>
}
