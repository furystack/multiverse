import { LogLevel } from '@furystack/logging'

export const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case LogLevel.Fatal:
      return '☣'
    case LogLevel.Error:
      return '🛑'
    case LogLevel.Warning:
      return '⚠'
    case LogLevel.Information:
      return 'ℹ'
    case LogLevel.Debug:
      return '🐛'
    case LogLevel.Verbose:
      return '🦜'
    default:
      return LogLevel[level]
  }
}
