export const roles = ['terms-accepted', 'sys-logs'] as const

export class User {
  public _id!: string
  public username!: string
  public password!: string
  public registrationDate!: string
  public avatarUrl?: string
  public roles!: Array<typeof roles[number]>
}
