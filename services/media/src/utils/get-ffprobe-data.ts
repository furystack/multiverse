import { execAsync } from '@common/service-utils'
import { FFProbeResult } from 'ffprobe'

export const getFfprobeData = async (moviePath: string): Promise<FFProbeResult> => {
  const ffprobecmd = `ffprobe -v quiet -print_format json -show_format -show_streams -i "${moviePath}"`
  const ffprobeResult = await execAsync(ffprobecmd, {})
  return JSON.parse(ffprobeResult)
}
