// static/frontend/core/main.js

const DEBUG = true; // 🔍 Set to true to enable debug logs

document.addEventListener("DOMContentLoaded", function () {
  updateMarketStatus();
  if (DEBUG) console.log("📈 Market status updated on DOM load");
  // Do not auto-select any tab on load
});

const DEBUG = true; // 🔍 Set to true to enable debug logs

document.addEventListener("DOMContentLoaded", function () {
  updateMarketStatus();
  if (DEBUG) console.log("📈 Market status updated on DOM load");
  // Do not auto-select any tab on load
});

// ✅ Market status display logic
function updateMarketStatus() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const dayOfWeek = now.getDay();
  const statusElement = document.getElementById("market-status-text");

  if (!statusElement) {
    if (DEBUG) console.warn("⚠️ #market-status-text element not found");
    return;
  }

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

  if (DEBUG) {
    console.log("⏰ Market status time:", now.toLocaleTimeString());
    console.log("📢 Status set to:", status);
  }
}

// ✅ Sanitizer
function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input;
}

// ✅ SINGLE showTab() function to rule them all
function showTab(tabName) {
  const tabs = ["market-holidays", "api-keys", "user-management"];
  tabs.forEach((name) => {
    const section = document.getElementById(`${name}-section`);
    const button = document.querySelector(
      `button[onclick="showTab('${name}')"]`
    );

    if (section) section.style.display = name === tabName ? "block" : "none";
    if (button) button.classList.toggle("active", name === tabName);
  });

  if (DEBUG) console.log("🗂️ Switching to tab:", tabName);

  // Call data loaders (if defined)
  if (
    tabName === "market-holidays" &&
    typeof loadMarketHolidays === "function"
  ) {
    if (DEBUG) console.log("📅 Loading Market Holidays...");
    loadMarketHolidays();
  }
  if (tabName === "api-keys" && typeof loadApiKeys === "function") {
    if (DEBUG) console.log("🔑 Loading API Keys...");
    loadApiKeys();
  }
  if (tabName === "user-management" && typeof loadAdminUsers === "function") {
    if (DEBUG) console.log("👤 Loading Admin Users...");
    loadAdminUsers();
    if (typeof loadTabAccess === "function") {
      if (DEBUG) console.log("🔐 Loading Tab Access...");
      loadTabAccess();
    }
  }
}

if (DEBUG) {
  console.log(
    "🚧 DEBUG mode ON in main.js — run `showTab('market-holidays')` manually to test tab logic"
  );
}

if (DEBUG) {
  console.log(
    "🚧 DEBUG mode ON in main.js — run `showTab('market-holidays')` manually to test tab logic"
  );
}
