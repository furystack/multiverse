import { Shade, createComponent } from '@furystack/shades'
import { Chart, ChartPoint } from 'chart.js'
import { xpense } from 'common-models'
import { colors, Button } from 'common-components'

export const AccountHistory = Shade<{ account: xpense.Account }>({
  shadowDomName: 'xpense-account-history-page',
  onAttach: ({ element, props }) => {
    setTimeout(() => {
      const canvas = element.querySelector('canvas') as HTMLCanvasElement
      new Chart(canvas, {
        type: 'line',
        data: {
          labels: props.account.history.map((h) => h.date),
          datasets: [
            {
              label: 'Balance',
              data: props.account.history.map((h) => ({ y: h.balance, t: new Date(h.date) } as ChartPoint)),
              borderColor: colors.primary.main,
              backgroundColor: colors.primary.dark,
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },
          onClick: (_ev, el) => {
            if (!(el as any)[0]) {
              return
            }
            const ev: xpense.Account['history'][number] = props.account.history[(el as any)[0]?._index as number]
            if ((ev.relatedEntry as any).replenishmentId) {
              alert('Replenishment')
            }
          },
          elements: {
            line: {
              cubicInterpolationMode: 'monotone',
            },
            point: {
              radius: 5,
            },
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                time: {
                  minUnit: 'hour',
                },
              },
            ],
          },
        },
      })
    }, 100)
  },
  render: () => {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        <div style={{ width: 'calc(100% - 4em)', height: 'calc(100% - 4em)' }}>
          <canvas></canvas>
        </div>
        <Button onclick={() => history.back()}>Back</Button>
      </div>
    )
  },
})
