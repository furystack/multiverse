import { DefaultSession } from '@furystack/http-api/dist/Models/DefaultSession'

export class Session extends DefaultSession {
  public sessionId!: string
  public username!: string
}
