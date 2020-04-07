export class Shopping {
  _id!: string
  accountId!: string
  creationDate!: string
  entries!: Array<{ itemName: string; amount: number; unitPrice: number }>
  sumAmount!: number
  shopName!: string
  createdBy!: string
}
