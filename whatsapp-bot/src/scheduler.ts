import { getReminders } from "./infrastructure/reminders";
import { WhatsappClient } from "./whatsapp-business/client";

const whatsapp = new WhatsappClient(
  process.env.WHATSAPP_ACCESS_TOKEN,
  process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
);

export async function sendBirthdayReminders() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
  const currentDay = today.getDate();

  const reminders = await getReminders(undefined, currentMonth, currentDay);

  for (const reminder of reminders) {
    await whatsapp.sendInteractiveCTAButton(
      reminder.userId,
      `It's ${reminder.name}'s birthday today! Send them a message to make their day 🥳`,
      "Open chat",
      `https://wa.me/${reminder.whatsappNumber}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
  }
}
