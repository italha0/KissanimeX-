async function test() {
  const mirrors = ['https://gogoanime3.cc', 'https://gogoanime.cl', 'https://anitaku.pe', 'https://gogoanime.hu'];
  for (const base of mirrors) {
    try {
      const r = await fetch(base + '/search.html?keyword=naruto&page=1', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36' }
      });
      const text = await r.text();
      console.log(base, '-> Status:', r.status, '| Length:', text.length);
      if (text.includes('Just a moment')) {
        console.log('  => CF BLOCKED');
      } else if (text.includes('"items"') || text.includes('class="items"') || text.includes("class='items'")) {
        console.log('  => HAS items class - looks good!');
        // Show a snippet to understand structure
        const idx = text.indexOf('items');
        console.log('  => Snippet:', text.substring(idx - 20, idx + 200).replace(/\n/g, ' '));
      } else {
        const bodyIdx = text.indexOf('<body');
        console.log('  => Unknown structure. Body snippet:', text.substring(bodyIdx, bodyIdx + 400).replace(/\n/g, ' '));
      }
    } catch(e) {
      console.log(base, '-> ERROR:', e.message);
    }
  }
}
test();
