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
      embeds: [
      {
        title: "🚨 CROSS WAVE ALERT",
        description: mission.title,
        color: 5763719,
        fields: [
          {
            name: "💰 Reward",
            value: `${mission.rewardAmount} ${mission.rewardType}`,
            inline: true
          },
          {
            name: "🆔 Mission ID",
            value: String(mission.id),
            inline: true
          },
          {
            name: "📅 Deadline",
            value: new Date(mission.endedAt).toLocaleDateString("id-ID"),
            inline: false
          }
        ],
        footer: {
          text: "Radar CROSS WAVE"
        },
        timestamp: new Date().toISOString()
      }
    ]
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

  if (newMissions.length > 0) {
  console.log(
    JSON.stringify(newMissions[0], null, 2)
  );
}

  if (newMissions.length > 0) {

    let message =
`🚨 **${newMissions.length} MISSION BARU CROSS WAVE**

`;

  for (const mission of newMissions) {

    message +=
`🎯 #${mission.id}
📋 ${mission.title}
🎁 ${mission.rewardAmount} ${mission.rewardType}
📅 Berakhir: ${mission.endedAt}

`;
  }

  message +=
`🌐 https://wave.crosstoken.io`;

  await sendDiscord(message);
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
