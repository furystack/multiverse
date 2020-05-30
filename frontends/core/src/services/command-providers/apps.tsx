import { LocationService } from '@furystack/shades'
import { Injector } from '@furystack/inject'
import { CommandProvider } from '@furystack/shades-common-components'
import { serviceList } from '@common/models'
import { createSuggestion, distinctByName } from './create-suggestion'

export const createAppSuggestion = (s: {
  name: string
  description: string
  icon: string
  url: string
  score: number
}) =>
  createSuggestion({
    ...s,
    onSelected: (options: { injector: Injector }) => {
      window.history.pushState('', '', s.url)
      options.injector.getInstance(LocationService).updateState()
    },
  })

export const appCommandProvider: CommandProvider = async ({ term, injector }) => {
  if (!term) {
    return []
  }
  const currentUser = await injector.getCurrentUser()
  const currentServiceList = serviceList.filter((service) =>
    service.requiredRoles.every((role) => currentUser?.roles.includes(role)),
  )

  const fromNameBegins = currentServiceList
    .filter((s) => s.name.toLowerCase().startsWith(term.toLowerCase()))
    .map((s) => createAppSuggestion({ ...s, score: 1 }))

  const fromNameContains = currentServiceList
    .filter((s) => s.name.toLowerCase().includes(term.toLowerCase()))
    .map((s) =>
      createAppSuggestion({
        ...s,
        score: 2,
      }),
    )

  const fromDescriptionContains = currentServiceList
    .filter((s) => s.description.toLowerCase().includes(term.toLowerCase()))
    .map((s) =>
      createAppSuggestion({
        ...s,
        score: 3,
      }),
    )

  return distinctByName(...fromNameBegins, ...fromNameContains, ...fromDescriptionContains)
}
