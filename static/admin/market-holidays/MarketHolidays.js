// static/admin/market-holidays/MarketHolidays.js

async function loadMarketHolidays() {
  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/holidays/year/2025"
    );
    if (!response.ok) throw new Error("Failed to fetch market holidays");

    const holidays = await response.json();
    const table = document.getElementById("holidays-table");
    table.innerHTML = "";

    holidays.forEach((holiday, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", holiday.id);
      row.setAttribute("data-index", index + 1);

      const isEarlyClose = holiday.close_time !== null;
      const readableTime = isEarlyClose ? formatTime(holiday.close_time) : "";

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${
          holiday.id
        }"></td>
        <td class="line-id-col">${holiday.id}</td>
        <td>${sanitizeInput(holiday.name || "N/A")}</td>
        <td>${sanitizeInput(holiday.date || "N/A")}</td>
        <td>${sanitizeInput(holiday.status || "Unknown")}</td>
        <td>${readableTime}</td>
      `;

      table.appendChild(row);
    });

    // ✅ Initialize ButtonBox AFTER rows are in the DOM
    ButtonBoxMarketHolidays.init();

    // ✅ Wire checkboxes AFTER rows are rendered
    ButtonBox.wireCheckboxes("holiday");

    const toggle = document.getElementById("holiday-show-id-toggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        document
          .querySelectorAll("#market-holidays-section .line-id-col")
          .forEach(
            (cell) =>
              (cell.style.display = toggle.checked ? "table-cell" : "none")
          );
      });
      document
        .querySelectorAll("#market-holidays-section .line-id-col")
        .forEach(
          (cell) =>
            (cell.style.display = toggle.checked ? "table-cell" : "none")
        );
    }
  } catch (error) {
    console.error("❌ Failed to load holidays:", error);
    const table = document.getElementById("holidays-table");
    table.innerHTML = `<tr><td colspan="6">Failed to load holidays. Please try again later.</td></tr>`;
  }
}

(() => {
  if (window.MARKET_HOLIDAYS_LOADED) return;
  window.MARKET_HOLIDAYS_LOADED = true;

  window.formatTime = function (rawTime) {
    const [hour, minute] = rawTime.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12) + 1;
    return `${hour12}:${minute} ${suffix}`;
  };

  window.sanitizeInput = function (input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  };

  // 🧠 Delegate to ButtonBoxRows
  window.handleHolidayAction = ButtonBoxRows.handleRowAction;
})();

window.addEventListener("DOMContentLoaded", loadMarketHolidays);
