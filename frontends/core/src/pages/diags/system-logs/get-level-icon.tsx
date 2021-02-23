import { LogLevel } from '@furystack/logging'
import { createComponent } from '@furystack/shades'
import { Icon } from '../../../components/icon'

export const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case LogLevel.Fatal:
      return (
        <Icon
          icon={{ type: 'flaticon-essential', name: '058-error.svg' }}
          elementProps={{ style: { height: '32px' } }}
        />
      )
    case LogLevel.Error:
      return (
        <Icon
          icon={{ type: 'flaticon-essential', name: '058-error.svg' }}
          elementProps={{ style: { height: '32px' } }}
        />
      )
    case LogLevel.Warning:
      return (
        <Icon
          icon={{ type: 'flaticon-essential', name: '060-warning.svg' }}
          elementProps={{ style: { height: '32px' } }}
        />
      )
    case LogLevel.Information:
      return (
        <Icon
          icon={{ type: 'flaticon-essential', name: '061-info.svg' }}
          elementProps={{ style: { height: '32px' } }}
        />
      )
    case LogLevel.Debug:
      return '🐛'
    case LogLevel.Verbose:
      return '🦜'
    default:
      return LogLevel[level]
  }
}
