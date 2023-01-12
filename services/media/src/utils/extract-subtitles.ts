import { promises } from 'fs'
import { join } from 'path'
import { FileStores } from '@common/config'
import { execAsync, existsAsync } from '@common/service-utils'
import type { media } from '@common/models'
import { getRandomString } from '@common/models'
import type { Injector } from '@furystack/inject'
import rimraf from 'rimraf'
import { getLogger } from '@furystack/logging'

export const extractSubtitles = async (options: { injector: Injector; movie: media.Movie }) => {
  const logger = getLogger(options.injector).withScope('extract-subtitles')

  logger.information({
    message: `Starting to extract subtitles for movie '${options.movie.metadata.title}'`,
    data: {
      movie: {
        _id: options.movie._id,
        title: options.movie.metadata.title,
      },
    },
  })

  const subtitles: Array<{
    streamIndex: number
  }> =
    options.movie.ffprobe.streams
      .filter((stream) => (stream.codec_type as any) === 'subtitle')
      .map((stream) => ({
        streamIndex: stream.index,
      })) || []

  const cwd = join(FileStores.tempdir, 'extract-subtitles', getRandomString(16))
  await promises.mkdir(cwd, { recursive: true })

  await execAsync(
    `ffmpeg -i ${options.movie.path} -f webvtt ${subtitles
      .map((s, i) => `-map 0:s:${i} stream${s.streamIndex}.vtt`)
      .join(' ')}`,
    {
      cwd,
    },
  )

  const files = await promises.readdir(cwd)

  const subtitlesDir = join(FileStores.subtitles, options.movie._id, 'extracted')
  if (!(await existsAsync(subtitlesDir))) {
    await promises.mkdir(subtitlesDir, { recursive: true })
  } else {
    const oldFiles = await promises.readdir(subtitlesDir)
    await Promise.all(oldFiles.map((file) => promises.unlink(join(subtitlesDir, file))))
  }

  await Promise.all(files.map((file) => promises.copyFile(join(cwd, file), join(subtitlesDir, file))))
  await Promise.all(files.map((file) => promises.unlink(join(cwd, file))))
  await new Promise<void>((resolve, reject) => rimraf(cwd, {}, (err) => (err ? reject(err) : resolve())))
  logger.information({
    message: `Subtitles has been extracted from stream for movie '${options.movie.metadata.title}'`,
    data: {
      movie: {
        _id: options.movie._id,
        title: options.movie.metadata.title,
      },
    },
  })
}
