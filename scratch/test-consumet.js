async function test() {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36';
  
  // Test Consumet public API
  const endpoints = [
    'https://api.consumet.org/anime/gogoanime/naruto',
    'https://consumet-api.onrender.com/anime/gogoanime/naruto',
    'https://api.consumet.org/anime/zoro/naruto',
  ];
  
  for (const url of endpoints) {
    try {
      console.log('Testing:', url);
      const r = await fetch(url, { headers: { 'User-Agent': ua }, signal: AbortSignal.timeout(8000) });
      const text = await r.text();
      console.log('  Status:', r.status, '| Length:', text.length);
      if (r.ok) {
        const j = JSON.parse(text);
        console.log('  Results:', j.results?.length, '| First:', j.results?.[0]?.id);
      } else {
        console.log('  Body:', text.substring(0, 200));
      }
    } catch(e) {
      console.log('  ERROR:', e.message);
    }
    console.log('');
  }
}
test().catch(e => console.error('FATAL:', e.message));
