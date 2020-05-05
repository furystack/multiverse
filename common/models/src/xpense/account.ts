export interface AccountHistoryEntry {
  balance: number
  date: string
  change: number
  relatedEntry: { type: 'replenishment'; replenishmentId: string } | { type: 'shopping'; shoppingId: string }
}

export class Account {
  _id!: string
  ownerType!: 'user' | 'organization'
  ownerName!: string
  name!: string
  description!: string
  icon!: string
  history!: AccountHistoryEntry[]
  current!: number
  createdBy!: string
  creationDate!: string
}
