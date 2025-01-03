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
    if (response.status === 200) {
      const responseBody = await response.json();
      return responseBody.messages[0].id;
    } else {
      console.error(
        `[${
          this.sendInteractiveReplyButtonsMessage.name
        }] failed to send interactive message: ${await response.text()}`
      );
    }
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
    if (response.status === 200) {
      const responseBody = await response.json();
      return responseBody.messages[0].id;
    } else {
      console.error(
        `[${
          this.sendTextMessage.name
        }] failed to send text message: ${await response.text()}`
      );
    }
  }
}
