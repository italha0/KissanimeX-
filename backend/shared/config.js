function readEnv(name, fallback = "") {
  const value = process.env[name]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback
}

function getAppwriteConfig() {
  return {
    endpoint: readEnv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"),
    projectId: readEnv("APPWRITE_PROJECT_ID", "6a251baf00130dde2cdf"),
    apiKey: readEnv("APPWRITE_API_KEY"),
    databaseId: readEnv("APPWRITE_DATABASE_ID"),
    animeCollectionId: readEnv("APPWRITE_ANIME_COLLECTION_ID", "anime"),
    seriesCollectionId: readEnv("APPWRITE_SERIES_COLLECTION_ID", "series"),
    episodeCollectionId: readEnv("APPWRITE_EPISODE_COLLECTION_ID", "episodes"),
  }
}

module.exports = {
  getAppwriteConfig,
}
