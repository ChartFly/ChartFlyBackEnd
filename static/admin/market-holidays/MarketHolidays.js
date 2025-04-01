// static/admin/market-holidays/MarketHolidays.js
(() => {

let selectedHolidayRows = new Set();
let activeHolidayAction = null;
let clipboardHolidayRow = null;
let undoBuffer = null;

// Only bind loader if NOT already being called from main.js tab handler
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

    initCommitLogic({
      section: "holiday",
      onConfirm: async (action, selectedIds) => {
        const table = document.getElementById("holidays-table");

        switch (action) {
          case "delete":
            undoBuffer = [];
            for (const id of selectedIds) {
              const row = table.querySelector(`tr[data-id="${id}"]`);
              if (row) {
                undoBuffer.push(row.cloneNode(true));
                row.remove();
              }
            }
            break;

          case "copy":
            if (selectedIds.length !== 1) {
              alert("Copy requires exactly 1 row selected.");
              return;
            }
            clipboardHolidayRow = table.querySelector(`tr[data-id="${selectedIds[0]}"]`).cloneNode(true);
            break;

          case "paste":
            if (!clipboardHolidayRow) {
              alert("Nothing in clipboard. Copy something first.");
              return;
            }
            const pasted = clipboardHolidayRow.cloneNode(true);
            const pasteId = "paste-" + Date.now();
            pasted.setAttribute("data-id", pasteId);
            pasted.classList.remove("selected-row");
            pasted.querySelectorAll("input[type='checkbox']").forEach(box => {
              box.checked = false;
              box.setAttribute("data-id", pasteId);
            });
            table.appendChild(pasted);
            undoBuffer = [pasted.cloneNode(true)];
            break;

          case "add":
            const id = `new-${Date.now()}`;
            const row = document.createElement("tr");
            row.setAttribute("data-id", id);
            row.innerHTML = `
              <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${id}"></td>
              <td contenteditable="true" class="editable">New Holiday</td>
              <td contenteditable="true" class="editable">YYYY-MM-DD</td>
              <td contenteditable="true" class="editable">Upcoming</td>
            `;
            table.appendChild(row);
            undoBuffer = [row.cloneNode(true)];
            break;

          case "edit":
            selectedIds.forEach(id => {
              const row = table.querySelector(`tr[data-id="${id}"]`);
              if (!row) return;
              const cells = row.querySelectorAll("td:not(.col-select)");
              cells.forEach(cell => {
                const note = cell.querySelector(".early-close-note");
                if (note) note.remove();
                cell.setAttribute("contenteditable", "true");
                cell.classList.add("editable");
              });
              row.classList.add("editing");
            });
            break;

          case "save":
            const dirtyRows = table.querySelectorAll("tr.editing");
            dirtyRows.forEach(row => {
              const cells = row.querySelectorAll("td:not(.col-select)");
              cells.forEach(cell => {
                cell.removeAttribute("contenteditable");
                cell.classList.remove("editable");
              });
              row.classList.remove("editing");
            });
            undoBuffer = null;
            console.log("✅ Saved rows:", dirtyRows.length);
            break;

          default:
            console.warn("Unhandled action:", action);
        }
      },
      messages: {
        delete: "You're about to delete one or more holidays!",
        copy: "Copied 1 row to clipboard.",
        paste: "Pasted a cloned row at the end.",
        add: "A new blank holiday row was added.",
        edit: "You can now edit the selected rows.",
        save: {
          message: "Holiday changes saved (frontend only).",
          validate: (row) => {
            const cells = row.querySelectorAll("td:not(.col-select)");
            const name = cells[0]?.innerText.trim();
            const date = cells[1]?.innerText.trim();
            const status = cells[2]?.innerText.trim();
            const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
            const isValidStatus = ["Upcoming", "Passed"].includes(status);
            if (!name) return "Holiday name is required.";
            if (!isValidDate) return "Date must be in YYYY-MM-DD format.";
            if (!isValidStatus) return "Status must be 'Upcoming' or 'Passed'.";
            return true;
          }
        }
      }
    });

    // 🔄 Undo Button (safe binding)
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
      });
    }

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

function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input ?? "—";
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

})();