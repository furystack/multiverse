import { DefaultSession } from '@furystack/http-api/dist/models/default-session'

export class Session extends DefaultSession {
  public sessionId!: string
  public username!: string
}
