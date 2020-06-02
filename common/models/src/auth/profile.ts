import { UserSettings } from '../schemas/user-settings'

export class Profile {
  public _id!: string
  public username!: string
  public displayName!: string
  public avatarUrl!: string
  public userSettings!: UserSettings
}

export const DefaultUserSettings: UserSettings = {
  theme: 'dark',
  dashboard: {
    name: 'Default User Dashboard',
    description: 'The default User dashboard',
    widgets: [
      { type: 'app-shortcut', appName: 'Profile' },
      { type: 'app-shortcut', appName: 'Movies' },
      { type: 'app-shortcut', appName: 'Xpense' },
      { type: 'app-shortcut', appName: 'System Logs' },
    ],
  },
}
