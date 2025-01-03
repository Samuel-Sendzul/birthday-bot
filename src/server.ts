import { serve } from "@hono/node-server";
import app from "./app";

const PORT = 3000;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Birthday Bot 🚀: PORT ${info.port}`);
  }
);
