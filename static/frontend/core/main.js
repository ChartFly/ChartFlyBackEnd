// static/frontend/core/main.js

document.addEventListener("DOMContentLoaded", function () {
  updateMarketStatus();
  loadHolidayTicker(); // ✅ Ticker now loads globally

  // ✅ Use admin.html's switchTab logic (no showTab override!)
  if (!location.hash) {
    switchTab("market-holidays-section");
    location.hash = "market-holidays-section";
  } else {
    const tabId = location.hash.replace("#", "");
    if (
      [
        "market-holidays-section",
        "api-keys-section",
        "user-management-section",
      ].includes(tabId)
    ) {
      switchTab(tabId);
    }
  }
});

// ✅ Market status display logic
function updateMarketStatus() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const dayOfWeek = now.getDay();
  const statusElement = document.getElementById("market-status-text");

  if (!statusElement) return;

  let status = "";
  let statusClass = "";

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    status = "Market Closed (Weekend)";
    statusClass = "market-closed";
  } else if (hours < 9 || (hours === 9 && minutes < 30)) {
    status = "Pre-Market Trading";
    statusClass = "market-prepost";
  } else if (hours < 16) {
    status = "Market Open";
    statusClass = "market-open";
  } else {
    status = "After-Market Trading";
    statusClass = "market-prepost";
  }

  statusElement.classList.remove(
    "market-open",
    "market-closed",
    "market-prepost"
  );
  statusElement.classList.add("market-status-text", statusClass);
  statusElement.innerText = status;
}

// ✅ Holiday Ticker (now GLOBAL 🎉)
async function loadHolidayTicker() {
  try {
    const res = await fetch("/api/holidays/year/2025");
    if (!res.ok) throw new Error("Holiday ticker fetch failed");

    const data = await res.json();
    const now = new Date();

    const upcoming = data
      .filter((h) => new Date(h.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);

    const formatted = upcoming
      .map((h) => {
        const date = new Date(h.date);
        const formattedDate = date.toLocaleDateString(undefined, {
          month: "short",
          day: "2-digit",
        });
        return `${formattedDate}  -  ${h.name}`;
      })
      .join("       |       ");

    const ticker = document.getElementById("holiday-ticker");
    if (ticker) ticker.textContent = `🎉 ${formatted}`;

    const dup = document.getElementById("holiday-ticker-duplicate");
    if (dup) dup.textContent = `🎉 ${formatted}`;
  } catch (err) {
    console.error("Ticker failed:", err);
    const ticker = document.getElementById("holiday-ticker");
    if (ticker) ticker.textContent = "⚠️ Failed to load holiday ticker.";
  }
}
