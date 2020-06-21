export const FileStores = {
  avatars: process.env.FILE_STORE_AVATARS_PATH || '/data/avatars',
  encodedMedia: process.env.FILE_STORE_ENCODED_MEDIA || '/data/encoded_media',
  mediaEncoderWorkerTemp: process.env.MEDIA_ENCODER_WORKER_TEMP || 'd:\\temp\\ffmpeg-mock', // ToDo: fixme :)
  tempdir: process.env.TEMP || '/tmp',
}
