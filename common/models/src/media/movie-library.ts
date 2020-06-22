import { Owner } from '../owner'

export type EncodingType = {
  mode: 'dash'
  codec: 'libvpx-vp9'
  formats: Vp9EncodingFormat[]
}

export type Vp9EncodingFormat = { downScale?: number } & {
  bitrate?: {
    target?: number
    min?: number
    max?: number
  }
  quality?: number
}

export class MovieLibrary {
  _id!: string
  icon!: string
  name!: string
  path!: string
  owner!: Owner
  ownerName!: string
  encoding!: EncodingType | false
}

export const defaultEncoding: EncodingType = {
  mode: 'dash',
  codec: 'libvpx-vp9',
  formats: [
    {
      downScale: 240,
      quality: 37,
      bitrate: {
        min: 75,
        target: 218,
        max: 150,
      },
    },
    {
      downScale: 480,
      quality: 32,
      bitrate: {
        min: 256,
        target: 521,
        max: 742,
      },
    },
    {
      downScale: 720,
      quality: 32,
      bitrate: {
        min: 900,
        target: 1800,
        max: 2610,
      },
    },
    {
      downScale: 1080,
      quality: 10,
      bitrate: {
        min: 8000,
        target: 12000,
        max: 15000,
      },
    },
  ],
}
