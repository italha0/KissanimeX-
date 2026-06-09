const { execSync } = require("child_process");

function runCommand(cmd, ignoreError = false) {
  console.log(`Running CLI: ${cmd}`);
  try {
    const stdout = execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    return stdout;
  } catch (err) {
    if (ignoreError) {
      console.warn(`[Command Ignored Warning]: ${err.message}`);
      return "";
    }
    console.error(`[Command Failed Error]: ${err.message}`);
    if (err.stderr) console.error(err.stderr);
    throw err;
  }
}

function waitAttributeAvailable(colId, key) {
  console.log(`Waiting for attribute "${key}" in "${colId}" to be available...`);
  for (let i = 0; i < 30; i++) {
    try {
      const output = runCommand(`appwrite databases get-attribute --database-id animepahdb --collection-id ${colId} --key ${key}`, true);
      // Appwrite CLI get-attribute returns text with "status    available"
      if (output.toLowerCase().includes("status") && output.toLowerCase().includes("available")) {
        console.log(`Attribute "${key}" is available.`);
        return true;
      }
    } catch (e) {}
    // Sleep 1 second using JS-based busy wait or OS sleep
    const start = Date.now();
    while (Date.now() - start < 1000) {}
  }
  throw new Error(`Attribute "${key}" in "${colId}" did not become available.`);
}

async function run() {
  console.log("Recreating Appwrite collections anime_discovery and episodes_discovery via CLI...");

  // 1. Delete existing collections to ensure fresh creation
  console.log("\nDeleting existing collections if any...");
  runCommand("appwrite databases delete-collection --database-id animepahdb --collection-id anime_discovery", true);
  runCommand("appwrite databases delete-collection --database-id animepahdb --collection-id episodes_discovery", true);

  // 2. Create anime_discovery collection
  console.log("\nCreating collection anime_discovery...");
  runCommand(
    `appwrite databases create-collection --database-id animepahdb --collection-id anime_discovery --name "Anime Discovery" --permissions "read(\\"any\\")" "create(\\"any\\")" "update(\\"any\\")" "delete(\\"any\\")"`
  );

  // 3. Create attributes for anime_discovery
  const animeAttrs = [
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id anime_discovery --key anilistId --size 255 --required true`, key: "anilistId" },
    { cmd: `appwrite databases create-integer-attribute --database-id animepahdb --collection-id anime_discovery --key malId --required false`, key: "malId" },
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id anime_discovery --key titleEnglish --size 1000 --required false`, key: "titleEnglish" },
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id anime_discovery --key titleRomaji --size 1000 --required false`, key: "titleRomaji" },
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id anime_discovery --key poster --size 2000 --required false`, key: "poster" },
    { cmd: `appwrite databases create-float-attribute --database-id animepahdb --collection-id anime_discovery --key rating --required false`, key: "rating" },
    { cmd: `appwrite databases create-integer-attribute --database-id animepahdb --collection-id anime_discovery --key episodeCount --required false`, key: "episodeCount" },
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id anime_discovery --key status --size 255 --required false`, key: "status" },
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id anime_discovery --key genres --size 255 --required false --array true`, key: "genres" },
    { cmd: `appwrite databases create-longtext-attribute --database-id animepahdb --collection-id anime_discovery --key synopsis --required false`, key: "synopsis" },
    { cmd: `appwrite databases create-datetime-attribute --database-id animepahdb --collection-id anime_discovery --key cachedAt --required false`, key: "cachedAt" }
  ];

  for (const attr of animeAttrs) {
    runCommand(attr.cmd);
    waitAttributeAvailable("anime_discovery", attr.key);
  }

  // 4. Create episodes_discovery collection
  console.log("\nCreating collection episodes_discovery...");
  runCommand(
    `appwrite databases create-collection --database-id animepahdb --collection-id episodes_discovery --name "Episodes Discovery" --permissions "read(\\"any\\")" "create(\\"any\\")" "update(\\"any\\")" "delete(\\"any\\")"`
  );

  // 5. Create attributes for episodes_discovery
  const epAttrs = [
    { cmd: `appwrite databases create-integer-attribute --database-id animepahdb --collection-id episodes_discovery --key malId --required true`, key: "malId" },
    { cmd: `appwrite databases create-integer-attribute --database-id animepahdb --collection-id episodes_discovery --key episodeNumber --required true`, key: "episodeNumber" },
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id episodes_discovery --key title --size 1000 --required false`, key: "title" },
    { cmd: `appwrite databases create-string-attribute --database-id animepahdb --collection-id episodes_discovery --key airdate --size 255 --required false`, key: "airdate" },
    { cmd: `appwrite databases create-boolean-attribute --database-id animepahdb --collection-id episodes_discovery --key filler --required false`, key: "filler" }
  ];

  for (const attr of epAttrs) {
    runCommand(attr.cmd);
    waitAttributeAvailable("episodes_discovery", attr.key);
  }

  // 6. Create indexes for episodes_discovery
  console.log("\nCreating index on episodes_discovery...");
  runCommand(
    `appwrite databases create-index --database-id animepahdb --collection-id episodes_discovery --key idx_malId --type key --attributes malId --orders ASC`
  );

  console.log("\nAppwrite CLI schema migration complete!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
