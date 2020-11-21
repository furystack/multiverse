import { promises } from 'fs'
import { join } from 'path'
import { v4 } from 'uuid'
import { FileStores } from '@common/config'
import { execAsync, existsAsync } from '@common/service-utils'
import { media } from '@common/models'
import { Injector } from '@furystack/inject'
import rimraf from 'rimraf'

export const extractSubtitles = async (options: { injector: Injector; movie: media.Movie }) => {
  const subtitles: Array<{
    streamIndex: number
  }> =
    options.movie.ffprobe.streams
      .filter((stream) => stream.codec_type === 'subtitle')
      .map((stream) => ({
        streamIndex: stream.index,
      })) || []

  const cwd = join(FileStores.tempdir, 'extract-subtitles', v4())
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
  await Promise.all(files.map((f) => promises.unlink(join(cwd, f))))

  await new Promise<void>((resolve, reject) => rimraf(cwd, {}, (err) => (err ? reject(err) : resolve())))
}
