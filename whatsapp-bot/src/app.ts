import { Hono } from "hono";
import {
  handleWhatsappCallback,
  handleWhatsappWebhookVerification,
} from "./handlers/whatsapp-callback";

const PREFIX_V1 = "/api/v1";

const app = new Hono();

app.get(PREFIX_V1, (c) => c.text("ok"));

app.get(`${PREFIX_V1}/callbacks/whatsapp`, handleWhatsappWebhookVerification);
app.post(`${PREFIX_V1}/callbacks/whatsapp`, handleWhatsappCallback);

export default app;
