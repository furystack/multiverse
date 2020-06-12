export const isMovieFile = (path: string) => {
  const pathToLower = path.toLowerCase()
  if (pathToLower.endsWith('.mkv') || pathToLower.endsWith('.webm')) {
    return true
  }
  return false
}
