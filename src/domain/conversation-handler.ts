import { WhatsappClient } from "../whatsapp/client";

const STATES = {
  ASKING_NAME: 1,
  ASKING_BIRTHDAY_MONTH: 2,
  ASKING_BIRTHDAY_DAY: 4,
  ASKING_CONTACT: 4,
  ASKING_WHATSAPP_NUMBER: 5,
};

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

  async _askBirthdayDay(userId, message): Promise<number> {
    await this.whatsapp.sendTextMessage(userId, {
      body: "Enter the day of the birthday as a two-digit number (DD), for example, 12 for the 12th day of the month.",
    });
    return STATES.ASKING_BIRTHDAY_DAY;
  }

  async _askWhatsAppNumber(userId, message): Promise<number> {
    await this.whatsapp.sendTextMessage(userId, {
      body: "Enter the WhatsApp number of the person whose birthday you are setting a reminder for\n\n*Include the area code*, e.g. 27821234567",
    });
    return STATES.ASKING_WHATSAPP_NUMBER;
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
        this.whatsapp.sendTextMessage(userId, {
          body: "Thanks! Your reminder has been set!",
        });
        this.conversations.delete(userId);
      }
    }
  }

  getUserState(userId: string): number | undefined {
    return this.conversations.get(userId);
  }
}
