import { argv } from 'process'
import { attachShutdownHandler } from '@common/service-utils'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
//import { RabbitListener } from './services/rabbit-listener'
import { dashEncoder } from './services/dash-encoder'

const namePostfix = argv[2] || 'default'

export const injector = new Injector()
injector.useDbLogger({ appName: `media-encoder-${namePostfix}` }).useLogging(VerboseConsoleLogger)
injector.logger.withScope('INIT').information({ message: 'Initializing...' })
// injector.getInstance(RabbitListener)
attachShutdownHandler(injector)

dashEncoder({
  source:
    'e:\\torrent\\Amerika.kapitany.Polgarhaboru.2016.1080p.UHD.BluRay.DD+7.1.HDR.x265-gyontato\\Sample\\Sample.mkv',
  target: 'd:\\temp\\multivesrse-stores\\encoded-media\\5eea7c187c1c612b18cc0ebb\\dash.mpd',
  formats: [
    { size: 320, bitrate: 500 },
    { size: 480, bitrate: 640 },
    { size: 720, bitrate: 1500 },
    { size: 1080, bitrate: 2000 },
  ],
})
