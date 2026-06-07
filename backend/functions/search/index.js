const { getAppwriteConfig } = require("../../shared/config")

module.exports = async function searchFunction(req, res) {
  const config = getAppwriteConfig()

  if (req?.method && req.method !== "GET") {
    return res.json({ error: "Method not allowed" }, 405)
  }

  return res.json({
    ok: true,
    function: "search",
    message: "Search function scaffold ready.",
    config: {
      endpoint: config.endpoint,
      projectId: config.projectId,
      animeCollectionId: config.animeCollectionId,
    },
  })
}
