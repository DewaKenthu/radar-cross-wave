import fs from "fs";

const API_URL = "https://wave-client-api.crosstoken.io/missions";

async function sendDiscord(mission) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    console.log("DISCORD_WEBHOOK_URL tidak ditemukan");
    return;
  }

  let slotStatus = "🟢";

  const remaining =
    mission.maxParticipants - mission.approvedCount;

  if (remaining <= 10)
    slotStatus = "🟡";

  if (remaining <= 3)
    slotStatus = "🔴";

  await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      embeds: [
        {
          author: {
            name: mission.gameTitle || "Unknown Game"
          },
          
          title: "🎯 Mission Baru CROSS WAVE",
          url: "https://wave.crosstoken.io/mission",
          description: mission.title,
          color: 16766720,
          fields: [
            {
              name: "💰 Reward",
              value: `${mission.rewardAmount} ${mission.rewardType}`,
              inline: true
            },
            {
              name: `${slotStatus} Slot`,
              value: `${mission.approvedCount}/${mission.maxParticipants}`,
              inline: true
            },
            {
              name: "📅 Deadline",
              value: new Date(mission.endedAt).toLocaleString(
                "id-ID",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }
              ),
              inline: false
            }
          ],
          footer: {
            text: "Radar CROSS WAVE"
          },

          thumbnail: {
            url: mission.thumbnailUrl
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

      for (const mission of group.missions) {

        missions.push({
          ...mission,
          gameTitle: group.game?.title,
          thumbnailUrl: group.thumbnailImage?.url,
          campaignName: group.name
        });

      }

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
  for (const mission of newMissions) {
    await sendDiscord(mission);
  }
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
