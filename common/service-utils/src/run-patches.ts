import { diag } from '@common/models'
import { Injector } from '@furystack/inject'
import { databases } from '@common/config'
import { StoreManager } from '@furystack/core'

export interface PatchEntry {
  patchName: string
  patchDescription: string
  mode: 'once' | 'always'
  exec: (injector: Injector) => Promise<Pick<diag.Patch, 'errors' | 'warns' | 'updates'>>
}

export const runPatches = async (options: { injector: Injector; patches: PatchEntry[] }) => {
  const { name: appName } = options.injector.getApplicationContext()
  const logger = options.injector.logger.withScope('runPatches')
  await logger.verbose({ message: `Running patches for app '${appName}'...` })
  options.injector.setupStores((sm) =>
    sm.useMongoDb({
      model: diag.Patch,
      primaryKey: '_id',
      url: databases.diag.mongoUrl,
      db: databases.diag.dbName,
      collection: databases.diag.patches,
    }),
  )
  const patchStore = options.injector.getInstance(StoreManager).getStoreFor(diag.Patch, '_id')
  for (const patch of options.patches) {
    if (patch.mode === 'once') {
      const existing = await patchStore.find({
        filter: { name: { $eq: patch.patchName }, appName: { $eq: appName }, status: { $eq: 'completed' } },
      })
      if (existing.length > 0) {
        logger.verbose({
          message: `Patch '${patch.patchName}' has already been executed, skipping...`,
          data: { existing },
        })
        return
      }
    }
    const startDate = new Date()
    try {
      await logger.information({ message: `Starting Patch '${patch.patchName}'` })
      const result = await patch.exec(options.injector)
      const finishDate = new Date()
      await patchStore.add({
        ...result,
        appName,
        name: patch.patchName,
        description: patch.patchDescription,
        startDate,
        finishDate,
        status: 'completed',
      })
      await logger.information({ message: `Patch '${patch.patchName}' has been executed succesfully`, data: result })
    } catch (error) {
      await logger.fatal({
        message: `Patch '${patch.patchName}' has been failed. Stopping execution...`,
        data: { error },
      })
      const finishDate = new Date()
      await patchStore.add({
        name: patch.patchName,
        description: patch.patchDescription,
        appName,
        startDate,
        finishDate,
        error,
        status: 'failed',
      })
    }
  }
}
