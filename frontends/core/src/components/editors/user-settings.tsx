import { Shade, createComponent } from '@furystack/shades'
import { deepMerge, debounce } from '@furystack/utils'
import * as monaco from 'monaco-editor'
import { authSchema, auth } from '@common/models'
import { AuthApiService } from '@common/frontend-utils'
import Semaphore from 'semaphore-async-await'
import { MonacoEditorProps, MonacoEditor } from '../monaco-editor'

const modelUri = monaco.Uri.parse('furystack://shades/monaco-editor-settings.json') // a made up unique URI for our model
const model = monaco.editor.createModel('', 'json', modelUri)

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: [
    {
      uri: 'http://multiverse.my.to/schemas/monaco-editor/schema.json',
      fileMatch: [modelUri.toString()],
      schema: { ...authSchema, $ref: '#/definitions/UserSettings' },
    },
  ],
})

export const UserSettingsEditor = Shade<
  MonacoEditorProps & { value: string },
  {
    save: (options: { value: string; lastValue: string; lock: Semaphore }) => Promise<void>
    lock: Semaphore
    value: string
    lastValue: string
  }
>({
  shadowDomName: 'user-settings-editor',
  getInitialState: ({ injector, props }) => ({
    lock: new Semaphore(1),
    lastValue: props.value,
    value: props.value,
    save: async ({ value, lastValue, lock }) => {
      {
        await lock.acquire()
        try {
          if (value) {
            const settings: auth.UserSettings = JSON.parse(value)
            if (lastValue !== JSON.stringify(settings)) {
              await injector.getInstance(AuthApiService).call({
                method: 'POST',
                action: '/settings',
                body: settings,
              })
              lastValue = JSON.stringify(settings)
            }
          }
        } finally {
          lock.release()
        }
      }
    },
  }),
  constructed: ({ getState }) => {
    return async () => {
      await getState().save({
        lock: getState().lock,
        value: getState().value,
        lastValue: getState().lastValue,
      })
    }
  },
  render: ({ props, getState, updateState }) => {
    const saver = debounce(
      async () =>
        getState().save({
          lock: getState().lock,
          value: getState().value,
          lastValue: getState().lastValue,
        }),
      5000,
    )
    const monacoProps = deepMerge(
      { ...props },
      {
        options: {
          model,
          language: 'json',
        },
      },
    )

    return (
      <MonacoEditor
        {...monacoProps}
        onchange={(value) => {
          try {
            updateState({ value: JSON.stringify(JSON.parse(value)) }, true)
          } catch (error) {
            /** Parse error, ignore trying to save... */
          }
          saver()
        }}
      />
    )
  },
})
