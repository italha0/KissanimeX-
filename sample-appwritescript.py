from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.account import Account
import os
from dotenv import load_dotenv

load_dotenv()

client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
client.set_key(os.getenv("APPWRITE_API_KEY"))

databases = Databases(client)

DB_ID = os.getenv("APPWRITE_DB_ID", "logicprobe-db")

# Create database
databases.create(database_id=DB_ID, name="LogicProbe DB")

# Sessions collection
databases.create_collection(
    database_id=DB_ID,
    collection_id="sessions",
    name="Sessions"
)
databases.create_string_attribute(DB_ID, "sessions", "user_id", 255, required=True)
databases.create_string_attribute(DB_ID, "sessions", "app_type", 100, required=False)
databases.create_string_attribute(DB_ID, "sessions", "app_model", 10000, required=False)  # JSON string
databases.create_string_attribute(DB_ID, "sessions", "status", 20, required=True, default="active")
databases.create_datetime_attribute(DB_ID, "sessions", "created_at", required=False)

# Findings collection
databases.create_collection(
    database_id=DB_ID,
    collection_id="findings",
    name="Findings"
)
databases.create_string_attribute(DB_ID, "findings", "session_id", 255, required=True)
databases.create_string_attribute(DB_ID, "findings", "probe_name", 500, required=True)
databases.create_string_attribute(DB_ID, "findings", "vuln_class", 100, required=True)
databases.create_string_attribute(DB_ID, "findings", "status", 20, required=True, default="pending")
databases.create_string_attribute(DB_ID, "findings", "evidence", 10000, required=False)

# Reports collection
databases.create_collection(
    database_id=DB_ID,
    collection_id="reports",
    name="Reports"
)
databases.create_string_attribute(DB_ID, "reports", "session_id", 255, required=True)
databases.create_string_attribute(DB_ID, "reports", "title", 500, required=True)
databases.create_string_attribute(DB_ID, "reports", "content", 50000, required=False)
databases.create_string_attribute(DB_ID, "reports", "severity", 20, required=False)

print("Appwrite DB schema created successfully.")
```
