export class Organization {
  _id!: string
  name!: string
  description!: string
  /**
   * The owner user name
   */
  ownerName!: string

  /**
   * Unique user names of the organization members
   */
  memberNames!: string[]

  /**
   * Unique user names of the admins
   */
  adminNames!: string[]
}
