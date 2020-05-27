import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Chart, ChartPoint } from 'chart.js'
import { xpense } from '@common/models'
import { colors, Button } from '@furystack/shades-common-components'

export const AccountHistoryChart = Shade<{ accountId: 'string'; history: xpense.Account['history'] }>({
  shadowDomName: 'xpense-account-history-page',
  onAttach: ({ element, props, injector }) => {
    setTimeout(() => {
      const canvas = element.querySelector('canvas') as HTMLCanvasElement
      new Chart(canvas, {
        type: 'line',
        data: {
          labels: props.history.map((h) => h.date),
          datasets: [
            {
              label: 'Balance',
              data: props.history.map((h) => ({ y: h.balance, t: new Date(h.date), historyItem: h } as ChartPoint)),
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
            const ev: xpense.Account['history'][number] = props.history[(el as any)[0]?._index as number]
            const { relatedEntry } = ev
            if (relatedEntry.type === 'replenishment') {
              history.pushState({}, '', `/xpense/${props.accountId}/replenishment/${relatedEntry.replenishmentId}`)
            } else if (relatedEntry.type === 'shopping') {
              history.pushState({}, '', `/xpense/${props.accountId}/shopping/${relatedEntry.shoppingId}`)
            }
            injector.getInstance(LocationService).updateState()
          },
          elements: {
            rectangle: {},
            line: {
              cubicInterpolationMode: 'monotone',
            },
            point: {
              radius: 10,
              hoverRadius: 15,
              pointStyle: ((ctx: any) => {
                if (ctx.dataset.data[ctx.dataIndex].historyItem.relatedEntry.type === 'replenishment') {
                  return 'rect'
                }
                return 'circle'
              }) as any,
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
