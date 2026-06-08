const API_URL = "https://wave-client-api.crosstoken.io/missions";

async function main() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        "X-Domain": "wave.crosstoken.io"
      }
    });

    const data = await response.json();

    console.log("=== CROSS WAVE ===");
    console.log("Mission ditemukan:", Array.isArray(data) ? data.length : "Unknown");

    console.log(
      JSON.stringify(data, null, 2).slice(0, 1000)
    );

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
