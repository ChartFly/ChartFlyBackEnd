// static/admin/market-holidays/MarketHolidays.js
(() => {
let selectedHolidayRows = new Set();
let activeHolidayAction = null;
let clipboardHolidayRow = null;
let undoBuffer = null;

if (!window.MARKET_HOLIDAYS_LOADED) {
  window.addEventListener("DOMContentLoaded", () => {
    loadMarketHolidays();
  });
}

async function loadMarketHolidays() {
  if (window.MARKET_HOLIDAYS_LOADED) return;
  window.MARKET_HOLIDAYS_LOADED = true;

  try {
    const response = await fetch("https://chartflybackend.onrender.com/api/holidays/year/2025");
    if (!response.ok) throw new Error("Failed to fetch market holidays");

    const holidays = await response.json();
    const table = document.getElementById("holidays-table");
    table.innerHTML = "";

    holidays.forEach((holiday, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", holiday.id);
      row.setAttribute("data-index", index + 1);

      const isEarlyClose = holiday.close_time !== null;
      const readableTime = isEarlyClose ? formatTime(holiday.close_time) : null;

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${holiday.id}"></td>
        <td>${sanitizeInput(holiday.name || "N/A")}</td>
        <td>${sanitizeInput(holiday.date || "N/A")}</td>
        <td>
          ${sanitizeInput(holiday.status || "Unknown")}
          ${isEarlyClose ? `<span class="early-close-note"> (Closes at ${readableTime})</span>` : ""}
        </td>
      `;

      table.appendChild(row);
    });

    setupHolidayToolbar();

  } catch (error) {
    console.error("❌ Failed to load holidays:", error);
    const table = document.getElementById("holidays-table");
    table.innerHTML = `<tr><td colspan="4">Failed to load holidays. Please try again later.</td></tr>`;
  }
}

function setupHolidayToolbar() {
  document.querySelectorAll(".holiday-select-checkbox").forEach(box => {
    box.addEventListener("change", () => {
      const row = box.closest("tr");
      const id = box.dataset.id;

      if (box.checked) {
        selectedHolidayRows.add(id);
        row.classList.add("selected-row");
      } else {
        selectedHolidayRows.delete(id);
        row.classList.remove("selected-row");
      }

      updateHolidayConfirmBar();
    });
  });

  const actions = ["edit", "copy", "paste", "add", "delete", "save"];
  actions.forEach(action => {
    const btn = document.getElementById(`holiday-${action}-btn`);
    if (!btn) return;

    btn.addEventListener("click", () => {
      activeHolidayAction = action;

      actions.forEach(a => {
        const other = document.getElementById(`holiday-${a}-btn`);
        if (other) other.classList.remove("active");
      });

      btn.classList.add("active");

      if (selectedHolidayRows.size === 0 && action !== "add") {
        showHolidayConfirmBar("Please select at least one row first.");
        return;
      }

      const selectedIndexes = Array.from(document.querySelectorAll("tr.selected-row"))
        .map(row => row.dataset.index);

      showHolidayConfirmBar(`Ready to ${action} row(s): ${selectedIndexes.join(", ")}`);
    });
  });

  const undoBtn = document.getElementById("holiday-undo-btn");
  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      if (!undoBuffer || undoBuffer.length === 0) return;
      const table = document.getElementById("holidays-table");

      undoBuffer.forEach(row => {
        const cloned = row.cloneNode(true);
        const newId = "undo-" + Date.now();
        cloned.setAttribute("data-id", newId);
        cloned.querySelectorAll("input[type='checkbox']").forEach(box => {
          box.checked = false;
          box.setAttribute("data-id", newId);
        });
        table.appendChild(cloned);
      });

      undoBuffer = null;
      showHolidayConfirmBar("Last change undone.");
    });
  }

  const saveBtn = document.getElementById("holiday-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      undoBuffer = null;
      hideHolidayConfirmBar();
      console.log("✅ Changes saved!");
    });
  }
}

function updateHolidayConfirmBar() {
  const bar = document.getElementById("holiday-confirm-bar");
  const msg = document.getElementById("holiday-confirm-message");

  if (selectedHolidayRows.size === 0) {
    bar.style.display = "none";
    msg.textContent = "";
    return;
  }

  showHolidayConfirmBar(`${selectedHolidayRows.size} row(s) selected.`);
}

function showHolidayConfirmBar(message) {
  const bar = document.getElementById("holiday-confirm-bar");
  const msg = document.getElementById("holiday-confirm-message");

  msg.textContent = message;
  bar.style.display = "flex";
}

function hideHolidayConfirmBar() {
  const bar = document.getElementById("holiday-confirm-bar");
  bar.style.display = "none";
}

function formatTime(rawTime) {
  const [hour, minute] = rawTime.split(":");
  const h = parseInt(hour, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12 + 1);
  return `${hour12}:${minute} ${suffix}`;
}

function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input ?? "—";
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
})();