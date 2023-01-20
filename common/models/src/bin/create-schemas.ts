import { join } from 'path'
import { promises } from 'fs'
import { createGenerator } from 'ts-json-schema-generator'

export interface SchemaGenerationSetting {
  inputFile: string
  outputFile: string
  type: string
}

export const entityValues: SchemaGenerationSetting[] = [
  {
    inputFile: './src/auth/*.ts',
    outputFile: './src/json-schemas-auth.json',
    type: '*',
  },
  {
    inputFile: './src/dashboard/index.ts',
    outputFile: './src/json-schemas-dashboard.json',
    type: 'Dashboard',
  },
  {
    inputFile: './src/diag/*.ts',
    outputFile: './src/json-schemas-diag.json',
    type: '*',
  },
  {
    inputFile: './src/media/*.ts',
    outputFile: './src/json-schemas-media.json',
    type: '*',
  },
]

export const apiValues: SchemaGenerationSetting[] = [
  {
    inputFile: './src/apis/auth-api.ts',
    outputFile: './src/apis/auth-api.schema.json',
    type: '*',
  },
  {
    inputFile: './src/apis/dashboard-api.ts',
    outputFile: './src/apis/dashboard-api.schema.json',
    type: '*',
  },

  {
    inputFile: './src/apis/diag-api.ts',
    outputFile: './src/apis/diag-api.schema.json',
    type: '*',
  },
  {
    inputFile: './src/apis/media-api.ts',
    outputFile: './src/apis/media-api.schema.json',
    type: '*',
  },
]

export const exec = async () => {
  for (const schemaValue of [...entityValues, ...apiValues]) {
    try {
      console.log(`Create schema from ${schemaValue.inputFile} to ${schemaValue.outputFile}`)
      const schema = createGenerator({
        path: join(process.cwd(), schemaValue.inputFile),
        tsconfig: join(process.cwd(), './tsconfig.json'),
        skipTypeCheck: true,
        expose: 'all',
      }).createSchema(schemaValue.type)
      await promises.writeFile(join(process.cwd(), schemaValue.outputFile), JSON.stringify(schema, null, 2))
    } catch (error) {
      console.error(`There was an error generating schema from ${schemaValue.inputFile}`, error)
    }
  }
}

exec()
