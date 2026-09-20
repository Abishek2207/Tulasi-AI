async function watch() {
    let lastUptime = 999999;
    console.log("👀 Watching for fresh Render deployment...");
    while (true) {
        try {
            const res = await fetch('https://tulasi-ai-wgwl.onrender.com/api/ping');
            const data = await res.json();
            const uptime = data.uptime_seconds;
            process.stdout.write(`\rUptime: ${uptime}s   `);
            if (uptime < lastUptime && uptime < 60) {
                console.log("\n\n✨ NEW DEPLOYMENT DETECTED! ✨");
                process.exit(0);
            }
            lastUptime = uptime;
        } catch (e) {
            process.stdout.write(`\r[Server Down/Restarting...]   `);
        }
        await new Promise(r => setTimeout(r, 5000));
    }
}
watch();
