import { CommandProvider } from '@furystack/shades-common-components'
import { XpenseApiService } from '@common/frontend-utils'
import { createSuggestion } from './create-suggestion'

export const xpenseCommandProvider: CommandProvider = async ({ term, injector }) => {
  if (!term || term.length < 2) {
    return []
  }

  const api = injector.getInstance(XpenseApiService)

  const accountList = await api.call({
    method: 'GET',
    action: '/accounts',
    query: {
      findOptions: {
        filter: { name: { $regex: `${term}` } },
        top: 3,
      },
    },
  })

  return accountList.entries.map((ac) =>
    createSuggestion({
      name: ac.name,
      icon: ac.icon,
      description: `Go to the Dashboard of the account '${ac.name}'`,
      score: 1,
      onSelected: () => {
        window.history.pushState('', '', `/xpense/${ac._id}`)
      },
    }),
  )
}
