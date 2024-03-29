import type { LeveledLogEntry, LogLevel } from '@furystack/logging'

export class LogEntry<T = any> implements LeveledLogEntry<T> {
  public _id!: string
  public level!: LogLevel
  public scope!: string
  public message!: string
  public data?: T | undefined
  public appName!: string
  public creationDate!: Date
}
