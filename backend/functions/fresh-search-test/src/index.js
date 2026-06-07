export default async function handler({ req, res }) {
  const target = 'https://api.jikan.moe/v4/anime?q=naruto&limit=5'
  try {
    const started = Date.now()
    const response = await fetch(target)
    const text = await response.text()
    res.statusCode = 200
    res.headers = { 'content-type': 'application/json' }
    res.body = JSON.stringify({ ok: true, status: response.status, elapsed: Date.now() - started, text: text.slice(0, 300) })
  } catch (error) {
    res.statusCode = 500
    res.headers = { 'content-type': 'application/json' }
    res.body = JSON.stringify({ ok: false, message: error.message })
  }
}
