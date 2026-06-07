const { getAppwriteConfig } = require("../../shared/config")

module.exports = async function episodeFunction(req, res) {
  const config = getAppwriteConfig()

  if (req?.method && req.method !== "GET") {
    return res.json({ error: "Method not allowed" }, 405)
  }

  return res.json({
    ok: true,
    function: "episode",
    message: "Episode function scaffold ready.",
    config: {
      endpoint: config.endpoint,
      projectId: config.projectId,
      episodeCollectionId: config.episodeCollectionId,
    },
  })
}
