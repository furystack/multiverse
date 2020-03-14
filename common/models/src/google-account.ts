import { GoogleApiPayload } from '@furystack/auth-google'

export class GoogleAccount {
  public _id!: string

  public googleId!: number

  public googleApiPayload!: GoogleApiPayload

  public username!: string
  public accountLinkDate!: string
}
