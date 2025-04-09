// static/admin/market-holidays/MarketHolidays.js

async function loadMarketHolidays() {
  try {
    console.log("📥 MarketHolidays.js loaded — loading holidays...");

    const response = await fetch("/api/holidays/year/2025");
    if (!response.ok) throw new Error("Failed to fetch market holidays");

    const holidays = await response.json();
    console.log(`📅 Fetched ${holidays.length} holidays`);

    const table = document.getElementById("holidays-table");
    const tbody = table.querySelector("tbody");
    if (!tbody) throw new Error("Missing <tbody> in holidays table");

    tbody.innerHTML = "";

    holidays.forEach((holiday, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", holiday.id);
      row.setAttribute("data-index", index + 1);

      const status = getHolidayStatus(holiday.date);

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${
          holiday.id
        }"></td>
        <td class="line-id-col">${holiday.id}</td>
        <td>${sanitizeInput(holiday.name || "")}</td>
        <td>${sanitizeInput(holiday.date || "")}</td>
        <td>${status}</td>
        <td>${sanitizeInput(holiday.close_time || "")}</td>
      `;

      tbody.appendChild(row);
    });

    // ✅ Tell main.js to update the ticker if available
    window.updateHolidayTicker?.(holidays);

    // 🧠 Wait for ButtonBox modules to be fully loaded before init
    const waitForInit = setInterval(() => {
      if (
        window.ButtonBoxMarketHolidays?.init &&
        window.ButtonBox?.wireCheckboxes
      ) {
        clearInterval(waitForInit);
        console.log("🚀 Initializing ButtonBoxMarketHolidays...");
        ButtonBoxMarketHolidays.init();
        ButtonBox.wireCheckboxes("holiday");
        console.log("✅ Checkboxes wired for holidays");
      }
    }, 50);

    // 🆔 Show Line ID Toggle (from ButtonBox)
    const toggle = document.getElementById("market-holidays-show-id-toggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        document
          .querySelectorAll("#market-holidays-section .line-id-col")
          .forEach((cell) => {
            cell.style.display = toggle.checked ? "table-cell" : "none";
          });
      });
      toggle.dispatchEvent(new Event("change"));
      console.log("🆔 Show ID toggle wired");
    } else {
      console.warn("⚠️ market-holidays-show-id-toggle not found");
    }
  } catch (err) {
    console.error("❌ Error loading holidays:", err);
    const tbody = document.querySelector("#holidays-table tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6">Failed to load holidays. Please try again later.</td></tr>`;
    }
  }
}

function getHolidayStatus(dateStr) {
  try {
    const today = new Date();
    const date = new Date(dateStr);
    if (isNaN(date)) return "—";

    const d1 = today.toISOString().slice(0, 10);
    const d2 = date.toISOString().slice(0, 10);

    if (d1 === d2) return "Today";
    return date < today ? "Passed" : "Upcoming";
  } catch {
    return "—";
  }
}

// ✅ Init
(() => {
  if (window.MARKET_HOLIDAYS_LOADED) return;
  window.MARKET_HOLIDAYS_LOADED = true;
  console.log("📦 MARKET_HOLIDAYS_LOADED = true");
  window.handleHolidayAction = ButtonBoxRows.handleRowAction;
})();

window.addEventListener("DOMContentLoaded", loadMarketHolidays);
