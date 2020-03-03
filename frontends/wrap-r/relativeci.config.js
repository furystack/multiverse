// relativeci.config.js
module.exports = {
  // Allow the agent to pick up the current commit message
  includeCommitMessage: true,
  webpack: {
    // Set relative path to Webpack stats JSON file
    stats: './webpack-stats.json',
  },
}
