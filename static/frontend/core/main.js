// static/frontend/core/main.js

document.addEventListener("DOMContentLoaded", function () {
  updateMarketStatus();
  showTab("market-holidays"); // Default tab on load
});

/* ✅ Market Status Display */
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

/* ✅ Basic Sanitizer */
function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input;
}

/* ✅ Tab Switch Logic */
function showTab(tabName) {
  const tabs = ["market-holidays", "api-keys", "user-management"];
  tabs.forEach(name => {
    const section = document.getElementById(`${name}-section`);
    const button = document.querySelector(`button[onclick="showTab('${name}')"]`);

    if (section) section.style.display = (name === tabName) ? "block" : "none";
    if (button) button.classList.toggle("active", name === tabName);
  });

  // Call load function if it exists
  if (tabName === "market-holidays" && typeof loadMarketHolidays === "function") loadMarketHolidays();
  if (tabName === "api-keys" && typeof loadApiKeys === "function") loadApiKeys();
  if (tabName === "user-management" && typeof loadUsers === "function") loadUsers();
}