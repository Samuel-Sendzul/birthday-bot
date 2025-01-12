import { MONTHS } from "./consts";
import { Reminder } from "./types";

export function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function makeRemindersString(reminders: Reminder[]): string {
  return reminders
    .map((reminder, index) => {
      const daySuffix = getDaySuffix(reminder.birthdayDay);
      return `${index + 1}. ${reminder.name} on the ${
        reminder.birthdayDay
      }${daySuffix} of ${MONTHS[reminder.birthdayMonth]}`;
    })
    .join("\n");
}
