import { Section } from "./types";

export class WhatsappClient {
  private accessToken: string;
  private baseUrl: string;

  constructor(
    accessToken: string | undefined,
    phoneNumberId: string | undefined
  ) {
    if (!accessToken || !phoneNumberId) {
      throw new Error("both accessToken and phoneNumberId must be defined");
    }

    this.accessToken = accessToken;
    this.baseUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}`;
  }

  private async handleResponse(
    response: Response,
    methodName: string
  ): Promise<string> {
    if (response.status === 200) {
      const responseBody = await response.json();
      return responseBody.messages[0].id;
    } else {
      console.error(
        `[${methodName}] failed to send message: ${await response.text()}`
      );
      throw new Error("failed to send whatsapp message");
    }
  }

  async sendInteractiveReplyButtonsMessage(
    to: string,
    bodyText: string,
    buttons: {
      id: string;
      title: string;
    }[],
    headerText?: string,
    footer?: string
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          ...(headerText ? { header: { type: "text", text: headerText } } : {}),
          body: {
            text: bodyText,
          },
          ...(footer ? { footer: { text: footer } } : {}),
          action: {
            buttons: buttons.map((button) => ({
              type: "reply",
              reply: {
                id: button.id,
                title: button.title,
              },
            })),
          },
        },
      }),
    });
    return this.handleResponse(
      response,
      this.sendInteractiveReplyButtonsMessage.name
    );
  }

  async sendInteractiveListMessage(
    to: string,
    titleText: string,
    bodyText: string,
    buttonsTitle: string,
    sections: Section[],
    footer?: string
  ) {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "interactive",
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: titleText,
          },
          body: {
            text: bodyText,
          },
          ...(footer && { footer: { text: footer } }),
          action: {
            button: buttonsTitle,
            sections,
          },
        },
      }),
    });
    return this.handleResponse(response, this.sendInteractiveListMessage.name);
  }

  async sendInteractiveCTAButton(
    to: string,
    bodyText: string,
    buttonText: string,
    buttonUrl: string,
    headerText?: string,
    footerText?: string
  ) {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "interactive",
        interactive: {
          type: "cta_url",
          ...(headerText ? { header: { text: headerText } } : {}),
          body: {
            text: bodyText,
          },
          ...(footerText ? { footer: { text: footerText } } : {}),
          action: {
            name: "cta_url",
            parameters: {
              display_text: buttonText,
              url: buttonUrl,
            },
          },
        },
      }),
    });
    return this.handleResponse(response, this.sendInteractiveCTAButton.name);
  }

  async sendTextMessage(
    to: string,
    text: { body: string; previewUrl?: boolean }
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          body: text.body,
          preview_url: text.previewUrl,
        },
      }),
    });
    return this.handleResponse(response, this.sendTextMessage.name);
  }
}
