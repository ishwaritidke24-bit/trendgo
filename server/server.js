import { createServer } from "node:http";

import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();
const server = createServer(app);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${env.port} is already in use by another running server process.`);
    console.error(`   Tip: Close existing terminals or run: Stop-Process -Name node -Force`);
  } else {
    console.error("❌ Server error:", error);
  }
  process.exit(1);
});

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
