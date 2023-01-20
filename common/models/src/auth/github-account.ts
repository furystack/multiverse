import type { GithubApiPayload } from './github-api-payload'

export class GithubAccount {
  _id!: string
  githubId!: number
  githubApiPayload!: GithubApiPayload
  public username!: string
  public accountLinkDate!: string
}
