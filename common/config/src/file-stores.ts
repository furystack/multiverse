export const FileStores = {
  avatars: process.env.FILE_STORE_AVATARS_PATH || '/data/avatars',
  encodedMedia: process.env.FILE_STORE_ENCODED_MEDIA || '/data/encoded_media',
  tempdir: process.env.TEMP,
}
