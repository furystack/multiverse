import { Shade, createComponent } from '@furystack/shades'
import { Input, Autocomplete, Button } from '@furystack/shades-common-components'
import { xpense } from '@common/models'

export interface ShoppingEntry {
  name: string
  amount: number
  unitPrice: number
  totalPrice: number
}

export interface ShoppingEntryProps {
  entry: ShoppingEntry
  items: xpense.Item[]
  onChange: (updated: ShoppingEntry) => void
  onRemove: (entry: ShoppingEntry) => void
}

export const ShoppingEntryRow = Shade<ShoppingEntryProps>({
  shadowDomName: 'xpense-shopping-entry',
  render: ({ props, element }) => {
    const getUnitPriceInput = () => element.querySelector('input[name=unitPrice]') as HTMLInputElement
    const getTotalPriceInput = () => element.querySelector('input[name=totalPrice]') as HTMLInputElement
    const getAmountInput = () => element.querySelector('input[name=amount]') as HTMLInputElement
    const getNameInput = () => element.querySelector('input[name=entryName]') as HTMLInputElement

    const getUnitPrice = () => parseFloat(getUnitPriceInput().value)
    const getTotalPrice = () => parseFloat(getTotalPriceInput().value)
    const getAmount = () => parseFloat(getAmountInput().value)
    const getName = () => getNameInput().value

    const setUnitPrice = (newValue: number) => parseFloat((getUnitPriceInput().value = newValue.toString()))
    const setTotalPrice = (newValue: number) => parseFloat((getTotalPriceInput().value = newValue.toString()))
    const setAmount = (newValue: number) => parseFloat((getAmountInput().value = newValue.toString()))

    const getEntriesFromInputs: () => ShoppingEntry = () => ({
      name: getName(),
      amount: getAmount(),
      totalPrice: getTotalPrice(),
      unitPrice: getUnitPrice(),
    })

    return (
      <div style={{ display: 'inline-flex' }}>
        <Autocomplete
          inputProps={{ labelTitle: 'Select an item', value: props.entry.name, name: 'entryName', required: true }}
          suggestions={props.items.map((i) => i.name)}
          onchange={(value) => {
            props.onChange({ ...props.entry, name: value })
          }}
        />
        <Input
          type="number"
          labelTitle="Unit price"
          name="unitPrice"
          step="any"
          value={props.entry.unitPrice.toString()}
          required
          onTextChange={(value) => {
            const valueNo = parseFloat(value)
            const totalPrice = valueNo * getAmount()
            setUnitPrice(valueNo)
            setTotalPrice(totalPrice)
            props.onChange({
              ...getEntriesFromInputs(),
              unitPrice: valueNo,
              totalPrice,
            })
          }}
        />
        <Input
          type="number"
          labelTitle="Amount"
          name="amount"
          step="any"
          value={props.entry.amount.toString()}
          min="0"
          required
          onTextChange={(value) => {
            const amountNo = parseFloat(value)
            const unitPrice = getUnitPrice()
            const totalPrice = unitPrice * amountNo
            setTotalPrice(totalPrice)
            setAmount(amountNo)
            props.onChange({
              ...getEntriesFromInputs(),
              unitPrice,
              amount: amountNo,
              totalPrice,
            })
          }}
        />
        <Input
          name="totalPrice"
          type="number"
          labelTitle="Total Price"
          value={props.entry.totalPrice.toString()}
          required
          onTextChange={(value) => {
            const totalPriceNo = parseFloat(value)
            const unitPrice = totalPriceNo / getAmount()
            setUnitPrice(unitPrice)
            props.onChange({
              ...getEntriesFromInputs(),
              totalPrice: totalPriceNo,
            })
          }}
        />
        <Button type="button" onclick={() => props.onRemove(props.entry)}>
          🚮
        </Button>
      </div>
    )
  },
})
