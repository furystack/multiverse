import { roles } from './auth/roles'

export type ServiceDescription<T> = {
  name: T
  description: string
  url: string
  icon: string
  requiredRoles: Array<typeof roles[number]>
}

export const serviceNames = [
  'Profile',
  'Xpense',
  'Organizations',
  'Feature Switches',
  'Users',
  'Diagnostics',
  'System Logs',
  'Movies',
] as const

export const serviceList: Array<ServiceDescription<typeof serviceNames[number]>> = [
  {
    name: 'Profile',
    icon: '😎',
    description: 'Manage your personal info, contact data, login info',
    url: '/profile',
    requiredRoles: ['terms-accepted'],
  },
  {
    name: 'Xpense',
    icon: '💰',
    description: 'Manage accounts, incomes and expences',
    requiredRoles: ['terms-accepted'],
    url: '/xpense',
  },
  {
    name: 'Organizations',
    icon: '🏢',
    description: 'Create and edit organizations, review your memberships',
    url: '/organizations',
    requiredRoles: ['terms-accepted'],
  },
  {
    name: 'Feature Switches',
    icon: '💡',
    description: 'Turn on/off features for a specified subset of users',
    url: '/feature-switches',
    requiredRoles: ['feature-switch-admin'],
  },
  {
    name: 'Users',
    icon: '🔐',
    description: 'Manage user accesses and roles',
    url: '/user-admin',
    requiredRoles: ['user-admin'],
  },
  {
    name: 'Diagnostics',
    icon: '🩺',
    description: 'Check the system health',
    url: '/sys-diags',
    requiredRoles: ['sys-diags'],
  },
  {
    name: 'System Logs',
    icon: '📚',
    description: 'View detailed logs about the system',
    url: '/sys-logs',
    requiredRoles: ['sys-logs'],
  },
  {
    name: 'Movies',
    icon: '🎬',
    description: 'Watch the uploaded movies',
    url: '/movies',
    requiredRoles: ['terms-accepted'],
  },
]
