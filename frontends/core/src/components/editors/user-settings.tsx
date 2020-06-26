import { Shade, createComponent } from '@furystack/shades'
import { deepMerge, debounce } from '@furystack/utils'
import { auth } from '@common/models'
import { AuthApiService } from '@common/frontend-utils'
import Semaphore from 'semaphore-async-await'
import { MonacoEditorProps, MonacoEditor } from '../monaco-editor'
import { MonacoModelProvider } from '../../services/monaco-model-provider'

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
  render: ({ props, getState, updateState, injector }) => {
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
          model: injector
            .getInstance(MonacoModelProvider)
            .getModelForEntityType({ schema: 'authSchema', entity: 'UserSettings' }),
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
