// Full end-to-end test of the deployed AnimePahe Worker
// Tests: search → episodes → download link resolution
const WORKER = "https://animepah.tq74198.workers.dev";

async function test() {
    // Gate 1: Search
    console.log("=== Gate 1: /search/steins gate ===");
    const s1 = await fetch(`${WORKER}/search/steins%20gate`, { signal: AbortSignal.timeout(20000) });
    const j1 = await s1.json();
    console.log("Status:", s1.status, "| Worker status:", j1.status);
    if (!j1.status) { console.log("❌ Error:", j1.error); return; }
    console.log("✅ Results:", j1.results.length);
    console.log("First:", j1.results[0]?.title, "| session:", j1.results[0]?.session);

    const animeSession = j1.results[0]?.session;
    if (!animeSession) return;

    // Gate 2: Episodes
    console.log("\n=== Gate 2: /anime/" + animeSession + " ===");
    const s2 = await fetch(`${WORKER}/anime/${animeSession}`, { signal: AbortSignal.timeout(30000) });
    const j2 = await s2.json();
    console.log("Status:", s2.status, "| Worker status:", j2.status);
    if (!j2.status) { console.log("❌ Error:", j2.error); return; }
    console.log("✅ Total:", j2.total, "| Episodes returned:", j2.episodes?.length);
    console.log("Ep 1:", JSON.stringify(j2.episodes?.[0]));

    const epSession = j2.episodes?.[0]?.session;
    if (!epSession) return;

    // Gate 3: Download links
    console.log("\n=== Gate 3: /download/" + animeSession.substring(0,8) + ".../" + epSession.substring(0,8) + "... ===");
    const s3 = await fetch(`${WORKER}/download/${animeSession}/${epSession}`, { signal: AbortSignal.timeout(60000) });
    const j3 = await s3.json();
    console.log("Status:", s3.status, "| Worker status:", j3.status);
    if (!j3.status) { console.log("❌ Error:", j3.error); return; }
    console.log("✅ Downloads:");
    console.log(JSON.stringify(j3.downloads, null, 2));
    console.log("Raw links:", j3.raw);
}

test().catch(e => console.error("FATAL:", e.message));
