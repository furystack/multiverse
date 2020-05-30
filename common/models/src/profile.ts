import { UserSettings } from './schemas'

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
      { type: 'app-shortcut', appName: 'Xpense' },
      { type: 'app-shortcut', appName: 'System Logs' },
      { type: 'icon-url-widget', name: 'GooGolE', icon: '💀', url: 'https://google.com', description: 'GoTo Google' },
      {
        type: 'html',
        content: "<div style='color:red'>Anyádat</div>",
      },
      {
        type: 'markdown',
        content: '### Header \r\n [GitHubKA](http://github.com)',
      },
    ],
  },
}
