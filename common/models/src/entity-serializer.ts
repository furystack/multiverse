export const serialize = <T>(entity: T): string => encodeURIComponent(JSON.stringify(entity))

export const deserialize = <T>(entity: string): T => JSON.parse(decodeURIComponent(entity))
