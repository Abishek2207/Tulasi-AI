const API_URL = "https://tulasi-backend.onrender.com";
const email = `debug.${Date.now()}@example.com`;
const password = "Password123!";

async function run() {
  console.log("=== FULL SYSTEM RUNTIME DEBUG ===");
  console.log(`Target: ${API_URL}\n`);

  let token = "";

  async function check(name, endpoint, method, body = null, requireAuth = true) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
    console.log(`[CHECK] ${name}: ${method} ${url}`);
    
    const headers = { "Content-Type": "application/json" };
    if (requireAuth && token) headers["Authorization"] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch(e) {}

      if (res.ok) {
        console.log(`   ✅ PASS -> Status: ${res.status}`);
        if(data) {
           const keys = Object.keys(data).slice(0, 5).join(", ");
           console.log(`   ✅ JSON Keys: ${keys}${Object.keys(data).length>5?"...":""}`);
        }
        return { ok: true, data, status: res.status };
      } else {
        console.log(`   ❌ FAIL -> Status: ${res.status}`);
        console.log(`   ❌ Body: ${text.substring(0, 200)}`);
        return { ok: false, data, status: res.status, text };
      }
    } catch (err) {
      console.log(`   ❌ ERROR -> ${err.message}`);
      return { ok: false, error: err.message };
    }
  }

  // STEP 1 & 2: Health, Auth, Token Flow
  await check("Health", "/api/health", "GET", null, false);
  
  // Register first to get token
  const reg = await check("Register", "/api/auth/register", "POST", { name: "Debug", email, password }, false);
  if (reg.ok && reg.data && reg.data.access_token) {
    token = reg.data.access_token;
    console.log(`   Token Acquired: ${token.substring(0,15)}...`);
  } else {
     console.log("   FAILED TO REGISTER. Cannot proceed with authenticated checks.");
     return;
  }

  // STEP 4: Chat logic
  const chat = await check("Chat POST", "/api/chat", "POST", { message: "Hello" });
  
  // STEP 5: Study Rooms
  await check("Study Rooms GET", "/api/study/rooms", "GET");
  const createRoom = await check("Study Rooms POST", "/api/study/create", "POST", { name: "Debug Room", description: "Test", tag: "General" });

  // STEP 6: Roadmap & Interview
  await check("Roadmap GET", "/api/roadmap/", "GET");
  await check("Interview POST", "/api/interview/start", "POST", { role: "Software Engineer", company: "Meta", type: "Technical" });

  console.log("\n=== DEBUG COMPLETE ===");
}

run();
