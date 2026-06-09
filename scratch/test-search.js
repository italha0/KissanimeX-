async function test() {
  const base = 'https://animepah.tq74198.workers.dev';
  
  console.log('=== Test 1: Search naruto ===');
  const s1 = await fetch(base + '/search/naruto');
  const j1 = await s1.json();
  console.log('Status:', s1.status, '| Results:', j1.results?.length ?? j1.error);
  console.log('First result:', JSON.stringify(j1.results?.[0], null, 2));

  console.log('\n=== Test 2: Search steins gate ===');
  const s2 = await fetch(base + '/search/steins%20gate');
  const j2 = await s2.json();
  console.log('Status:', s2.status, '| Results:', j2.results?.length ?? j2.error);
  if (j2.results?.[0]) {
    const first = j2.results[0];
    console.log('First:', first.title, '| ID:', first.id, '| Episodes:', first.episodes);
    
    console.log('\n=== Test 3: Get anime details ===');
    const s3 = await fetch(base + '/anime/' + first.id);
    const j3 = await s3.json();
    console.log('Status:', s3.status, '| Name:', j3.results?.name, '| Episodes:', j3.results?.episodes?.length ?? j3.error);
    if (j3.results?.episodes?.length > 0) {
      console.log('First 3 episodes:', j3.results.episodes.slice(0, 3));
      
      const epId = j3.results.episodes[0][1];
      console.log('\n=== Test 4: Get episode streams ===');
      console.log('Episode ID:', epId);
      const s4 = await fetch(base + '/episode/' + epId);
      const j4 = await s4.json();
      console.log('Status:', s4.status);
      console.log('Servers:', JSON.stringify(j4.results?.servers, null, 2));
    }
  }
}
test().catch(e => console.error('FATAL:', e.message, e.stack));
