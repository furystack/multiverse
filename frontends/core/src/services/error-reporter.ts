import { EnvironmentService } from '@common/frontend-utils'
import { Injectable, Injected } from '@furystack/inject'
@Injectable()
export class ErrorReporter {

    
  @Injected(EnvironmentService)
  private readonly env!: EnvironmentService

  public sendErrorReport(error: Error, context?: string) {
    const title = `Automated Bug Report - ${error.message}`
    const body = `
# 🐜 Automated Bug Report

## 👉 Steps To Reproduce

## Additional Context

${context || 'none'}

## Stack

\`\`\`\`
${error.stack}
\`\`\`\`

## Environment

App version: ${this.env.appVersion}

Build date: ${this.env.buildDate.toISOString()}

[GH Commit](https://github.com/furystack/multiverse/commit/${this.env.commitHash})`
    window.open(
      `https://github.com/furystack/multiverse/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(
        body,
      )}&labels=bug`,
    )
  }
}
