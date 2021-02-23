export class GoogleAccount {
  public _id!: string

  public googleId!: number

  public googleApiPayload!: {
    // issuer
    iss: string
    // Unique Google Identifier
    sub: number
    // E-mail address
    email: string
    email_verified: boolean
    name: string
    picture: string
    given_name: string
    family_name: string
    locale: string
  }

  public username!: string
  public accountLinkDate!: string
}
