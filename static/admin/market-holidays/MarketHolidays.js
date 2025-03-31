// static/admin/market-holidays/MarketHolidays.js

let selectedHolidayRows = new Set();
let activeHolidayAction = null;

window.addEventListener("DOMContentLoaded", loadMarketHolidays);

async function loadMarketHolidays() {
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
           ${sanitizeInput(holiday.status || "Unknown")}<br>
           ${isEarlyClose ? `<small>(Closes at ${readableTime})</small>` : ""}
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

function formatTime(rawTime) {
  const [hour, minute] = rawTime.split(":");
  const h = parseInt(hour, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12 + 1);
  return `${hour12}:${minute} ${suffix}`;
}

function setupHolidayToolbar() {
  const checkboxes = document.querySelectorAll(".holiday-select-checkbox");
  const confirmBox = document.getElementById("holiday-confirm");

  checkboxes.forEach(box => {
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

      updateHolidayConfirmBox();
    });
  });

  const actions = ["edit", "copy", "paste", "add", "delete", "save"];
  actions.forEach(action => {
    const btn = document.getElementById(`holiday-${action}-btn`);
    if (!btn) return;

    btn.addEventListener("click", () => {
      activeHolidayAction = action;

      actions.forEach(a => {
        const otherBtn = document.getElementById(`holiday-${a}-btn`);
        if (otherBtn) otherBtn.classList.remove("active");
      });
      btn.classList.add("active");

      if (selectedHolidayRows.size === 0) {
        confirmBox.innerHTML = `<div class="confirm-box warn">Please select one or more rows.  Then select an action button.</div>`;
        return;
      }

      const selectedIndexes = Array.from(document.querySelectorAll("tr.selected-row"))
        .map(row => row.dataset.index);

      confirmBox.innerHTML = `
        <div class="confirm-box info">
          <strong>Action:</strong> ${action.toUpperCase()}<br>
          <strong>Selected Rows:</strong> ${selectedIndexes.join(", ")}<br>
          <button class="confirm-btn yellow" onclick="confirmHolidayAction()">Confirm ${action}</button>
        </div>
      `;
    });
  });
}

function confirmHolidayAction() {
  const confirmBox = document.getElementById("holiday-confirm");

  if (!activeHolidayAction || selectedHolidayRows.size === 0) {
    confirmBox.innerHTML = `<div class="confirm-box warn">No action or rows selected.</div>`;
    return;
  }

  console.log(`✅ Confirmed [${activeHolidayAction}] for:`, Array.from(selectedHolidayRows));

  confirmBox.innerHTML = `
    <div class="confirm-box success">✅ ${capitalize(activeHolidayAction)} Confirmed!</div>
  `;

  activeHolidayAction = null;
  selectedHolidayRows.clear();
  document.querySelectorAll(".holiday-select-checkbox").forEach(box => (box.checked = false));
  document.querySelectorAll("tr.selected-row").forEach(row => row.classList.remove("selected-row"));
  document.querySelectorAll(".action-btn").forEach(btn => btn.classList.remove("active"));
}

function updateHolidayConfirmBox() {
  const confirmBox = document.getElementById("holiday-confirm");
  if (selectedHolidayRows.size === 0) {
    confirmBox.innerHTML = "";
    return;
  }

  confirmBox.innerHTML = `<div class="confirm-box info">${selectedHolidayRows.size} row(s) selected.</div>`;
}

function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input ?? "—";
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}