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

async function run() {
  console.log("Checking Appwrite database using API...");
  console.log("Endpoint:", endpoint);
  console.log("Project:", projectId);
  console.log("Database:", databaseId);
  
  if (!apiKey) {
    console.error("APPWRITE_API_KEY is not defined in environment");
    return;
  }

  try {
    const url = `${endpoint}/databases/${databaseId}/collections`;
    const res = await fetch(url, {
      headers: {
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
        "Content-Type": "application/json"
      }
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch collections: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error("Response:", text);
      return;
    }
    
    const data = await res.json();
    console.log(`Found ${data.total} collections:`);
    for (const col of data.collections) {
      console.log(`- ID: ${col.$id}, Name: ${col.name}`);
      // Let's get attributes for each
      const attrUrl = `${endpoint}/databases/${databaseId}/collections/${col.$id}/attributes`;
      const attrRes = await fetch(attrUrl, {
        headers: {
          "X-Appwrite-Project": projectId,
          "X-Appwrite-Key": apiKey
        }
      });
      if (attrRes.ok) {
        const attrData = await attrRes.json();
        console.log("  Attributes:");
        for (const attr of attrData.attributes) {
          console.log(`    * ${attr.key} (${attr.type})`);
        }
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
