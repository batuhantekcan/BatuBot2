const tmi = require("tmi.js");
const https = require("https");

function checkToken(token) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      "https://id.twitch.tv/oauth2/validate",
      {
        method: "GET",
        headers: {
          Authorization: "OAuth " + token
        }
      },
      res => {
        let data = "";

        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          console.log("🔎 Twitch Token Check:", data);
          resolve();
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

const username = "batubot1";
let token = process.env.OAUTH_TOKEN;

if (!token) {
  console.log("❌ OAUTH_TOKEN fehlt!");
  process.exit(1);
}

if (!token.startsWith("oauth:")) {
  token = "oauth:" + token;
}
checkToken(token.replace(/^oauth:/, ""));
const client = new tmi.Client({
  options: {
    debug: true
  },
  identity: {
    username: username,
    password: token
  },
  channels: ["batu68t"]
});

client.connect()
  .then(() => {
    console.log("✅ BatuBot2 ist mit Twitch verbunden!");
  setInterval(() => {
  client.say("#batu68t", "📱🔥 Folgt Batu auf TikTok: @batu68t");
  client.say("#batu68t", "📸🔥 Folgt Batu auch auf Instagram: @batu.t68");
}, 15 * 60 * 1000);})
  .catch((err) => {
    console.log("❌ Verbindung fehlgeschlagen:");
    console.log(err);
  });

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  const command = message.toLowerCase().trim();

  if (command === "!commands") {
    client.say(channel,
      "🤖 BatuBot Befehle: !socials • !tiktok • !insta • !rank • !loadout • !sens • !settings • !wins • !warzone"
    );
  }

  if (command === "!socials") {
    client.say(channel,
      "🔥 Batu's Socials | TikTok: @batu68t | Instagram: @batu.t68"
    );
  }

  if (command === "!tiktok") {
    client.say(channel,
      "🎮 TikTok von Batu: @batu68t 🔥 Folgt gerne für Warzone Clips!"
    );
  }

  if (command === "!insta") {
    client.say(channel,
      "📸 Instagram von Batu: @batu.t68 🔥 Folgt gerne!"
    );
  }

  if (command === "!rank") {
    client.say(channel,
      "🏆 Batu ist aktuell im Ranked unterwegs! 🔥🎮"
    );
  }

  if (command === "!loadout") {
    client.say(channel,
      "🔫 Batu's aktuelles Warzone-Loadout? Fragt einfach im Chat 😈🔥"
    );
  }

  if (command === "!sens") {
    client.say(channel,
      "🎯 Batu's Warzone Sens? Controller-Settings gibt's auf Anfrage 😈🔥"
    );
  }

  if (command === "!settings") {
    client.say(channel,
      "⚙️ Batu's Warzone Settings: Controller, Sens, Aim & Movement 🎮🔥"
    );
  }

  if (command === "!wins") {
    client.say(channel,
      "🏆 Batu's Warzone Wins: Heute wird auf Sieg gespielt! 🔥🎮"
    );
  }

  if (command === "!warzone") {
    client.say(channel,
      "🎮 Willkommen bei batu68t! Hier gibt's Warzone, Ranked & jede Menge Sweaty Gameplay 🔥💀"
    );
  }

  if (command === "!hello") {
    client.say(channel,
      `👋 Willkommen im Stream von batu68t, @${tags.username}! Viel Spaß bei Warzone 🔥🎮`
    );
  }
});
