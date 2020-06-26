import { authSchema, dashboardSchema, diagSchema, mediaSchema, xpenseSchema } from '@common/models'
import { Injectable } from '@furystack/inject'
import * as monaco from 'monaco-editor'

export type SchemaNames = keyof MonacoModelProvider['schemas']
export type EntityNames<TSchema extends SchemaNames> = keyof MonacoModelProvider['schemas'][TSchema]['definitions']

@Injectable({ lifetime: 'singleton' })
export class MonacoModelProvider {
  public readonly schemas = { authSchema, dashboardSchema, diagSchema, mediaSchema, xpenseSchema }

  private modelCache = new Map<string, monaco.editor.ITextModel>()

  public getModelForEntityType<TSchema extends SchemaNames, TEntity extends EntityNames<TSchema>>({
    schema,
    entity,
  }: {
    schema: TSchema
    entity: TEntity
  }) {
    const key = `${schema}-${entity}`

    if (this.modelCache.has(key)) {
      return this.modelCache.get(key) as monaco.editor.ITextModel
    }
    const modelUri = monaco.Uri.parse(`furystack://shades/model-schemas-${key}.json`)
    const model = monaco.editor.createModel('', 'json', modelUri)
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: `http://multiverse.my.to/schemas/monaco-editor/schema-${key}.json`,
          fileMatch: [modelUri.toString()],
          schema: { ...this.schemas[schema], $ref: `#/definitions/${entity}` },
        },
      ],
    })
    this.modelCache.set(key, model)
    return model
  }
}
