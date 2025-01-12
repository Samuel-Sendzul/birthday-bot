import { Context } from "hono";
import crypto from "crypto";
import { ConverationHandler } from "../domain/conversation-handler";

const conversationHandler = new ConverationHandler();

export async function handleWhatsappWebhookVerification(c: Context) {
  const challenge = c.req.query("hub.challenge");
  const verifyToken = c.req.query("hub.verify_token");

  if (verifyToken === process.env.WHATSAPP_VERIFICATION_TOKEN) {
    console.info(
      `[${handleWhatsappWebhookVerification.name}] successfully verified webhook url`
    );
    return c.text(challenge, 200);
  } else {
    console.warn(
      `[${handleWhatsappWebhookVerification.name}] unauthenticated webhook subscription attempt. verificationToken ${verifyToken}`
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

async function handleNewMessage(change: any): Promise<void> {
  if (change.field === "messages" && "messages" in change.value) {
    const messages = change.value.messages;
    for (const message of messages) {
      if ("text" in message) {
        const userState = conversationHandler.getUserState(message.from);
        if (!userState) {
          try {
            const response = await conversationHandler.sendMainMenu(
              message.from
            );
            console.debug(
              `[${handleNewMessage.name}] sent interactive message with id '${response}'`
            );
          } catch (error) {
            console.error(
              `[${handleNewMessage.name}] failed to send menu message with error ${error}}`
            );
          }
          continue;
        }
        await conversationHandler.handleNewBirthdayConversationMessage(
          message.from,
          message.text.body
        );

        await conversationHandler.handleManageReminderConversationMessage(
          message.from,
          message.text.body
        );
      }
      if ("interactive" in message) {
        if (message.interactive.type === "button_reply") {
          console.debug(
            `[${handleNewMessage.name}] received button reply with id '${message.interactive.button_reply.id}' and title '${message.interactive.button_reply.title}'`
          );

          switch (message.interactive.button_reply.id) {
            case "new-birthday": {
              await conversationHandler.handleNewBirthdayConversationMessage(
                message.from,
                message.interactive.button_reply.title
              );
              return;
            }
            case "my-birthdays":
              await conversationHandler.whatsapp.sendInteractiveReplyButtonsMessage(
                message.from,
                "1. Kai on 10 March",
                [
                  { id: "manage-reminders", title: "Manage Reminders" },
                  { id: "main-menu", title: "Main Menu" },
                ],
                "Your Birthday Reminders"
              );
              return;
            case "manage-reminders": {
              await conversationHandler.handleManageReminderConversationMessage(
                message.from,
                message.interactive.button_reply.title
              );
              return;
            }
            case "delete-reminder": {
              await conversationHandler.handleManageReminderConversationMessage(
                message.from,
                message.interactive.button_reply.title
              );
              return;
            }
            case "support": {
              console.log("support or my-birthdays");
              return;
            }
            case "main-menu": {
              conversationHandler.clearUserState(message.from);
              await conversationHandler.sendMainMenu(message.from);
              return;
            }
            default:
              console.error(
                `[${handleNewMessage.name} unhandled message type received: ${message.interactive.button_reply.id}]`
              );
          }
        }
      }
    }
  }
}

function handleStatusUpdate(change): void {
  if (change.field === "messages" && "statuses" in change.value) {
    const statuses = change.value.statuses;
    for (const status of statuses) {
      console.debug(
        `[${handleStatusUpdate.name}] message with id '${status.id}' status updated to '${status.status}' at time ${status.timestamp} - conversation id '${status.conversation.id}' expires '${status.conversation.expiration_timestamp}'`
      );
    }
  }
}

export async function handleWhatsappCallback(c: Context) {
  const rawBody = await c.req.text();
  const isWebhookPayloadVerified = verifiyWebhookPayload(
    rawBody,
    c.req.header("X-Hub-Signature-256")
  );
  if (!isWebhookPayloadVerified) {
    return c.text("ok", 200);
  }

  const requestBody = await c.req.json();

  const entry = requestBody.entry;
  if (entry) {
    const changes = entry[0].changes;
    for (const change of changes) {
      // Skip changes that aren't related to the configured WhatsApp number
      if (
        change.value.metadata.phone_number_id !==
        process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
      ) {
        continue;
      }

      // Handle new message
      await handleNewMessage(change);

      // Received status updates
      handleStatusUpdate(change);
    }
  }

  return c.text("ok", 200);
}
