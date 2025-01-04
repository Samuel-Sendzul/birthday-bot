import { WhatsappClient } from "../whatsapp/client";

const STATES = {
  ASKING_NAME: 1,
  ASKING_BIRTHDAY_MONTH: 2,
  ASKING_BIRTHDAY_DAY: 4,
  ASKING_CONTACT: 4,
  ASKING_WHATSAPP_NUMBER: 5,
};

const twoDigitNumberPattern = /^\d{2}$/;
export class ConverationHandler {
  private conversations: Map<string, number>;
  public whatsapp: WhatsappClient;

  public userData: Map<string, string>;

  constructor() {
    this.conversations = new Map();
    this.userData = new Map();
    this.whatsapp = new WhatsappClient(
      process.env.WHATSAPP_ACCESS_TOKEN,
      process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
    );
  }

  async _askName(userId, message: string): Promise<number> {
    await this.whatsapp.sendTextMessage(userId, {
      body: "*Follow the prompts to configure a new reminder!*",
    });
    await this.whatsapp.sendTextMessage(userId, {
      body: "Enter the name of the person whose birthday you are setting a reminder for",
    });
    return STATES.ASKING_NAME;
  }

  async _askBirthdayMonth(userId: string, message: string): Promise<number> {
    await this.whatsapp.sendTextMessage(userId, {
      body: "Enter the birthday month as a two-digit number (MM), e.g., 01 for January.",
    });
    return STATES.ASKING_BIRTHDAY_MONTH;
  }

  async _askBirthdayDay(userId: string, message: string): Promise<number> {
    if (!twoDigitNumberPattern.test(message)) {
      await this.whatsapp.sendTextMessage(userId, {
        body: "The birthday month must be two digits! e.g. 04",
      });
      return STATES.ASKING_BIRTHDAY_MONTH;
    }
    await this.whatsapp.sendTextMessage(userId, {
      body: "Enter the day of the birthday as a two-digit number (DD), for example, 12 for the 12th day of the month.",
    });
    return STATES.ASKING_BIRTHDAY_DAY;
  }

  async _askWhatsAppNumber(userId: string, message: string): Promise<number> {
    if (!twoDigitNumberPattern.test(message)) {
      await this.whatsapp.sendTextMessage(userId, {
        body: "The birthday day must be two digits! e.g. 12",
      });
      return STATES.ASKING_BIRTHDAY_DAY;
    }
    await this.whatsapp.sendTextMessage(userId, {
      body: "Enter the WhatsApp number of the person whose birthday you are setting a reminder for\n\n*Include the area code*, e.g. 27821234567",
    });
    return STATES.ASKING_WHATSAPP_NUMBER;
  }

  async _saveBirthdayReminder(
    userId: string,
    message: string
  ): Promise<number | undefined> {
    const cleanedMessage = message.replace(/\s+/g, "").replace(/\+/g, "");
    const phoneNumberPattern = /^\d{10,15}$/;
    if (!phoneNumberPattern.test(cleanedMessage)) {
      await this.whatsapp.sendTextMessage(userId, {
        body: "The phone number must be between 10 and 15 digits and should not contain any spaces or special characters. Try again!",
      });
      return STATES.ASKING_WHATSAPP_NUMBER;
    }
    await this.whatsapp.sendTextMessage(userId, {
      body: "Thanks! Your reminder has been set!",
    });
  }

  async handleNewBirthdayConversationMessage(userId: string, message: string) {
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
        this.conversations.delete(userId);
        return;
      }
    }
  }

  getUserState(userId: string): number | undefined {
    return this.conversations.get(userId);
  }
}
