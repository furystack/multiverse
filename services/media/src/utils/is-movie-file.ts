export const isMovieFile = (path: string) => {
  const pathToLower = path.toLowerCase()
  if (pathToLower.endsWith('.mkv')) {
    return true
  }
  return false
}
