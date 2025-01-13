import { Client, LocalAuth } from "whatsapp-web.js";

export const whatsapp = new Client({
  authStrategy: new LocalAuth(),
  // proxyAuthentication: { username: 'username', password: 'password' },
  puppeteer: {
    // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
    headless: false,
  },
});

whatsapp.initialize();

whatsapp.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

// Pairing code only needs to be requested once
let pairingCodeRequested = false;
whatsapp.on("qr", async (qr) => {
  // NOTE: This event will not be fired if a session is specified.
  console.log("QR RECEIVED", qr);

  // pairing code example
  const pairingCodeEnabled = false;
  if (pairingCodeEnabled && !pairingCodeRequested) {
    const pairingCode = await whatsapp.requestPairingCode("27765655919", true); // enter the target phone number
    console.log("Pairing code enabled, code: " + pairingCode);
    pairingCodeRequested = true;
  }
});

whatsapp.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

whatsapp.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

whatsapp.on("ready", async () => {
  console.log("READY");
  const debugWWebVersion = await whatsapp.getWWebVersion();
  console.log(`WWebVersion = ${debugWWebVersion}`);

  whatsapp.pupPage.on("pageerror", function (err) {
    console.log("Page error: " + err.toString());
  });
  whatsapp.pupPage.on("error", function (err) {
    console.log("Page error: " + err.toString());
  });
});
