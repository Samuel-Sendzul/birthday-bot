import { Context } from "hono";
import crypto from "crypto";
import { ConverationHandler } from "../domain/conversation-handler";

const conversationHandler = new ConverationHandler();

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

function handleNewTextMessage() {}

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
          if ("text" in message) {
            const userState = conversationHandler.getUserState(message.from);
            if (!userState) {
              const response =
                await conversationHandler.whatsapp.sendInteractiveReplyButtonsMessage(
                  "27826229622",
                  "Birthday Bot helps you never forget to send a message to your loved ones, friends, or colleagues on their birthday!\n\n" +
                    "Set up a new birthday reminder to receive a notification on their special day, complete with a contact button for quick and easy messaging!",
                  [{ id: "new-birthday", title: "New Birthday" }],
                  "Welcome to Birthday Bot 🥳",
                  "Never forget to send a birthday message again!"
                );
              console.debug(`sent interactive message with id '${response}'`);
              continue;
            }
            conversationHandler.handleNewBirthdayConversationMessage(
              message.from,
              message.text.body
            );
          }
          if ("interactive" in message) {
            if (message.interactive.type === "button_reply") {
              console.debug(
                `received button reply with id '${message.interactive.button_reply.id}' and title '${message.interactive.button_reply.title}'`
              );
              conversationHandler.handleNewBirthdayConversationMessage(
                message.from,
                message.interactive.button_reply.title
              );
            }
          }
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
