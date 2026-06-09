// Test pahe.win link resolution — this replaced kwik.cx on AnimePahe
async function testKwik() {
    const COOKIE = `cf_clearance=1tYywnKo9XSy1dMQacI3vz4qCT7dicoinhbNISiYVzc-1780854320-1.2.1.1-KT0yWC3lpTRhuFD0GZirr8ZyP188zxfmrl3fFkdcAg7dJ1NMLHtsRD5kxwa3iSGZIPMeHH0IAdfu3SeEacxwQ600CQ1XTBF9l91cHVLwFsBZjBcGd8qM.41R5pOlcs5xyBMRdZQBz4asiiAW8kSCpHv_oyqfhBLM.ycZRDd_G0TUXwRlVIFtjINeyyAnbuXzpgNN6csjWZ6_Kh9.qSBtkg8fHXFjLwiwIdLLup6xR8t2oroObZtDjEPBDyIsHOigq1sLwzAKjXbNDvyf9eBaIooDnSfmQaE3vcwjfA42vRRrK1MAw5ax7lMQux4H7tJZS7UJNYMBiM3Wv1.WITECahBdW9cSgyXBHl.bAnCWjky.GUAAjEOkttwNhqfFpENudNuQEFRo.ImuAxRXQM6XS4OziTq1vPE2UuxpCrZicFM; SERVERID=pong`;

    // The links from the play page: pahe.win (new) instead of kwik.cx (old)
    const links = [
        "https://pahe.win/cvhun",  // 360p
        "https://pahe.win/LJmbA",  // 800p
    ];

    for (const link of links) {
        console.log(`\n=== Testing: ${link} ===`);
        try {
            // Step 1: GET the pahe.win page
            const r1 = await fetch(link, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
                    "Referer": "https://animepahe.pw/",
                    "Cookie": COOKIE,
                },
                redirect: "manual",
                signal: AbortSignal.timeout(12000),
            });
            console.log("Step 1 status:", r1.status, "| Location:", r1.headers.get("location") || "(none)");

            if (r1.status >= 300 && r1.status < 400) {
                // Direct redirect — Location IS the MP4
                console.log("✅ Direct redirect! MP4:", r1.headers.get("location"));
                continue;
            }

            const text1 = await r1.text();
            console.log("Body length:", text1.length);
            
            // Check if it has a form (old kwik method)
            if (text1.includes("<form") && text1.includes("_token")) {
                console.log("⚙️  Has form + _token (old kwik method)");
                const actionMatch = text1.match(/action="([^"]+)"/);
                const tokenMatch = text1.match(/name="_token"\s+value="([^"]+)"/);
                console.log("action:", actionMatch?.[1]);
                console.log("_token:", tokenMatch?.[1]?.substring(0, 20) + "...");

                if (actionMatch?.[1] && tokenMatch?.[1]) {
                    console.log("Attempting POST...");
                    const r2 = await fetch(actionMatch[1], {
                        method: "POST",
                        body: new URLSearchParams({ _token: tokenMatch[1] }),
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
                            "Referer": link,
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Cookie": COOKIE,
                        },
                        redirect: "manual",
                        signal: AbortSignal.timeout(12000),
                    });
                    console.log("POST status:", r2.status, "| Location:", r2.headers.get("location") || "(none)");
                    if (r2.headers.get("location")) {
                        console.log("✅ Got MP4 URL:", r2.headers.get("location"));
                    }
                }
            } else {
                // Show what we got
                console.log("Body snippet:", text1.substring(0, 500).replace(/\n/g, " "));
            }
        } catch (e) {
            console.log("❌ ERROR:", e.message);
        }
    }
}
testKwik();
