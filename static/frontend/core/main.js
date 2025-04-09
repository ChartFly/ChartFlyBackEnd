// static/frontend/core/main.js

document.addEventListener("DOMContentLoaded", function () {
  updateMarketStatus();
  loadHolidayTicker(); // ✅ Ticker now loads globally

  // Set default tab if no hash
  if (!location.hash) {
    if (typeof showTab === "function") {
      showTab("market-holidays");
      location.hash = "market-holidays";
    }
  } else {
    const tab = location.hash.replace("#", "");
    if (typeof showTab === "function") showTab(tab);
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

// ✅ Sanitizer
function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input;
}

// ✅ Tab logic
function showTab(tabName) {
  const tabs = ["market-holidays", "api-keys", "user-management"];

  tabs.forEach((name) => {
    const section = document.getElementById(`${name}-section`);
    const button = document.querySelector(
      `button[onclick="showTab('${name}')"]`
    );
    const isActive = name === tabName;

    if (section) section.style.display = isActive ? "block" : "none";
    if (button) button.classList.toggle("active", isActive);
  });

  // Load tab-specific data
  if (
    tabName === "market-holidays" &&
    typeof loadMarketHolidays === "function"
  ) {
    loadMarketHolidays();
  } else if (tabName === "api-keys" && typeof loadApiKeys === "function") {
    loadApiKeys();
  } else if (
    tabName === "user-management" &&
    typeof loadAdminUsers === "function"
  ) {
    loadAdminUsers();
    if (typeof loadTabAccess === "function") loadTabAccess();
  }

  location.hash = tabName;
}

// ✅ Export to window
window.showTab = showTab;
window.sanitizeInput = sanitizeInput;
window.updateHolidayTicker = loadHolidayTicker;
