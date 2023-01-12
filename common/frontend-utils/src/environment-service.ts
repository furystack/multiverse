import type { sites } from '@common/config'

export type SiteRoots = { [K in keyof (typeof sites)['services']]: string }

export class EnvironmentService {
  public readonly nodeEnv: 'development' | 'production'
  public readonly buildDate: Date
  public readonly debug: boolean
  public readonly appVersion: string
  public readonly apiRoot: string
  public readonly siteRoots: SiteRoots

  public readonly commitHash: string

  constructor({
    apiRoot,
    appVersion,
    nodeEnv,
    buildDate,
    debug,
    siteRoots,
    commitHash,
  }: {
    nodeEnv: 'development' | 'production'
    buildDate: Date
    debug: boolean
    appVersion: string
    apiRoot: string
    siteRoots: SiteRoots
    commitHash: string
  }) {
    this.apiRoot = apiRoot
    this.appVersion = appVersion
    this.debug = debug
    this.buildDate = buildDate
    this.nodeEnv = nodeEnv
    this.siteRoots = siteRoots
    this.commitHash = commitHash
  }
}
