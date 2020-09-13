import { Injectable } from '@furystack/inject'
import { AbstractLogger, LeveledLogEntry } from '@furystack/logging'

@Injectable({ lifetime: 'singleton' })
export class TaskLogger extends AbstractLogger {
  private _cache = new Set<LeveledLogEntry<any>>()

  public getAllEntries() {
    return [...this._cache.entries()]
  }

  public flush() {
    this._cache.clear()
  }

  public async addEntry<T>(entry: LeveledLogEntry<T>) {
    this._cache.add(entry)
  }
}
