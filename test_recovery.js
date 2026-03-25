const API_URL = "https://tulasi-backend.onrender.com";

const tests = [
  { name: "Health Check", url: "/api/health", method: "GET" },
  { name: "Chat Endpoint", url: "/api/chat", method: "POST", data: { message: "Hello", tool: "chat" } },
  { name: "Roadmap List", url: "/api/roadmap/", method: "GET" },
  { name: "Interview Config", url: "/api/interview/config", method: "GET" },
  { name: "Study Rooms", url: "/api/study/rooms", method: "GET" },
  { name: "Startup Idea Generate", url: "/api/startup/generate", method: "POST", data: { domain: "Education", target_audience: "Students" } }
];

async function runTests() {
  console.log(`🚀 Starting Production Verification at ${API_URL}`);
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    try {
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: test.data ? JSON.stringify(test.data) : undefined
      };
      
      const res = await fetch(`${API_URL}${test.url}`, options);
      if (res.ok) {
        console.log(`✅ ${res.status} OK`);
      } else {
        const body = await res.text();
        console.log(`❌ FAILED: ${res.status} ${res.statusText}`);
        console.log(`   Data: ${body}`);
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
    }
  }
}

runTests();
