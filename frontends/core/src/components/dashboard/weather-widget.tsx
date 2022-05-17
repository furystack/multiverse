import { DashboardApiService } from '@common/frontend-utils'
import { dashboard } from '@common/models'
import { createComponent, LazyLoad, Shade } from '@furystack/shades'
import { Loader, promisifyAnimation } from '@furystack/shades-common-components'
import { GenericErrorPage } from '../../pages/generic-error'

export const WeatherWidget = Shade<dashboard.WeatherWidget & { index: number }>({
  shadowDomName: 'weather-widget',
  render: ({ props, element, injector }) => {
    const title = `Weather for ${props.city}`
    setTimeout(() => {
      promisifyAnimation(element.querySelector('div'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
        fill: 'forwards',
        delay: 500 + (props.index === undefined ? Math.random() * 10 : props.index) * 100,
        duration: 200,
      })
    })
    return (
      <div
        title={title}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          width: '256px',
          height: '256px',
          filter: 'saturate(0.3)brightness(0.6)',
          background: 'rgba(128,128,128,0.1)',
          transform: 'scale(0)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <LazyLoad
            loader={<Loader style={{ width: '50%', height: '50%', margin: 'auto' }} />}
            error={(error, retry) => <GenericErrorPage error={error} retry={retry} />}
            component={async () => {
              const { result } = await injector.getInstance(DashboardApiService).call({
                method: 'GET',
                action: '/weather-forecast',
                query: { units: 'metric', city: props.city },
              })
              const currentWeather = result.list[0]

              return (
                <div
                  title={title}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <img
                      style={{ width: '156px', filter: 'drop-shadow(0px 0px 17px rgba(0,0,0,0.6))' }}
                      alt={currentWeather.weather[0].description}
                      title={currentWeather.weather[0].description}
                      src={`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
                    />
                    <a
                      style={{ position: 'absolute', top: '.5em', right: '.5em', fontSize: '2em' }}
                      href={`https://www.google.com/maps/@${result.city.coord.lat},${result.city.coord.lon},14z`}
                      target="blank"
                      title="Open location on the map"
                    >
                      📍
                    </a>
                  </div>
                  <div style={{ maxWidth: '100%', overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis' }}>
                    <span>{result.city.name}</span> <br />
                    <span title="Temperature in Celsius">{`${currentWeather.main.temp}°`}</span>
                    <span
                      style={{ marginLeft: '.5em' }}
                      title="Humidity in Percent"
                    >{`🌫${currentWeather.main.humidity}%`}</span>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </div>
    )
  },
})
