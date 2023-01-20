import type { FlatIconEssentialNames } from './flaticon-essential-names'

export type FlatEssentialType = {
  type: 'flaticon-essential'
  name: (typeof FlatIconEssentialNames)[number]
}
export type Icon = FlatEssentialType | string
