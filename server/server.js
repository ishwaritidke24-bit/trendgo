import { createServer } from "node:http";

import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();
const server = createServer(app);

async function start() {
  await connectDatabase();

  server.listen(env.port, () => {
    console.log(`TrendGo API listening on http://localhost:${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

start().catch((error) => {
  console.error("Unable to start TrendGo API", error);
  process.exit(1);
});
