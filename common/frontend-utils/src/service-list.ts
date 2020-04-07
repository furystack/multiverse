import { roles } from 'common-models'

export interface ServiceDescription {
  name: string
  description: string
  url: string
  icon: string
  requiredRoles: Array<typeof roles[number]>
  showInDashboard: boolean
  showInMenu: boolean
}

export const serviceList: ServiceDescription[] = [
  {
    name: 'Profile',
    icon: '😎',
    description: 'Manage your personal info, contact data, login info',
    url: '/profile',
    showInMenu: true,
    showInDashboard: true,
    requiredRoles: ['terms-accepted'],
  },
  {
    name: 'Xpense',
    icon: '💰',
    description: 'Manage accounts, incomes and expences',
    showInMenu: true,
    showInDashboard: true,
    requiredRoles: ['terms-accepted'],
    url: '/xpense',
  },
  {
    name: 'Organizations',
    icon: '🏢',
    description: 'Create and edit organizations, review your memberships',
    url: '/organizations',
    showInDashboard: true,
    showInMenu: true,
    requiredRoles: ['terms-accepted'],
  },
  {
    name: 'Feature Switches',
    icon: '💡',
    description: 'Turn on/off features for a specified subset of users',
    url: '/feature-switches',
    showInDashboard: true,
    showInMenu: true,
    requiredRoles: ['feature-switch-admin'],
  },
  {
    name: 'Users',
    icon: '🔐',
    description: 'Manage user accesses and roles',
    url: '/user-admin',
    showInDashboard: true,
    showInMenu: true,
    requiredRoles: ['user-admin'],
  },
  {
    name: 'Diagnostics',
    icon: '🩺',
    description: 'Check the system health',
    url: '/sys-diags',
    showInDashboard: true,
    showInMenu: true,
    requiredRoles: ['sys-diags'],
  },
  {
    name: 'System Logs',
    icon: '📚',
    description: 'View detailed logs about the system',
    url: '/sys-logs',
    showInDashboard: true,
    showInMenu: true,
    requiredRoles: ['sys-logs'],
  },
]
