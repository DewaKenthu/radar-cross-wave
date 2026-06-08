import fs from "fs";

const API_URL = "https://wave-client-api.crosstoken.io/missions";

async function sendDiscord(message) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    console.log("DISCORD_WEBHOOK_URL tidak ditemukan");
    return;
  }

  await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: message
    })
  });
}

async function main() {
  const response = await fetch(API_URL, {
    headers: {
      "X-Domain": "wave.crosstoken.io"
    }
  });

  const data = await response.json();

  const groups = data.content || [];

  let missions = [];

  for (const group of groups) {
    if (group.missions) {
      missions.push(...group.missions);
    }
  }

  const storage = JSON.parse(
    fs.readFileSync("missions.json", "utf8")
  );

  const knownIds = storage.knownMissionIds || [];

  const newMissions = missions.filter(
    m => !knownIds.includes(m.id)
  );

  console.log("Mission ditemukan:", missions.length);
  console.log("Mission baru:", newMissions.length);

  for (const mission of newMissions) {
    const msg =
`🚨 MISSION BARU CROSS WAVE

🆔 ${mission.id}

📋 ${mission.title}

🌐 https://wave.crosstoken.io`;

    console.log("Kirim Discord:", mission.id);

    await sendDiscord(msg);
  }

  fs.writeFileSync(
    "missions.json",
    JSON.stringify(
      {
        knownMissionIds: missions.map(m => m.id)
      },
      null,
      2
    )
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
