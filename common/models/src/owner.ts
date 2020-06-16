export type Owner =
  | {
      type: 'user'
      username: string
    }
  | {
      type: 'organization'
      organizationName: string
    }
