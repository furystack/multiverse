export const FileStores = {
  avatars: process.env.FILE_STORE_AVATARS_PATH || '/tmp/multiverse-data/avatars',
  encodedMedia: process.env.FILE_STORE_ENCODED_MEDIA || '/tmp/multiverse-data/encoded_media',
  mediaEncoderWorkerTemp: process.env.MEDIA_ENCODER_WORKER_TEMP || '/tmp/multiverse-data/worker-temp',
  tempdir: process.env.TEMP || '/tmp',
}
