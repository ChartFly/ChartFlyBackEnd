// static/admin/market-holidays/MarketHolidays.js

console.log("🧭 MarketHolidays.js loaded");

async function loadMarketHolidays() {
  console.log("📥 loadMarketHolidays() called");
  console.log("📍 MarketHolidays call stack:", new Error().stack);

  try {
    const response = await fetch("/api/holidays/year/2025");
    if (!response.ok) throw new Error("Failed to fetch market holidays");

    const holidays = await response.json();
    console.log("✅ Holidays fetched:", holidays);

    const table = document.getElementById("holiday-table");
    console.log("🔍 holidays-table:", table);
    const tbody = table?.querySelector("tbody");
    console.log("🔍 tbody:", tbody);
    if (!tbody) throw new Error("Missing <tbody> in holidays table");

    tbody.innerHTML = "";

    holidays.forEach((holiday, index) => {
      console.log(`🔧 Rendering holiday row ${index + 1}:`, holiday);
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

    console.log(`✅ Rendered ${holidays.length} holidays`);
    window.updateHolidayTicker?.(holidays);

    const waitForInit = setInterval(() => {
      const ready =
        window.ButtonBoxMarketHolidays?.init &&
        window.ButtonBox?.wireCheckboxes;

      if (ready) {
        console.log("✅ ButtonBox and MarketHolidays init functions available");
        clearInterval(waitForInit);
        ButtonBoxMarketHolidays.init();
        setTimeout(() => {
          console.log("✅ Calling wireCheckboxes for 'holiday'");
          ButtonBox.wireCheckboxes("holiday");
        }, 100);
      } else {
        console.log("⏳ Waiting for ButtonBox to initialize...");
      }
    }, 50);

    const toggle = document.getElementById("holiday-show-id-toggle");
    console.log("🔍 holiday-show-id-toggle:", toggle);
    if (toggle) {
      toggle.addEventListener("change", () => {
        const visible = toggle.checked;
        console.log(`🔁 Toggling holiday ID column visibility: ${visible}`);
        document
          .querySelectorAll("#market-holidays-section .line-id-col")
          .forEach((cell) => {
            cell.style.display = visible ? "table-cell" : "none";
          });
      });
      toggle.dispatchEvent(new Event("change"));
    } else {
      console.warn("⚠️ holiday-show-id-toggle not found");
    }
  } catch (err) {
    console.error("❌ loadMarketHolidays() error:", err);
    const fallback = document.querySelector("#holidays-table tbody");
    if (fallback) {
      fallback.innerHTML = `<tr><td colspan="6">Failed to load holidays. Please try again later.</td></tr>`;
    }
  }
}

function getHolidayStatus(dateStr) {
  try {
    const today = new Date();
    const date = new Date(dateStr);
    if (isNaN(date)) return "—";

    const todayStr = today.toISOString().slice(0, 10);
    const dateStrClean = date.toISOString().slice(0, 10);

    return todayStr === dateStrClean
      ? "Today"
      : date < today
      ? "Passed"
      : "Upcoming";
  } catch {
    return "—";
  }
}

(() => {
  console.log("🧪 MarketHolidays IIFE initializing...");
  if (window.MARKET_HOLIDAYS_LOADED) {
    console.log("⚠️ MARKET_HOLIDAYS_LOADED already true, skipping...");
    return;
  }

  console.log("✅ MARKET_HOLIDAYS_LOADED now set to true");
  window.MARKET_HOLIDAYS_LOADED = true;
  window.handleHolidayAction = ButtonBoxRows.handleRowAction;
})();

window.addEventListener("DOMContentLoaded", loadMarketHolidays);
