export class Patch {
  _id!: string
  appName!: string
  name!: string
  description!: string
  status!: 'completed' | 'failed'
  startDate!: Date
  finishDate!: Date
  error?: any
  errors?: Array<{ message: string; stack: string }>
  warns?: string[]
  updates?: string[]
}
