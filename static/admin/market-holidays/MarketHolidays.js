// static/admin/market-holidays/MarketHolidays.js

async function loadMarketHolidays() {
  try {
    const response = await fetch("/api/holidays/year/2025");
    if (!response.ok) throw new Error("Failed to fetch market holidays");

    const holidays = await response.json();
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

    // ✅ Update the scrolling ticker content //
    updateHolidayTicker(holidays);

    ButtonBoxMarketHolidays.init();

    const waitForButtonBox = setInterval(() => {
      if (window.ButtonBox && ButtonBox.wireCheckboxes) {
        clearInterval(waitForButtonBox);
        ButtonBox.wireCheckboxes("holiday");
      }
    }, 50);

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

function updateHolidayTicker(holidays) {
  const ticker = document.getElementById("holiday-ticker");
  if (!ticker) return;

  const upcoming = holidays
    .filter((h) => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10)
    .map((h) => {
      const date = new Date(h.date);
      const options = { month: "short", day: "numeric" };
      return `${h.name} – ${date.toLocaleDateString(undefined, options)}`;
    })
    .join("  |  ");

  ticker.textContent = upcoming || "🎉 No upcoming holidays.";
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

window.addEventListener("DOMContentLoaded", loadMarketHolidays);
