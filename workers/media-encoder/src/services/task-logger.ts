import { Injectable } from '@furystack/inject'
import type { LeveledLogEntry } from '@furystack/logging'
import { AbstractLogger } from '@furystack/logging'

@Injectable({ lifetime: 'singleton' })
export class TaskLogger extends AbstractLogger {
  private _cache = new Set<LeveledLogEntry<any>>()

  public getAllEntries() {
    return Array.from(this._cache)
  }

  public flush() {
    this._cache.clear()
  }

  public async addEntry<T>(entry: LeveledLogEntry<T>) {
    this._cache.add(entry)
  }
}
