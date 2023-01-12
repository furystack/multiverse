import type { Owner } from '../owner'
import type { Widget } from './widget'

export class Dashboard {
  _id!: string
  name!: string
  description!: string
  owner!: Owner
  creationDate!: Date
  modificationDate!: Date
  widgets!: Widget[]
}

export const defaultDashboard: Dashboard = {
  _id: '',
  name: 'Default User Dashboard',
  description: 'The default User dashboard',
  creationDate: new Date(0),
  modificationDate: new Date(0),
  owner: {
    type: 'system',
  },
  widgets: [
    {
      type: 'app-list',
      title: 'Content',
      apps: ['Movies', 'Profile'],
    },
    {
      type: 'app-list',
      title: 'Administration',
      apps: ['Users', 'Organizations', 'Feature Switches'],
    },
    {
      type: 'app-list',
      title: 'Diagnostics',
      apps: ['System Logs', 'Patches', 'Encoding Tasks'],
    },
  ],
}
