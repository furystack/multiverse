import { media } from '@common/models'
import { execAsync } from '@common/service-utils'

export const getFfprobeData = async (moviePath: string): Promise<media.FfprobeMetadata> => {
  const ffprobecmd = `ffprobe -v quiet -print_format json -show_format -show_streams -i "${moviePath}`
  const ffprobeResult = await execAsync(ffprobecmd, {})
  return JSON.parse(ffprobeResult)
}
