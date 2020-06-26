import { defaultDashboard } from '../dashboard'
import { UserSettings } from './user-settings'

export class Profile {
  public _id!: string
  public username!: string
  public displayName!: string
  public description!: string
  public userSettings!: UserSettings
}

export const DefaultUserSettings: UserSettings = {
  theme: 'dark',
  dashboard: defaultDashboard,
}
