import { Owner } from '../owner'
import { Widget } from '.'

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
}
