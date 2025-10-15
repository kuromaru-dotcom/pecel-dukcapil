import { createServer } from "http";
import { getApp } from "./app";
import { setupVite, log } from "./vite";

(async () => {
  const app = await getApp();
  const server = createServer(app);

  // Only setup vite in development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
