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
const episodesColId = process.env.EPISODES_COLLECTION_ID || "episodes_discovery";

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

async function waitAttributeAvailable(colId, key) {
  console.log(`Waiting for attribute ${key} in ${colId} to be available...`);
  const url = `${endpoint}/databases/${databaseId}/collections/${colId}/attributes/${key}`;
  for (let i = 0; i < 30; i++) {
    const res = await appwriteFetch(url);
    if (res.ok && res.data && res.data.status === "available") {
      console.log(`Attribute ${key} is available.`);
      return true;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.error(`Attribute ${key} did not become available.`);
  return false;
}

async function ensureCollection(colId, name) {
  console.log(`Checking if collection ${colId} exists...`);
  const url = `${endpoint}/databases/${databaseId}/collections/${colId}`;
  const res = await appwriteFetch(url);
  if (res.ok) {
    console.log(`Collection ${colId} already exists.`);
    return true;
  }
  
  console.log(`Creating collection ${colId}...`);
  const createUrl = `${endpoint}/databases/${databaseId}/collections`;
  const createRes = await appwriteFetch(createUrl, {
    method: "POST",
    body: JSON.stringify({
      collectionId: colId,
      name: name,
      permissions: [
        "read(\"any\")",
        "create(\"any\")",
        "update(\"any\")",
        "delete(\"any\")"
      ]
    })
  });
  
  if (!createRes.ok) {
    console.error(`Failed to create collection ${colId}:`, createRes.text);
    return false;
  }
  console.log(`Collection ${colId} created.`);
  return true;
}

async function ensureAttribute(colId, attribute) {
  const { key, type, size, required, array } = attribute;
  console.log(`Checking attribute ${key} in ${colId}...`);
  const url = `${endpoint}/databases/${databaseId}/collections/${colId}/attributes/${key}`;
  const res = await appwriteFetch(url);
  if (res.ok) {
    console.log(`Attribute ${key} already exists.`);
    return true;
  }
  
  console.log(`Creating attribute ${key} (${type}) in ${colId}...`);
  const createUrl = `${endpoint}/databases/${databaseId}/collections/${colId}/attributes/${type}`;
  const body = { key, required: !!required };
  if (type === "string") {
    body.size = size || 255;
  }
  if (array) {
    body.array = true;
  }
  
  const createRes = await appwriteFetch(createUrl, {
    method: "POST",
    body: JSON.stringify(body)
  });
  
  if (!createRes.ok) {
    console.error(`Failed to create attribute ${key} in ${colId}:`, createRes.text);
    return false;
  }
  
  await waitAttributeAvailable(colId, key);
  return true;
}

async function ensureIndex(colId, indexKey, type, attributes) {
  console.log(`Checking index ${indexKey} in ${colId}...`);
  const url = `${endpoint}/databases/${databaseId}/collections/${colId}/indexes/${indexKey}`;
  const res = await appwriteFetch(url);
  if (res.ok) {
    console.log(`Index ${indexKey} already exists.`);
    return true;
  }
  
  console.log(`Creating index ${indexKey} in ${colId}...`);
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
  
  // Create anime collection
  const animeOk = await ensureCollection(animeColId, "Anime Discovery");
  if (animeOk) {
    const animeAttrs = [
      { key: "anilistId", type: "string", size: 255, required: true },
      { key: "malId", type: "integer", required: false },
      { key: "titleEnglish", type: "string", size: 1000, required: false },
      { key: "titleRomaji", type: "string", size: 1000, required: false },
      { key: "poster", type: "string", size: 2000, required: false },
      { key: "rating", type: "float", required: false },
      { key: "episodeCount", type: "integer", required: false },
      { key: "status", type: "string", size: 255, required: false },
      { key: "genres", type: "string", size: 255, required: false, array: true },
      { key: "synopsis", type: "string", size: 65535, required: false },
      { key: "cachedAt", type: "datetime", required: false }
    ];
    for (const attr of animeAttrs) {
      await ensureAttribute(animeColId, attr);
    }
  }
  
  // Create episodes collection
  const epsOk = await ensureCollection(episodesColId, "Episodes Discovery");
  if (epsOk) {
    const epAttrs = [
      { key: "malId", type: "integer", required: true },
      { key: "episodeNumber", type: "integer", required: true },
      { key: "title", type: "string", size: 1000, required: false },
      { key: "airdate", type: "string", size: 255, required: false },
      { key: "filler", type: "boolean", required: false }
    ];
    for (const attr of epAttrs) {
      await ensureAttribute(episodesColId, attr);
    }
    
    // Index on malId for querying
    await ensureIndex(episodesColId, "idx_malId", "key", ["malId"]);
  }
  
  console.log("DB Setup script complete!");
}

run();
