import type { roles } from './auth/roles'
import type { Icon } from './common'

export type ServiceDescription<T> = {
  name: T
  description: string
  url: string
  icon: Icon
  requiredRoles: Array<(typeof roles)[number]>
}

export const serviceNames = [
  'Profile',
  'Organizations',
  'Feature Switches',
  'Users',
  'Diagnostics',
  'System Logs',
  'Patches',
  'Movies',
  'Encoding Tasks',
  'Dashboards',
] as const

export const serviceList: Array<ServiceDescription<(typeof serviceNames)[number]>> = [
  {
    name: 'Profile',
    icon: { type: 'flaticon-essential', name: '364-user.svg' },
    description: 'Manage your personal info, contact data, login info',
    url: '/profile',
    requiredRoles: ['terms-accepted'],
  },
  {
    name: 'Organizations',
    icon: { type: 'flaticon-essential', name: '092-network.svg' },
    description: 'Create and edit organizations, review your memberships',
    url: '/organizations',
    requiredRoles: ['terms-accepted'],
  },
  {
    name: 'Feature Switches',
    icon: { type: 'flaticon-essential', name: '328-switch.svg' },
    description: 'Turn on/off features for a specified subset of users',
    url: '/feature-switches',
    requiredRoles: ['feature-switch-admin'],
  },
  {
    name: 'Users',
    icon: { type: 'flaticon-essential', name: '360-users.svg' },
    description: 'Manage user accesses and roles',
    url: '/users',
    requiredRoles: ['user-admin'],
  },
  {
    name: 'Diagnostics',
    icon: '🩺',
    description: 'Check the system health',
    url: '/diags',
    requiredRoles: ['sys-diags'],
  },
  {
    name: 'System Logs',
    icon: { type: 'flaticon-essential', name: '256-file.svg' },
    description: 'View detailed logs about the system',
    url: '/diags/logs',
    requiredRoles: ['sys-diags'],
  },
  {
    name: 'Patches',
    icon: { type: 'flaticon-essential', name: '308-price tag.svg' },
    description: 'Log about patch executions',
    url: '/diags/patches',
    requiredRoles: ['sys-diags'],
  },

  {
    name: 'Movies',
    icon: {
      type: 'flaticon-essential',
      name: '002-video player.svg',
    },
    description: 'Watch the uploaded movies',
    url: '/movies',
    requiredRoles: ['terms-accepted'],
  },
  {
    name: 'Encoding Tasks',
    icon: { type: 'flaticon-essential', name: '258-list.svg' },
    description: 'Keep an eye on how the encoding tasks goes',
    url: '/movies/encoding-tasks',
    requiredRoles: ['movie-admin'],
  },
  {
    name: 'Dashboards',
    icon: { type: 'flaticon-essential', name: '263-notepad.svg' },
    description: 'List of the available dashboards',
    url: '/dashboard/list',
    requiredRoles: ['terms-accepted'],
  },
]
