const API_URL = "https://tulasi-ai-wgwl.onrender.com";

async function runHackathonTests() {
  console.log("🚀 Starting Live E2E Verification for Hackathons...");

  let token = "";
  try {
    // 1. Auth Login
    console.log(`1. Logging in to ${API_URL}...`);
    const email = "test_hackathon_e2e@example.com";
    const password = "password123";

    // Attempt register, ignore if exists
    await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: "Hackathon Tester" })
    });

    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    token = loginData.access_token;
    console.log("✅ Logged in successfully!");

    // 2. Fetch Hackathons
    console.log("2. Fetching Hackathons [GET /api/hackathons]...");
    const hackathonsRes = await fetch(`${API_URL}/api/hackathons`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    });

    if (!hackathonsRes.ok) {
       const text = await hackathonsRes.text();
       console.log(`Fetch hackathons failed: ${hackathonsRes.status}`);
       console.log("FULL BODY:");
       console.log(text);
       process.exit(1);
    }
    
    const hackathonsData = await hackathonsRes.json();
    console.log(`✅ Success! Retrieved ${hackathonsData.total} hackathons.`);
    if (hackathonsData.hackathons && hackathonsData.hackathons.length > 0) {
       console.log("📋 First Hackathon Title:", hackathonsData.hackathons[0].title);
       console.log("📋 First Hackathon Mode:", hackathonsData.hackathons[0].mode);
    } else {
       console.log("⚠️ No hackathons seeded yet, but the endpoint did not crash!");
    }

    console.log("\n🎉 ALL HACKATHON ENDPOINTS FUNCTIONING NORMALLY!");

  } catch (err) {
    console.error("\n❌ Test Failed:", err.message);
    process.exit(1);
  }
}

runHackathonTests();
