chrome.history.onVisited.addListener((result) => {
    // Save to Tulasi AI backend
    fetch("https://tulasi-ai-backend.onrender.com/activity/chrome-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            url: result.url,
            title: result.title,
            visitTime: result.lastVisitTime
        })
    }).catch(err => console.error("Error logging history:", err));
});
