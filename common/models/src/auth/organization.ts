import { Owner } from '../owner'

export class Organization {
  _id!: string
  name!: string
  icon!: string
  description!: string
  /**
   * The owner user name
   */
  owner!: Owner

  /**
   * Unique user names of the organization members
   */
  memberNames!: string[]

  /**
   * Unique user names of the admins
   */
  adminNames!: string[]
}
