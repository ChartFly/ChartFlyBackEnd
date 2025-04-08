document.addEventListener("DOMContentLoaded", function () {
  updateMarketStatus();
  if (window.DEBUG) {
    console.log("✅ main.js initialized and updateMarketStatus() called");
  }

  // 🔒 Force Market Holidays only
  if (typeof showTab === "function") {
    console.log("🔒 Forcing Market Holidays only — tabs disabled");
    showTab("market-holidays");
  } else {
    console.warn("⚠️ showTab function not defined");
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

// ✅ Sanitizer
function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input;
}

// ✅ Tab logic
function showTab(tabName) {
  const tabs = ["market-holidays", "api-keys", "user-management"];
  if (window.DEBUG) console.log(`📂 Switching to tab: ${tabName}`);

  tabs.forEach((name) => {
    const section = document.getElementById(`${name}-section`);
    const button = document.querySelector(
      `button[onclick="showTab('${name}')"]`
    );

    // 🔒 Only show market-holidays section
    const shouldShow = name === "market-holidays";
    if (section) section.style.display = shouldShow ? "block" : "none";
    if (button) button.classList.toggle("active", shouldShow);
  });

  // 🔃 Load Market Holidays only
  if (
    tabName === "market-holidays" &&
    typeof loadMarketHolidays === "function"
  ) {
    loadMarketHolidays();
  }

  location.hash = "market-holidays"; // Always reset hash to safe zone
}

// 🔧 DEBUG + Export
window.DEBUG = true;
window.showTab = showTab;
window.sanitizeInput = sanitizeInput;

if (DEBUG)
  console.log(
    "🧭 main.js loaded — showTab and sanitizeInput exported globally"
  );
