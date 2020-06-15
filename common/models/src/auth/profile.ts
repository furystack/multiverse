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
      {
        type: 'continue-movies',
        count: 10,
        minWidth: '100%',
      },
      {
        type: 'app-list',
        title: 'My Favourite Apps',
        minWidth: '256px',
        width: '50%',
        apps: ['Xpense', 'Movies', 'Profile'],
      },
      {
        type: 'app-list',
        title: 'System Apps',
        minWidth: '256px',
        width: '50%',
        apps: ['System Logs', 'Users', 'Diagnostics', 'Organizations', 'Feature Switches'],
      },
    ],
  },
}
