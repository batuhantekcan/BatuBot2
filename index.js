const tmi = require("tmi.js");
const WebSocket = require("ws");
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
const CLIENT_ID = "xtdrb2mfd389gai62ylb6f49xrrwzh";
const CHANNEL = "batu68t";

async function getUserId(login) {
  const response = await fetch(
    `https://api.twitch.tv/helix/users?login=${login}`,
    {
      headers: {
        "Client-ID": CLIENT_ID,
        "Authorization": "Bearer " + token.replace(/^oauth:/, "")
      }
    }
  );

  const data = await response.json();
  return data.data[0].id;
}

async function startFollowAlerts() {
  const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

  ws.on("message", async raw => {
    const message = JSON.parse(raw.toString());

    if (message.metadata.message_type === "session_welcome") {
      const sessionId = message.payload.session.id;

      const broadcasterId = await getUserId(CHANNEL);
      const moderatorId = await getUserId("batubot1");

      await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
        method: "POST",
        headers: {
          "Client-ID": CLIENT_ID,
          "Authorization": "Bearer " + token.replace(/^oauth:/, ""),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "channel.follow",
          version: "2",
          condition: {
            broadcaster_user_id: broadcasterId,
            moderator_user_id: moderatorId
          },
          transport: {
            method: "websocket",
            session_id: sessionId
          }
        })
      });

      console.log("❤️ Follow-Alert aktiviert!");
    }

    if (message.metadata.message_type === "notification") {
      if (message.metadata.subscription_type === "channel.follow") {
        const event = message.payload.event;

        client.say(
          CHANNEL,
          `❤️ Danke für den Follow, @${event.user_login}! Willkommen bei batu68t! 🔥🎮`
        );
      }
    }
  });

  ws.on("error", error => {
    console.log("❌ EventSub Fehler:", error);
  });
}

startFollowAlerts();

client.connect()
  .then(() => {
    console.log("✅ BatuBot2 ist mit Twitch verbunden!");
})
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
