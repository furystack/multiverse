import { promises, createReadStream } from 'fs'
import { RequestAction, BypassResult } from '@furystack/rest'

export const DemoAction: RequestAction<{}> = async ({ request, response }) => {
  const path =
    'e:\\Sorozatok\\The.Witcher.S01.2160p.HDR.NF.WEBRip.DDP5.1.Atmos.x265.HUN.ENG-PTHD\\The.Witcher.S01E01.2160p.HDR.NF.WEBRip.DDP5.1.Atmos.x265.HUN.ENG-PTHD.mkv'
  const stat = await promises.stat(path)
  const fileSize = stat.size
  const { range } = request.headers
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunksize = end - start + 1
    const file = createReadStream(path, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    response.writeHead(206, head)
    file.pipe(response)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    response.writeHead(200, head)
    createReadStream(path).pipe(response)
  }
  return BypassResult()
}
