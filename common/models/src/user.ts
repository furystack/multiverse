export const roles = ['terms-accepted', 'sys-logs', 'sys-diags', 'feature-switch-admin', 'user-admin'] as const

export class User {
  public _id!: string
  public username!: string
  public password!: string
  public registrationDate!: string
  public roles!: Array<typeof roles[number]>
}
