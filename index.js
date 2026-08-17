import "dotenv/config";
import { createApp } from "./src/app.js";
import { createDatabase } from "./src/db.js";

const db = createDatabase();
await db.initialize();

export default createApp(db);
