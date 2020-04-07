export class Account {
  _id!: string
  ownerType!: 'user' | 'organization'
  ownerName!: string
  name!: string
  history!: Array<{
    balance: number
    date: string
    change: number
    changePerCategory: Array<{ categoryName: string; amount: number }>
    relatedEntry: { type: 'replenishment'; replenishmentId: string } | { type: 'shopping'; shoppingId: string }
  }>
  current!: number
  createdBy!: string
  creationDate!: string
}
