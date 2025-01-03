import { WhatsappClient } from "../whatsapp/client";

const STATES = {
  ASKING_NAME: 1,
  ASKING_BIRTHDAY_MONTH: 2,
  ASKING_BIRTHDAY_DAY: 4,
  ASKING_CONTACT: 4,
};

export class ConverationHandler {
  private conversations: Map<string, number>;
  private whatsapp: WhatsappClient;

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
    console.debug("name", message);
    await this.whatsapp.sendTextMessage(userId, {
      body: "Enter a name for your birthday reminder",
    });
    return STATES.ASKING_NAME;
  }

  async _askBirthdayMonth(userId: string, message: string): Promise<number> {
    console.debug("month", message);
    await this.whatsapp.sendTextMessage(userId, {
      body: "Select birthday month",
    });
    return STATES.ASKING_BIRTHDAY_MONTH;
  }

  async _askBirthdayDay(userId, message): Promise<number> {
    console.debug("day", message);
    await this.whatsapp.sendTextMessage(userId, {
      body: "Select birthday day",
    });
    return STATES.ASKING_BIRTHDAY_DAY;
  }

  async handleMessage(userId: string, message: string) {
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
      default: {
        await this.whatsapp.sendTextMessage(userId, { body: "Thanks!" });
        this.conversations.delete(userId);
      }
    }
  }
}
