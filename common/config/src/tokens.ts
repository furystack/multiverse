export const tokens = {
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'notProvided',
  githubClientId: process.env.GITHUB_CLIENT_ID || 'notProvided',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  omdbApiKey: process.env.OMDB_API_KEY || 'notProvided',
  rapidApiKey: process.env.RAPID_API_KEY || 'notProvided',
  rapidApiHost: process.env.RAPID_API_HOST || 'notProvided',
  slackLogger: process.env.SLACK_LOGGER_URL,
}
