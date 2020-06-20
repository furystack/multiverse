// import { argv } from 'process'
import { attachShutdownHandler } from '@common/service-utils'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { RabbitListener } from './services/rabbit-listener'

// const namePostfix = argv[2] || 'default'

export const injector = new Injector()
injector.useLogging(VerboseConsoleLogger)
injector.logger.withScope('INIT').information({ message: 'Initializing...' })
injector.getInstance(RabbitListener)
attachShutdownHandler(injector)

// dashEncoder({
//   source:
//     'e:\\torrent\\Amerika.kapitany.Polgarhaboru.2016.1080p.UHD.BluRay.DD+7.1.HDR.x265-gyontato\\Sample\\Sample.mkv',
//   target: 'd:\\temp\\multivesrse-stores\\encoded-media\\5eea7c187c1c612b18cc0ebb\\dash.mpd',
//   formats: [
//     { size: 240, minBitrate: 75, maxBitrate: 218, targetBitrate: 150 },
//     { size: 480, minBitrate: 256, maxBitrate: 742, targetBitrate: 512 },
//     { size: 720, minBitrate: 900, maxBitrate: 2610, targetBitrate: 1800 },
//     { size: 1080, minBitrate: 1500, maxBitrate: 13000, targetBitrate: 8000 },
//   ],
// })
