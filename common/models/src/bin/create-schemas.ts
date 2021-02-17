import { join } from 'path'
import { promises } from 'fs'
import { createGenerator } from 'ts-json-schema-generator'

export interface SchemaGenerationSetting {
  inputFile: string
  outputFile: string
  type: string
}

export const values: SchemaGenerationSetting[] = [
  {
    inputFile: './src/auth/*.ts',
    outputFile: './src/json-schemas-auth.json',
    type: '*',
  },
  {
    inputFile: './src/dashboard/*.ts',
    outputFile: './src/json-schemas-dashboard.json',
    type: '*',
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
  {
    inputFile: './src/xpense/*.ts',
    outputFile: './src/json-schemas-xpense.json',
    type: '*',
  },
]

export const exec = async () => {
  for (const schemaValue of values) {
    const schema = createGenerator({
      path: join(process.cwd(), schemaValue.inputFile),
      tsconfig: join(process.cwd(), './tsconfig.json'),
      expose: 'export',
      skipTypeCheck: true,
    }).createSchema(schemaValue.type)
    await promises.writeFile(join(process.cwd(), schemaValue.outputFile), JSON.stringify(schema, null, 2))
  }
}

exec()
