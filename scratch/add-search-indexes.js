const fs = require("fs");
const path = require("path");

// Load .env
try {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (parts) {
        const key = parts[1];
        let val = parts[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.error("Error loading env:", e);
}

const endpoint = process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.APPWRITE_PROJECT_ID || "6a251baf00130dde2cdf";
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || "animepahdb";
const animeColId = process.env.ANIME_COLLECTION_ID || "anime_discovery";

const headers = {
  "X-Appwrite-Project": projectId,
  "X-Appwrite-Key": apiKey,
  "Content-Type": "application/json"
};

async function appwriteFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {}
  return { ok: res.ok, status: res.status, statusText: res.statusText, data: json, text };
}

async function ensureIndex(colId, indexKey, type, attributes) {
  console.log(`Checking index ${indexKey} in ${colId}...`);
  const url = `${endpoint}/databases/${databaseId}/collections/${colId}/indexes/${indexKey}`;
  const res = await appwriteFetch(url);
  if (res.ok) {
    console.log(`Index ${indexKey} already exists.`);
    return true;
  }
  
  console.log(`Creating index ${indexKey} (${type}) in ${colId}...`);
  const createUrl = `${endpoint}/databases/${databaseId}/collections/${colId}/indexes`;
  const createRes = await appwriteFetch(createUrl, {
    method: "POST",
    body: JSON.stringify({
      key: indexKey,
      type: type,
      attributes: attributes,
      orders: attributes.map(() => "ASC")
    })
  });
  
  if (!createRes.ok) {
    console.error(`Failed to create index ${indexKey} in ${colId}:`, createRes.text);
    return false;
  }
  console.log(`Index ${indexKey} created.`);
  return true;
}

async function run() {
  if (!apiKey) {
    console.error("APPWRITE_API_KEY is missing in env");
    return;
  }
  
  await ensureIndex(animeColId, "idx_titleEnglish", "fulltext", ["titleEnglish"]);
  await ensureIndex(animeColId, "idx_titleRomaji", "fulltext", ["titleRomaji"]);
  console.log("Indexes check complete!");
}

run();
