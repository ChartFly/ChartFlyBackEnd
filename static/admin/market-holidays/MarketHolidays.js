// static/admin/market-holidays/MarketHolidays.js

async function loadMarketHolidays() {
  try {
    const response = await fetch("/api/holidays/year/2025");
    if (!response.ok) throw new Error("Failed to fetch market holidays");

    const holidays = await response.json();
    const table = document.getElementById("holidays-table");
    const tbody = table.querySelector("tbody");
    if (!tbody) throw new Error("❌ <tbody> not found in holidays table");

    tbody.innerHTML = "";

    holidays.forEach((holiday, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", holiday.id);
      row.setAttribute("data-index", index + 1);

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${
          holiday.id
        }"></td>
        <td class="line-id-col">${holiday.id}</td>
        <td>${sanitizeInput(holiday.name || "")}</td>
        <td>${sanitizeInput(holiday.date || "")}</td>
        <td>${sanitizeInput(holiday.status || "")}</td>
        <td>${sanitizeInput(holiday.close_time || "")}</td>
      `;

      tbody.appendChild(row);

      if (window.DEBUG)
        console.log(`📦 Appended row for holiday: ${holiday.name}`);
    });

    // Set up ButtonBox
    ButtonBoxMarketHolidays.init();

    // Wire checkboxes
    const waitForButtonBox = setInterval(() => {
      if (window.ButtonBox && ButtonBox.wireCheckboxes) {
        clearInterval(waitForButtonBox);
        ButtonBox.wireCheckboxes("holiday");
      }
    }, 50);

    // ID toggle logic
    const toggle = document.getElementById("holiday-show-id-toggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        document
          .querySelectorAll("#market-holidays-section .line-id-col")
          .forEach((cell) => {
            cell.style.display = toggle.checked ? "table-cell" : "none";
          });
      });
      toggle.dispatchEvent(new Event("change"));
    }
  } catch (err) {
    console.error("❌ Error loading holidays:", err);
    const tbody = document.querySelector("#holidays-table tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6">Failed to load holidays. Please try again later.</td></tr>`;
    }
  }
}

(() => {
  if (window.MARKET_HOLIDAYS_LOADED) return;
  window.MARKET_HOLIDAYS_LOADED = true;

  window.sanitizeInput = function (input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  };

  window.handleHolidayAction = ButtonBoxRows.handleRowAction;
})();

// Debug mode: don't auto-run unless explicitly triggered
if (window.DEBUG) {
  console.log("🚧 DEBUG mode is ON — loadMarketHolidays() won't auto-run");
  console.log("👉 Run it manually with: loadMarketHolidays()");
} else {
  window.addEventListener("DOMContentLoaded", loadMarketHolidays);
}
