import { WhatsappClient } from "./whatsapp/client";

const whatsapp = new WhatsappClient(
  process.env.WHATSAPP_ACCESS_TOKEN,
  process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
);

export async function sendBirthdayReminders() {
  await whatsapp.sendInteractiveCTAButton(
    "27826229622",
    "It's Kayla ❤️'s birthday today! Send them a message to make their day 🥳",
    "Open chat",
    "https://wa.me/27828062636"
  );
}
