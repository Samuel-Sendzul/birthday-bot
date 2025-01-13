import { Reminder } from "../domain/types";
import { db } from "./firebase/db";

export async function getReminders(
  userId?: string,
  birthdayMonth?: number,
  birthdayDay?: number
): Promise<Reminder[]> {
  const remindersRef = db.collection("reminders");

  if (!userId && !(birthdayMonth && birthdayDay)) {
    throw new Error(
      "either userId or birthdayMonth and birthdayDay must be defined"
    );
  }

  const queryRef = userId
    ? remindersRef.where("userId", "==", userId)
    : remindersRef
        .where("birthdayMonth", "==", birthdayMonth)
        .where("bithdayDay", "==", birthdayDay);

  const snapshot = await queryRef.get();

  const reminders: Reminder[] = [];
  snapshot.forEach((doc) => {
    const docData = doc.data();
    const reminder: Reminder = {
      userId: docData.userId,
      name: docData.name,
      birthdayDay: docData.birthdayDay,
      birthdayMonth: docData.birthdayMonth,
      whatsappNumber: docData.whatsappNumber,
      createdAt: docData.createdAt,
      id: doc.id,
    };
    reminders.push(reminder);
  });

  return reminders.sort((a, b) => {
    if (a.birthdayMonth === b.birthdayMonth) {
      return a.birthdayDay - b.birthdayDay;
    }
    return a.birthdayMonth - b.birthdayMonth;
  });
}

export async function createReminder(
  userId: string,
  name: string,
  birthdayDay: number,
  birthdayMonth: number,
  whatsappNumber: string
): Promise<Reminder> {
  const docRef = await db.collection("reminders").doc();
  const now = new Date();
  await docRef.set({
    userId,
    name,
    birthdayDay,
    birthdayMonth,
    whatsappNumber,
    createdAt: now,
  });
  const reminder: Reminder = {
    userId,
    name,
    birthdayDay,
    birthdayMonth,
    whatsappNumber,
    createdAt: now,
    id: docRef.id,
  };
  return reminder;
}

export async function deleteReminder(reminderId: string): Promise<void> {
  await db.collection("reminders").doc(reminderId).delete();
}
