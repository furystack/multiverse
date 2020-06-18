import { dirname } from 'path'
import ffmpeg from 'fluent-ffmpeg'

export const dashEncoder = async (options: {
  source: string
  target: string
  formats: Array<{ size: number; bitrate: number }>
}) => {
  const proc = ffmpeg({
    source: options.source,
    cwd: dirname(options.target),
  } as any)
    .output(options.target)
    .format('dash')
    .videoCodec('libx264')
    .audioCodec('aac')
    .audioChannels(2)
    .audioFrequency(44100)
    .outputOptions([
      '-keyint_min 60',
      '-g 60',
      '-sc_threshold 0',
      '-profile:v main',
      '-use_template 1',
      '-use_timeline 1',
      '-b_strategy 0',
      '-bf 1',
      '-map 0:a',
      '-b:a 96k',
    ])

  for (const format of options.formats) {
    const index = options.formats.indexOf(format)

    proc.outputOptions([
      `-filter_complex [0]format=pix_fmts=yuv420p[temp${index}];[temp${index}]scale=-2:${format.size}[A${index}]`,
      `-map [A${index}]:v`,
      `-b:v:${index} ${format.bitrate}k`,
    ])
  }

  proc.on('start', (commandLine) => {
    console.log('progress', `Spawned Ffmpeg with command: ${commandLine}`)
  })

  return await new Promise((resolve, reject) => {
    proc
      .on('progress', (info) => {
        console.log('progress', info)
      })
      .on('end', () => {
        console.log('complete')
        resolve()
      })
      .on('error', (err) => {
        console.log('error', err)
        reject(err)
      })
    proc.run()
  })
}
