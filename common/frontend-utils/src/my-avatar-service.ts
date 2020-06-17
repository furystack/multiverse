import { Injectable } from '@furystack/inject'
import { PathHelper, ObservableValue } from '@furystack/utils'
import { sites } from '@common/config'

@Injectable({ lifetime: 'singleton' })
export class MyAvatarService {
  public lastUpdate = new ObservableValue(new Date())
  public async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    await fetch(PathHelper.joinPaths(sites.services.auth.externalPath, 'auth', 'avatar'), {
      method: 'POST',
      body: formData as any,
      credentials: 'include',
    })
    this.lastUpdate.setValue(new Date())
  }
}
