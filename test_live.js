const API_URL = "http://127.0.0.1:8000";

async function run() {
  console.log("🚀 Starting Live E2E Verification...");

  let token = "";
  try {
    // 1. Auth Login (assume a test user exists, otherwise create one)
    console.log("1. Logging in...");
    const email = "test_live_verify@example.com";
    const password = "password123";

    // Attempt register, ignore if exists
    await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: "Live Test" })
    });

    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    token = loginData.access_token;
    console.log("✅ Token saved:", token ? "PRESENT" : "MISSING");

    // 2. Test Chat
    console.log("2. Testing Chat...");
    const chatRes = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ message: "Hello, system check!" })
    });
    if (!chatRes.ok) throw new Error(`Chat failed: ${chatRes.status}`);
    console.log("✅ Chat works!");

    // 3. Test Roadmap
    console.log("3. Testing Roadmap...");
    const roadmapRes = await fetch(`${API_URL}/api/roadmap/`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    });
    if (!roadmapRes.ok) throw new Error(`Roadmap failed: ${roadmapRes.status}`);
    console.log("✅ Roadmap loads!");

    // 4. Test Interview
    console.log("4. Testing Mock Interview...");
    const interviewRes = await fetch(`${API_URL}/api/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ role: "Software Engineer", company: "TestCorp", interview_type: "Technical" })
    });
    if (!interviewRes.ok) throw new Error(`Interview failed: ${interviewRes.status}`);
    console.log("✅ Mock Interview starts!");

    // 5. Test Study Rooms
    console.log("5. Testing Study Rooms...");
    const studyRes = await fetch(`${API_URL}/api/study/rooms`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    });
    if (!studyRes.ok) throw new Error(`Study Rooms failed: ${studyRes.status}`);
    console.log("✅ Study Rooms load!");

    console.log("✅ ALL FEATURES WORKING");

  } catch (err) {
    console.error("❌ Test Failed:", err.message);
    process.exit(1);
  }
}

run();
