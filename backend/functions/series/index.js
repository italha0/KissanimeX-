const { getAppwriteConfig } = require("../../shared/config")

module.exports = async function seriesFunction(req, res) {
  const config = getAppwriteConfig()

  if (req?.method && req.method !== "GET") {
    return res.json({ error: "Method not allowed" }, 405)
  }

  return res.json({
    ok: true,
    function: "series",
    message: "Series function scaffold ready.",
    config: {
      endpoint: config.endpoint,
      projectId: config.projectId,
      seriesCollectionId: config.seriesCollectionId,
    },
  })
}
