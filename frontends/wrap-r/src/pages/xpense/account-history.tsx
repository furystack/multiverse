import { Shade, createComponent } from '@furystack/shades'
import { Chart, ChartPoint } from 'chart.js'
import { xpense } from 'common-models'
import { colors, Button } from 'common-components/src'

export const AccountHistory = Shade<{ account: xpense.Account }>({
  shadowDomName: 'xpense-account-history-page',
  onAttach: ({ element, props }) => {
    setTimeout(() => {
      const canvas = element.querySelector('canvas') as HTMLCanvasElement
      new Chart(canvas, {
        type: 'line',
        data: {
          labels: props.account.history.map((h) => [h.date]),
          datasets: [
            {
              label: 'Balance',
              data: props.account.history.map((h) => ({ y: h.balance, t: new Date(h.date) } as ChartPoint)),
              borderColor: colors.primary.main,
              backgroundColor: colors.primary.dark,
            },
          ],
        },
        options: {},
      })
    }, 100)
  },
  render: () => {
    return (
      <div style={{ width: '100%', height: '100%', padding: '2em' }}>
        Account history
        <canvas></canvas>
        <Button onclick={() => history.back()}>Back</Button>
      </div>
    )
  },
})
