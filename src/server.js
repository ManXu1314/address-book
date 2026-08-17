import "dotenv/config";
import { createApp } from "./app.js";
import { createDatabase } from "./db.js";

const port = Number(process.env.PORT) || 3000;
const db = createDatabase();

await db.initialize();
createApp(db).listen(port, "0.0.0.0", () => {
  console.log(`Address book is running on http://localhost:${port}`);
});
