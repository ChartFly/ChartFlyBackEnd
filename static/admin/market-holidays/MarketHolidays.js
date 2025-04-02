// static/admin/market-holidays/MarketHolidays.js
(() => {
  let clipboardHolidayRow = null;
  let undoBuffer = null;

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

      initCommitLogic({
        section: "holiday",
        sectionDomId: "market-holidays-section",
        onConfirm: async (action, selectedIds) => {
          const table = document.getElementById("holidays-table");

          switch (action) {
            case "delete":
              undoBuffer = [];
              selectedIds.forEach(id => {
                const row = table.querySelector(`tr[data-id="${id}"]`);
                if (row) {
                  undoBuffer.push(row.cloneNode(true));
                  row.remove();
                }
              });
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
              const pasteId = "paste-" + Date.now();
              const pasted = clipboardHolidayRow.cloneNode(true);
              pasted.setAttribute("data-id", pasteId);
              pasted.classList.add("editing");

              pasted.querySelectorAll("td:not(.col-select)").forEach(cell => {
                cell.setAttribute("contenteditable", "true");
                cell.classList.add("editable");
              });
              pasted.querySelectorAll("input[type='checkbox']").forEach(box => {
                box.checked = false;
                box.setAttribute("data-id", pasteId);
              });
              table.insertBefore(pasted, table.firstChild);
              undoBuffer = [pasted.cloneNode(true)];
              break;

            case "add":
              const newId = `new-${Date.now()}`;
              const newRow = document.createElement("tr");
              newRow.setAttribute("data-id", newId);
              newRow.classList.add("editing");
              newRow.innerHTML = `
                <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${newId}"></td>
                <td contenteditable="true" class="editable">New Holiday</td>
                <td contenteditable="true" class="editable">YYYY-MM-DD</td>
                <td contenteditable="true" class="editable">Upcoming</td>
                <td contenteditable="true" class="editable">13:00</td>
              `;
              table.insertBefore(newRow, table.firstChild);
              undoBuffer = [newRow.cloneNode(true)];
              break;

            case "save":
              const dirtyRows = table.querySelectorAll("tr.editing");
              dirtyRows.forEach(row => {
                row.querySelectorAll("td:not(.col-select)").forEach(cell => {
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
          paste: "Pasted a cloned row at the top.",
          add: "A new blank holiday row was added to the top.",
          edit: "You can now edit the selected rows.",
          save: {
            message: "Holiday changes saved (frontend only).",
            validate: (row) => {
              const cells = row.querySelectorAll("td:not(.col-select)");
              const name = cells[0]?.innerText.trim();
              const date = cells[1]?.innerText.trim();
              const status = cells[2]?.innerText.trim();
              const closeTime = cells[3]?.innerText.trim();

              const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
              const isValidStatus = ["Upcoming", "Passed"].includes(status);
              const isValidTime = !closeTime || /^([01]\d|2[0-3]):(00|30)$/.test(closeTime);

              if (!name) return "Holiday name is required.";
              if (!isValidDate) return "Date must be in YYYY-MM-DD format.";
              if (!isValidStatus) return "Status must be 'Upcoming' or 'Passed'.";
              if (!isValidTime) return "Close Time must be HH:MM in 30-minute intervals or left blank.";
              return true;
            }
          }
        }
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
            table.insertBefore(cloned, table.firstChild);
          });
          undoBuffer = null;
        });
      }

    } catch (error) {
      console.error("❌ Failed to load holidays:", error);
      const table = document.getElementById("holidays-table");
      table.innerHTML = `<tr><td colspan="5">Failed to load holidays. Please try again later.</td></tr>`;
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