import { Context } from "hono";
import crypto from "crypto";
import { WhatsappClient } from "../whatsapp/client";

const whatsapp = new WhatsappClient(
  process.env.WHATSAPP_ACCESS_TOKEN,
  process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
);

export async function handleWhatsappWebhookVerification(c: Context) {
  const challenge = c.req.query("hub.challenge");
  const verifyToken = c.req.query("hub.verify_token");

  if (verifyToken === process.env.WHATSAPP_VERIFICATION_TOKEN) {
    console.info("successfully verified webhook url");
    return c.text(challenge, 200);
  } else {
    console.warn(
      `unauthenticated webhook subscription attempt. verificationToken ${verifyToken}`
    );
    return c.text("UNAUTHORIZED", 401);
  }
}

function verifiyWebhookPayload(
  payload: string,
  signatureHeader: string
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  console.log(appSecret);
  if (!appSecret) {
    console.error("whatsapp app secret is not defined");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("hex");

  const receivedSignature = signatureHeader.replace("sha256=", "");

  return expectedSignature === receivedSignature;
}

export async function handleWhatsappCallback(c: Context) {
  const requestBody = await c.req.json();

  const isWebhookPayloadVerified = verifiyWebhookPayload(
    JSON.stringify(requestBody),
    c.req.header("X-Hub-Signature-256")
  );
  if (!isWebhookPayloadVerified) {
    return c.text("ok", 200);
  }

  const entry = requestBody.entry;
  if (entry) {
    const changes = entry[0].changes;
    for (const change of changes) {
      if (
        change.value.metadata.phone_number_id !==
        process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
      ) {
        continue;
      }
      // Recieved new message
      if (change.field === "messages" && "messages" in change.value) {
        const messages = change.value.messages;
        for (const message of messages) {
          console.debug(
            `received '${message.text.body}' from '${message.from}' with id '${message.id}'`
          );
          await whatsapp.sendTextMessage("27826229622", {
            body: "hi!",
          });
        }
      }

      // Received status updates
      if (change.field === "messages" && "statuses" in change.value) {
        const statuses = change.value.statuses;
        for (const status of statuses) {
          console.debug(
            `message with id '${status.id}' status updated to '${status.status}' at time ${status.timestamp} - conversation id '${status.conversation.id}' expires '${status.conversation.expiration_timestamp}'`
          );
        }
      }
    }
  }

  return c.text("ok", 200);
}
