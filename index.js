const API_URL = "https://wave-client-api.crosstoken.io/missions";

async function main() {
  try {
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

    console.log("=== CROSS WAVE ===");
    console.log("Mission ditemukan:", missions.length);

    for (const mission of missions.slice(0, 10)) {
      console.log(
        `[${mission.id}] ${mission.title}`
      );
    }

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
