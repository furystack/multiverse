import { User as FUser } from '@furystack/core'

export class User implements FUser {
  public _id!: string
  public username!: string
  public password!: string
  public roles!: string[]
}
