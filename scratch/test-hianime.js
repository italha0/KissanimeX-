async function test() {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36';
  
  const tests = [
    // HiAnime / AniWatch
    { name: 'HiAnime search', url: 'https://hianime.to/search?keyword=naruto' },
    { name: 'AniWatch.to search', url: 'https://aniwatch.to/search?keyword=naruto' },
    // Check if any anime provider APIs are alive
    { name: 'AniAPI', url: 'https://aniapi.com/v1/anime?title=naruto' },
    { name: 'AniList (control test)', url: 'https://graphql.anilist.co' },
  ];
  
  for (const test of tests) {
    try {
      console.log('Testing:', test.name);
      const opts = { headers: { 'User-Agent': ua }, signal: AbortSignal.timeout(8000) };
      if (test.name === 'AniList (control test)') {
        opts.method = 'POST';
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify({ query: '{ Page(perPage:1) { media(search:"naruto",type:ANIME) { id title { romaji } } } }' });
      }
      const r = await fetch(test.url, opts);
      const text = await r.text();
      console.log('  Status:', r.status, '| Length:', text.length);
      
      if (text.includes('Just a moment') || text.includes('cf-browser-verification')) {
        console.log('  => CLOUDFLARE BLOCKED');
      } else if (text.includes('window.location.replace')) {
        console.log('  => JS REDIRECT CHALLENGE');
      } else if (r.status === 200) {
        console.log('  => ACCESSIBLE! Snippet:', text.substring(0, 200).replace(/\n/g, ' '));
      } else {
        console.log('  => Response:', text.substring(0, 200).replace(/\n/g, ' '));
      }
    } catch(e) {
      console.log('  ERROR:', e.message);
    }
    console.log('');
  }
}
test().catch(e => console.error('FATAL:', e.message));
