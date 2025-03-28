// static/frontend/core/main.js

// =============================================================
// ✅ SECTION: Page Initialization
// - Kicks off once DOM is ready
// - Updates market status
// - (NO default tab shown on load)
// =============================================================
document.addEventListener("DOMContentLoaded", function () {
  updateMarketStatus();
  // Removed default tab display – tab will load when user clicks
});

// =============================================================
// 📈 SECTION: Market Status Logic
// - Determines open/closed state based on time and day
// - Applies appropriate class for background color
// =============================================================
function updateMarketStatus() {
  const now = new Date();
  const hours = now.getHours();
  const dayOfWeek = now.getDay();
  const statusElement = document.getElementById("market-status-text");

  if (!statusElement) {
    console.error("Market status element missing in HTML");
    return;
  }

  let status = "Market Closed";

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    status = "Market Closed (Weekend)";
  } else if (hours < 9.5) {
    status = "Pre-Market Trading";
    statusElement.className = "market-status-text market-prepost";
  } else if (hours < 16) {
    status = "Market Open";
    statusElement.className = "market-status-text market-open";
  } else {
    status = "After-Market Trading";
    statusElement.className = "market-status-text market-prepost";
  }

  statusElement.innerText = status;
}

// =============================================================
// 🧼 SECTION: Simple Sanitizer
// - Escapes angle brackets in strings to prevent HTML injection
// =============================================================
function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input;
}

// =============================================================
// 🗂️ SECTION: Tab Display & Loading Logic
// - Shows the clicked tab section, hides others
// - Applies .active class to the correct button
// - Calls tab-specific data loading function if it exists
// =============================================================
function showTab(tabName) {
  const tabs = ["market-holidays", "api-keys", "user-management"];
  tabs.forEach(name => {
    const section = document.getElementById(`${name}-section`);
    const button = document.querySelector(`button[onclick="showTab('${name}')"]`);

    if (section) section.style.display = (name === tabName) ? "block" : "none";
    if (button) button.classList.toggle("active", name === tabName);
  });

  // 🧠 Trigger data loader for each tab (if defined)
  if (tabName === "market-holidays" && typeof loadMarketHolidays === "function") loadMarketHolidays();
  if (tabName === "api-keys" && typeof loadApiKeys === "function") loadApiKeys();
  if (tabName === "user-management" && typeof loadUsers === "function") loadUsers();
}