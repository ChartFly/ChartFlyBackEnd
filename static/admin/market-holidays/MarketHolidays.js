// static/admin/market-holidays/MarketHolidays.js

(() => {
  if (window.MARKET_HOLIDAYS_LOADED) return;
  window.MARKET_HOLIDAYS_LOADED = true;

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
        const readableTime = isEarlyClose ? formatTime(holiday.close_time) : "";

        row.innerHTML = `
          <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${holiday.id}"></td>
          <td>${sanitizeInput(holiday.name || "N/A")}</td>
          <td>${sanitizeInput(holiday.date || "N/A")}</td>
          <td>${sanitizeInput(holiday.status || "Unknown")}</td>
          <td>${readableTime}</td>
        `;

        table.appendChild(row);
      });

      ButtonBox.init({
        section: "holiday",
        domId: "market-holidays-section",
        tableId: "holidays-table",
        confirmBoxId: "holiday-confirm-bar",
        messageId: "holiday-confirm-message",
        tipBoxId: "holiday-tip-box",
        warningBoxId: "holiday-warning-box",
        onAction: handleHolidayAction
      });

    } catch (error) {
      console.error("❌ Failed to load holidays:", error);
      const table = document.getElementById("holidays-table");
      table.innerHTML = `<tr><td colspan="5">Failed to load holidays. Please try again later.</td></tr>`;
    }
  }

  function handleHolidayAction(action, selectedIds) {
    const table = document.getElementById("holidays-table");

    if (action === "delete") {
      selectedIds.forEach(id => {
        const row = table.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();
      });
    }

    if (action === "copy") {
      const sourceRow = table.querySelector(`tr[data-id="${selectedIds[0]}"]`);
      if (!sourceRow) return;

      const clone = sourceRow.cloneNode(true);
      const newId = `copy-${Date.now()}`;
      clone.setAttribute("data-id", newId);
      clone.classList.add("editing");

      clone.querySelectorAll("td:not(.col-select)").forEach(cell => {
        cell.setAttribute("contenteditable", "true");
        cell.classList.add("editable");
      });

      clone.querySelector(".col-select").innerHTML = `
        <input type="checkbox" class="holiday-select-checkbox" data-id="${newId}" checked>
      `;

      table.prepend(clone);
    }

    if (action === "add") {
      const newId = `new-${Date.now()}`;
      const newRow = document.createElement("tr");
      newRow.classList.add("editing");
      newRow.setAttribute("data-id", newId);
      newRow.setAttribute("data-index", "0");

      newRow.innerHTML = `
        <td class="col-select">
          <input type="checkbox" class="holiday-select-checkbox" data-id="${newId}" checked>
        </td>
        <td contenteditable="true" class="editable">Edit</td>
        <td contenteditable="true" class="editable">YYYY-MM-DD</td>
        <td contenteditable="true" class="editable">Upcoming</td>
        <td contenteditable="true" class="editable"></td>
      `;

      newRow.querySelectorAll("td[contenteditable]").forEach(cell => {
        cell.addEventListener("input", () => newRow.classList.add("dirty"));
      });

      table.prepend(newRow);
    }

    if (action === "save") {
      const dirtyRows = table.querySelectorAll("tr.editing");

      dirtyRows.forEach((row, i) => {
        row.classList.remove("editing", "dirty");

        row.querySelectorAll("td[contenteditable]").forEach(cell => {
          cell.removeAttribute("contenteditable");
          cell.classList.remove("editable");
        });

        // Assign a real ID (simulated)
        const finalId = `saved-${Date.now()}-${i}`;
        row.setAttribute("data-id", finalId);

        // Update checkbox data-id and uncheck
        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox) {
          checkbox.setAttribute("data-id", finalId);
          checkbox.checked = false;
        }

        row.classList.remove("selected-row");
      });

      // Rewire checkboxes for full button compatibility
      if (typeof ButtonBox.wireCheckboxes === "function") {
        ButtonBox.wireCheckboxes("holiday");
      }

      ButtonBox.showMessage("holiday", "Holiday rows saved (frontend only).", "success");
    }

    if (action === "paste") {
      ButtonBox.showWarning("holiday", "Paste is not implemented yet.");
    }
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
})();