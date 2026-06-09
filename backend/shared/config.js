function readEnv(name, fallback = "") {
  const value = process.env[name]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback
}

function getAppwriteConfig() {
  return {
    endpoint: readEnv("APPWRITE_ENDPOINT"),
    projectId: readEnv("APPWRITE_PROJECT_ID"),
    apiKey: readEnv("APPWRITE_API_KEY"),
    databaseId: readEnv("APPWRITE_DATABASE_ID"),
    animeCollectionId: readEnv("APPWRITE_ANIME_COLLECTION_ID"),
    seriesCollectionId: readEnv("APPWRITE_SERIES_COLLECTION_ID"),
    episodeCollectionId: readEnv("APPWRITE_EPISODE_COLLECTION_ID"),
  }
}

module.exports = {
  getAppwriteConfig,
}
