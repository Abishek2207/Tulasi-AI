const { execSync } = require('child_process');

async function checkDeploy() {
    process.stdout.write("Checking Render deployment status...");
    
    try {
        const ping = await fetch('https://tulasi-ai-wgwl.onrender.com/api/ping');
        const data = await ping.json();
        const uptime = data.uptime_seconds;
        
        console.log(`\n\n🕒 Server Uptime: ${uptime} seconds (${Math.floor(uptime/60)} minutes)`);
        
        if (uptime > 300) {
            console.log("\n⚠️ Render is still running the old version.");
            console.log("   The new fixes (including the HackathonApplication database auto-migration) haven't gone live yet.");
            console.log("   Render's CI/CD usually takes 4-7 minutes depending on traffic.");
            console.log("\n👉 Action: Wait exactly 2 minutes and run this command again!");
        } else {
            console.log("\n✅ THE NEW CODE IS LIVE! (Fresh reboot detected)");
            console.log("Running the End-to-End E2E test script automatically...\n");
            
            try {
                execSync('node test_hackathons.js', { stdio: 'inherit' });
            } catch (e) {
                console.log("\n❌ Hmmm, it failed again. Please copy the error above.");
            }
        }
    } catch (e) {
        console.error("\n❌ Error connecting to server:", e.message);
    }
}

checkDeploy();
