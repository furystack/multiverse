import { join } from 'path'
import { writeFile } from 'fs'
import { injector } from './config'
import { ModelBuilder, xmlToString } from '@furystack/odata/dist/'
;(async () => {
  const logger = injector.logger.withScope('metadata-writer')
  const model = injector.getInstance(ModelBuilder)
  const xml = xmlToString(model.toXmlNode())

  logger.information({
    message: `Metadata XML parsed`,
    data: xml,
  })

  const file = join(__dirname, '..', '..', 'metadata.xml')

  await new Promise((resolve, reject) => writeFile(file, xml, err => (err ? reject(err) : resolve())))
  logger.information({
    message: `File '${file}' has been written.`,
  })
})()
