import type { ThemePreset } from '@common/models/src/common/theme-preset'
import { Injectable, Injected } from '@furystack/inject'
import {
  defaultDarkTheme,
  defaultLightTheme,
  setCssVariable,
  ThemeProviderService,
} from '@furystack/shades-common-components'
import { ObservableValue } from '@furystack/utils'

const lightBackground = 'linear-gradient(to right bottom, #ebebf8, #e3e3f6, #dcdcf4, #d4d4f2, #cdcdf0)'
const darkBackground = 'linear-gradient(to right bottom, #2b3036, #292c31, #27282d, #242428, #212023)'

@Injectable({ lifetime: 'singleton' })
export class ThemeService {
  @Injected(ThemeProviderService)
  public readonly themeProviderService!: ThemeProviderService

  public themeName: ThemePreset = 'dark'

  public getBackground() {
    return 'var(--multiverse-background)'
  }

  public readonly themeNameObservable = new ObservableValue<ThemePreset>(this.themeName)

  public setTheme(themeName: ThemePreset) {
    const root = document.querySelector(':root') as HTMLElement
    this.themeName = themeName
    this.themeNameObservable.setValue(themeName)
    switch (themeName) {
      case 'light':
        this.themeProviderService.set(defaultLightTheme)
        setCssVariable('--multiverse-background', lightBackground, root)
        break
      default:
        this.themeProviderService.set(defaultDarkTheme)
        setCssVariable('--multiverse-background', darkBackground, root)
        break
    }
  }
}
