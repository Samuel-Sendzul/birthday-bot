import { serve } from "@hono/node-server";
import app from "./app";
import { sendBirthdayReminders } from "./scheduler";

const PORT = 3000;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  async (info) => {
    console.log(`Birthday Bot 🚀: PORT ${info.port}`);
    // await sendBirthdayReminders();
  }
);
