/**
 *
 * @param length The string length
 * @returns A random string
 */
export const getRandomString = (length = 8) =>
  Math.random()
    .toString(36)
    .substring(2, length + 2)
