export const FileStores = {
  avatars: process.env.FILE_STORE_AVATARS_PATH || '~/multiverse-data/avatars',
  encodedMedia: process.env.FILE_STORE_ENCODED_MEDIA || '~/multiverse-data/encoded_media',
  mediaEncoderWorkerTemp: process.env.MEDIA_ENCODER_WORKER_TEMP || 'd:\\temp\\ffmpeg-mock', // ToDo: fixme :)
  tempdir: process.env.TEMP || '/tmp',
}
