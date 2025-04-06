// static/admin/shared/ButtonBoxRows.js

window.ButtonBoxRows = (() => {
  function handleRowAction(section, action) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(state.tableId);
    if (!table) return;

    if (["edit", "copy", "delete"].includes(action)) {
      if (state.selectedRows.size === 0) {
        ButtonBox.showWarning(section, `Please select one or more rows to ${action}.`);
        return;
      }
    }

    switch (action) {
      case "edit":
        state.selectedRows.forEach(id => {
          const row = table.querySelector(`tr[data-id="${id}"]`);
          if (!row) return;
          row.classList.add("editing", "dirty");
          row.querySelectorAll("td:not(.col-select):not(.line-id-col)").forEach(cell => {
            cell.setAttribute("contenteditable", "true");
            cell.classList.add("editable");
          });
        });
        ButtonBoxMessages.enableConfirm(section, action);
        break;

      case "copy":
        if (state.selectedRows.size !== 1) {
          ButtonBox.showWarning(section, "Please select exactly one row to copy.");
          return;
        }
        const copyId = [...state.selectedRows][0];
        const sourceRow = table.querySelector(`tr[data-id="${copyId}"]`);
        if (!sourceRow) return;

        const newId = `copy-${Date.now()}`;
        const clone = sourceRow.cloneNode(true);
        clone.setAttribute("data-id", newId);
        clone.classList.add("editing", "dirty");
        clone.querySelectorAll("td").forEach((cell, i) => {
          if (i === 0) {
            const cb = cell.querySelector("input");
            if (cb) {
              cb.checked = true;
              cb.setAttribute("data-id", newId);
            }
          } else {
            cell.setAttribute("contenteditable", "true");
            cell.classList.add("editable");
          }
        });
        const idCell = clone.querySelector(".line-id-col");
        if (idCell) idCell.textContent = newId;
        table.prepend(clone);
        ButtonBox.wireCheckboxes(section);
        ButtonBoxMessages.enableConfirm(section, action);
        break;

      case "add":
        const id = `new-${Date.now()}`;
        const row = document.createElement("tr");
        row.setAttribute("data-id", id);
        row.classList.add("editing", "dirty");

        row.innerHTML = `
          <td class="col-select">
            <input type="checkbox" class="holiday-select-checkbox" data-id="${id}" checked>
          </td>
          <td class="line-id-col">${id}</td>
          <td contenteditable="true" class="editable">Edit</td>
          <td contenteditable="true" class="editable">YYYY-MM-DD</td>
          <td contenteditable="true" class="editable">Upcoming</td>
          <td contenteditable="true" class="editable"></td>
        `;
        table.prepend(row);
        ButtonBox.wireCheckboxes(section);
        ButtonBoxMessages.enableConfirm(section, action);
        break;

      case "delete":
        state.selectedRows.forEach(id => {
          const row = table.querySelector(`tr[data-id="${id}"]`);
          if (row) row.remove();
        });
        state.selectedRows.clear();
        ButtonBox.wireCheckboxes(section);
        ButtonBoxMessages.enableConfirm(section, action);
        break;

      case "save":
        const dirtyRows = table.querySelectorAll("tr.dirty");
        dirtyRows.forEach((row, i) => {
          row.classList.remove("editing", "dirty");
          row.querySelectorAll("td[contenteditable]").forEach(cell => {
            cell.removeAttribute("contenteditable");
            cell.classList.remove("editable");
          });
          const finalId = `saved-${Date.now()}-${i}`;
          row.setAttribute("data-id", finalId);
          const cb = row.querySelector("input[type='checkbox']");
          if (cb) cb.setAttribute("data-id", finalId);
          const idCell = row.querySelector(".line-id-col");
          if (idCell) idCell.textContent = finalId;
        });
        state.selectedRows.clear();
        ButtonBox.wireCheckboxes(section);
        ButtonBoxMessages.showTip(section, "Rows saved (frontend only).");
        break;

      case "undo":
        const last = state.undoStack.pop();
        if (!last) {
          ButtonBoxMessages.showWarning(section, "Nothing to undo.");
          return;
        }
        table.innerHTML = "";
        last.forEach(row => table.appendChild(row.cloneNode(true)));
        ButtonBox.wireCheckboxes(section);
        ButtonBoxMessages.updateUndo(section);
        ButtonBoxMessages.showTip(section, "Last change was undone.");
        break;

      default:
        console.warn(`Unhandled row action: ${action}`);
        break;
    }
  }

  function wireCheckboxes(section) {
    const state = ButtonBox.getState(section);
    const checkboxes = document.querySelectorAll(`#${state.domId} input[type="checkbox"]`);
    const count = document.getElementById(`${section}-selected-count`);
    state.selectedRows.clear();

    checkboxes.forEach(box => {
      const id = box.dataset.id;
      const row = box.closest("tr");
      const newBox = box.cloneNode(true);
      box.replaceWith(newBox);

      newBox.addEventListener("change", () => {
        if (newBox.checked) {
          state.selectedRows.add(id);
          row.classList.add("selected-row");
        } else {
          state.selectedRows.delete(id);
          row.classList.remove("selected-row");
        }
        if (count) count.textContent = state.selectedRows.size;
      });

      const cell = newBox.closest("td");
      if (cell) {
        cell.addEventListener("click", e => {
          if (e.target !== newBox) newBox.click();
        });
      }

      if (newBox.checked) {
        state.selectedRows.add(id);
        row.classList.add("selected-row");
      }
    });

    if (count) count.textContent = state.selectedRows.size;
  }

  return {
    handleRowAction,
    wireCheckboxes
  };
})();