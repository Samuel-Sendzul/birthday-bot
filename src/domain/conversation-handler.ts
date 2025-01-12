import { createReminder } from "../infrastructure/reminders";
import { WhatsappClient } from "../whatsapp/client";
import { MONTHS } from "./consts";
import { getDaySuffix } from "./utils";

const STATES = {
  ASKING_NAME: 1,
  ASKING_BIRTHDAY_MONTH: 2,
  ASKING_BIRTHDAY_DAY: 3,
  ASKING_CONTACT: 4,
  ASKING_WHATSAPP_NUMBER: 5,
  ASKING_WHICH_REMINDER: 6,
  ASKING_REMINDER_ACTION: 7,
};

export class ConverationHandler {
  private conversations: Map<string, number>;
  public whatsapp: WhatsappClient;

  public userData: Map<string, Map<string, any>>;

  constructor() {
    this.conversations = new Map();
    this.userData = new Map();
    this.whatsapp = new WhatsappClient(
      process.env.WHATSAPP_ACCESS_TOKEN,
      process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
    );
  }

  async _askName(userId, message: string): Promise<number> {
    try {
      await this.whatsapp.sendTextMessage(userId, {
        body: "*Follow the prompts to configure a new reminder!*",
      });
      await this.whatsapp.sendTextMessage(userId, {
        body: "Enter the name of the person whose birthday you are setting a reminder for",
      });
      return STATES.ASKING_NAME;
    } catch (error) {
      console.error(
        `[${this._askName.name}] failed to send message asking for name with error: ${error}`
      );
      throw error;
    }
  }

  async _askBirthdayMonth(
    userId: string,
    message: string
  ): Promise<number | undefined> {
    this.setUserData(userId, "name", message);
    try {
      await this.whatsapp.sendInteractiveReplyButtonsMessage(
        userId,
        "Enter the birthday month as a number (MM), e.g. 9 for September.",
        [{ id: "main-menu", title: "Main Menu" }]
      );
    } catch (error) {
      console.error(
        `[${this._askBirthdayMonth.name}] failed to send message asking for birthday month with error: ${error}`
      );
      return;
    }

    return STATES.ASKING_BIRTHDAY_MONTH;
  }

  async _askBirthdayDay(userId: string, message: string): Promise<number> {
    try {
      const month = parseInt(message, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        await this.whatsapp.sendInteractiveReplyButtonsMessage(
          userId,
          "The birthday month must be a digit between 1 and 12! Try again",
          [{ id: "main-menu", title: "Main Menu" }]
        );
        return STATES.ASKING_BIRTHDAY_MONTH;
      }
      this.setUserData(userId, "month", month);

      await this.whatsapp.sendInteractiveReplyButtonsMessage(
        userId,
        `You entered ${month} for ${MONTHS[month]} 📝\n\nEnter the day of the birthday (DD), for example, 12 for the 12th day of the month.`,
        [{ id: "main-menu", title: "Main Menu" }]
      );
      return STATES.ASKING_BIRTHDAY_DAY;
    } catch (error) {
      console.error(
        `[${this._askBirthdayDay.name}] failed to send message asking for birthday day with error: ${error}`
      );
      throw error;
    }
  }

  async _askWhatsAppNumber(userId: string, message: string): Promise<number> {
    try {
      const day = parseInt(message, 10);
      const month = this.getUserData(userId, "month");
      const daysInMonth = new Date(2024, month, 0).getDate(); // Get the number of days in the month for a leap year

      if (isNaN(day) || day < 1 || day > daysInMonth) {
        await this.whatsapp.sendInteractiveReplyButtonsMessage(
          userId,
          `The birthday day must be a number between 1 and ${daysInMonth} for the month of ${MONTHS[month]}.`,
          [{ id: "main-menu", title: "Main Menu" }]
        );
        return STATES.ASKING_BIRTHDAY_DAY;
      }
      this.setUserData(userId, "day", day);

      await this.whatsapp.sendInteractiveReplyButtonsMessage(
        userId,
        `You entered ${day} for a birthday on the ${day}${getDaySuffix(
          day
        )} of ${
          MONTHS[month]
        } 📝\n\nEnter the WhatsApp number of the person whose birthday you are setting a reminder for\n\n*Include the area code*, e.g. 27821234567`,
        [{ id: "main-menu", title: "Main Menu" }]
      );
      return STATES.ASKING_WHATSAPP_NUMBER;
    } catch (error) {
      console.error(
        `[${this._askWhatsAppNumber.name}] failed to send message asking for WhatsApp number with error: ${error}`
      );
      throw error;
    }
  }

  async _saveBirthdayReminder(
    userId: string,
    message: string
  ): Promise<number | undefined> {
    try {
      const whatsappNumber = message.replace(/\s+/g, "").replace(/\+/g, "");
      const whatsappNumberPattern = /^[1-9]\d{9,14}$/;
      if (!whatsappNumberPattern.test(whatsappNumber)) {
        await this.whatsapp.sendInteractiveReplyButtonsMessage(
          userId,
          "The phone number must be between 10 and 15 digits and must start with an area code, e.g. 27. Try again!",
          [{ id: "main-menu", title: "Main Menu" }]
        );
        return STATES.ASKING_WHATSAPP_NUMBER;
      }

      const name = this.getUserData(userId, "name");
      const day = this.getUserData(userId, "day");
      const month = this.getUserData(userId, "month");

      const reminder = await createReminder(
        userId,
        name,
        day,
        month,
        whatsappNumber
      );

      await this.whatsapp.sendInteractiveReplyButtonsMessage(
        userId,
        `Your reminder for ${reminder.name} is set for the ${
          reminder.birthdayDay
        }${getDaySuffix(reminder.birthdayDay)} of ${
          MONTHS[reminder.birthdayMonth]
        } 🥳`,
        [{ id: "main-menu", title: "Main Menu" }]
      );
    } catch (error) {
      console.error(
        `[${this._saveBirthdayReminder.name}] failed to save birthday reminder with error: ${error}`
      );
      throw error;
    }
  }

  async _askWhichReminder(userId: string, message: string) {
    try {
      await this.whatsapp.sendTextMessage(userId, {
        body: "*Which reminder would you like to manage? Enter a number from your reminders list below, e.g. 1*\n\n1. Kai on 10 March\n2. Kayla on 20 July",
      });
      return STATES.ASKING_WHICH_REMINDER;
    } catch (error) {
      console.error(
        `[${this._askWhichReminder.name}] failed to send message asking for reminder with error: ${error}`
      );
      throw error;
    }
  }

  async _askingReminderAction(userId: string, message: string) {
    try {
      const reminder = parseInt(message, 10);
      if (isNaN(reminder) || reminder < 1 || reminder > 5) {
        await this.whatsapp.sendInteractiveReplyButtonsMessage(
          userId,
          "The reminder must be a number between 1 and 5! Try again",
          [{ id: "main-menu", title: "Main Menu" }]
        );
        return STATES.ASKING_WHICH_REMINDER;
      }
      this.setUserData(userId, "reminder", reminder);

      await this.whatsapp.sendInteractiveReplyButtonsMessage(
        userId,
        `What would you like to do with the reminder for Kai's birthday on the 10th of March?`,
        [
          { id: "delete-reminder", title: "Delete Reminder" },
          { id: "main-menu", title: "Main Menu" },
        ]
      );
      return STATES.ASKING_REMINDER_ACTION;
    } catch (error) {
      console.error(
        `[${this._askingReminderAction.name}] failed to send message asking for reminder action with error: ${error}`
      );
      throw error;
    }
  }

  async _deleteReminder(userId: string, message: string) {
    this.clearUserState(userId);
    await this.whatsapp.sendInteractiveReplyButtonsMessage(
      userId,
      `Reminder for Kai's birthday on the 10th of March has been successfully deleted ✅`,
      [
        { id: "new-birthday", title: "New Birthday" },
        { id: "main-menu", title: "Main Menu" },
      ]
    );
  }

  async handleNewBirthdayConversationMessage(userId: string, message: string) {
    try {
      const conversation = this.conversations.get(userId);
      let newState: number;
      if (!conversation) {
        newState = await this._askName(userId, message);
        this.conversations.set(userId, newState);
        return;
      }

      switch (conversation) {
        case STATES.ASKING_NAME: {
          const newState = await this._askBirthdayMonth(userId, message);
          this.conversations.set(userId, newState);
          return;
        }
        case STATES.ASKING_BIRTHDAY_MONTH: {
          const newState = await this._askBirthdayDay(userId, message);
          this.conversations.set(userId, newState);
          return;
        }
        case STATES.ASKING_BIRTHDAY_DAY: {
          const newState = await this._askWhatsAppNumber(userId, message);
          this.conversations.set(userId, newState);
          return;
        }
        case STATES.ASKING_WHATSAPP_NUMBER: {
          const newState = await this._saveBirthdayReminder(userId, message);
          if (newState) {
            this.conversations.set(userId, newState);
            return;
          }
          this.clearUserState(userId);
          return;
        }
      }
    } catch (error) {
      console.error(
        `[${this.handleNewBirthdayConversationMessage.name}] failed to handle new birthday conversation message with error: ${error}`
      );
      throw error;
    }
  }

  async handleManageReminderConversationMessage(
    userId: string,
    message: string
  ) {
    try {
      const conversation = this.conversations.get(userId);
      let newState: number;
      if (!conversation) {
        newState = await this._askWhichReminder(userId, message);
        this.conversations.set(userId, newState);
        return;
      }

      switch (conversation) {
        case STATES.ASKING_WHICH_REMINDER: {
          const newState = await this._askingReminderAction(userId, message);
          this.conversations.set(userId, newState);
          return;
        }
        case STATES.ASKING_REMINDER_ACTION: {
          await this._deleteReminder(userId, message);
          this.clearUserState(userId);
          return;
        }
      }
    } catch (error) {
      console.error(
        `[${this.handleManageReminderConversationMessage.name}] failed to handle manage reminder conversation message with error: ${error}`
      );
      throw error;
    }
  }

  async sendMainMenu(to: string): Promise<string> {
    return await this.whatsapp.sendInteractiveReplyButtonsMessage(
      to,
      "Never miss a birthday message again!\n\nSet a reminder and get notified with a quick contact button for easy messaging.",
      [
        { id: "new-birthday", title: "New Birthday 🎉" },
        { id: "my-birthdays", title: "My Birthdays 📋" },
        { id: "support", title: "Support 🙋‍♀️" },
      ],
      undefined,
      "477209338762044",
      "Birthday Bot™"
    );
  }

  getUserState(userId: string): number | undefined {
    return this.conversations.get(userId);
  }

  clearUserState(userId: string) {
    this.conversations.delete(userId);
    this.userData.delete(userId);
  }

  setUserData(userId: string, key: string, value: any) {
    const userConversationData = this.userData.get(userId) || new Map();
    userConversationData.set(key, value);
    this.userData.set(userId, userConversationData);
  }

  getUserData(userId: string, key: string): any | undefined {
    const userConversationData = this.userData.get(userId);
    if (userConversationData) {
      return userConversationData.get(key);
    }
    return undefined;
  }
}
