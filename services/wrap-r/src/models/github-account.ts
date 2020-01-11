import { GithubApiPayload } from '../services/github-login-service'

export class GithubAccount {
  _id!: string
  githubId!: number
  githubApiPayload!: GithubApiPayload
  public username!: string
  public accountLinkDate!: string
}
