async function test() {
  // Test if we can follow the JS redirect manually
  const base = 'https://gogoanime3.cc';
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36';
  
  console.log('Step 1: Initial request...');
  const r1 = await fetch(base + '/search.html?keyword=naruto&page=1', {
    headers: { 'User-Agent': ua }
  });
  const text1 = await r1.text();
  console.log('Status:', r1.status, '| Length:', text1.length);
  
  // Check if it's a JS redirect
  if (text1.includes('window.location.replace')) {
    console.log('Got JS redirect challenge!');
    // Extract the URL from: window.location.replace('URL')
    const match = text1.match(/window\.location\.replace\(['"]([^'"]+)['"]\)/);
    if (match) {
      const redirectUrl = match[1];
      console.log('Redirect URL:', redirectUrl.substring(0, 100) + '...');
      
      console.log('\nStep 2: Following redirect...');
      const r2 = await fetch(redirectUrl, {
        headers: { 'User-Agent': ua }
      });
      const text2 = await r2.text();
      console.log('Status:', r2.status, '| Length:', text2.length);
      
      if (text2.includes('window.location.replace')) {
        console.log('Still getting JS redirect!');
        console.log(text2.substring(0, 500));
      } else if (text2.includes('class="items"') || text2.includes("class='items'")) {
        console.log('SUCCESS - Got real search results page!');
        const idx = text2.indexOf('items');
        console.log('Snippet:', text2.substring(idx - 20, idx + 300).replace(/\n/g, ' '));
      } else {
        console.log('Unknown response body snippet:', text2.substring(0, 500).replace(/\n/g, ' '));
      }
    } else {
      console.log('Could not extract redirect URL from:', text1);
    }
  } else {
    console.log('No JS redirect - direct content!');
    console.log(text1.substring(0, 500));
  }
}
test().catch(e => console.error('FATAL:', e.message, e.stack));
