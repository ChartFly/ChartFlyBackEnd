// static/admin/shared/ButtonBoxRows.js

window.ButtonBoxRows = (() => {
  const undoStacks = {}; // Holds up to 30 snapshots per section (rows + selectedRows)

  function wireCheckboxes(section) {
    const table = document.querySelector(`#${section}-section table`);
    const checkboxes = table.querySelectorAll(`.${section}-select-checkbox`);
    const state = ButtonBox.getState(section);
    if (!state) return;

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = checkbox.dataset.id;
        if (checkbox.checked) {
          state.selectedRows.add(id);
        } else {
          state.selectedRows.delete(id);
        }
        ButtonBoxMessages.updateSelectedCount(section);
      });
    });
  }

  function pushUndo(section) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(state.tableId);
    const snapshot = Array.from(table.querySelectorAll("tbody tr")).map(
      (row) => row.outerHTML
    );

    if (!undoStacks[section]) {
      undoStacks[section] = [];
      console.log(`[UNDO] Initialized undo stack for: ${section}`);
    }

    undoStacks[section].push({
      rows: snapshot,
      selected: Array.from(state.selectedRows),
    });

    if (undoStacks[section].length > 30) undoStacks[section].shift();

    console.log(
      `[UNDO] Pushed snapshot. Stack size: ${undoStacks[section].length}`
    );
  }

  function handleRowAction(action, selectedIds, { section, tableId }) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(
        `❌ Table not found for section "${section}" using ID "${tableId}"`
      );
      return;
    }

    if (["add", "edit", "delete", "copy"].includes(action)) {
      pushUndo(section);
    }

    if (action === "delete") {
      selectedIds.forEach((id) => {
        const row = table.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();
        state.selectedRows.delete(id);
      });
      ButtonBoxMessages.updateSelectedCount(section);
      ButtonBox.wireCheckboxes(section);
    }

    if (action === "copy") {
      if (selectedIds.length !== 1) {
        ButtonBox.showWarning(
          section,
          "Please select exactly one row to copy."
        );
        return;
      }

      const sourceRow = table.querySelector(`tr[data-id="${selectedIds[0]}"]`);
      if (!sourceRow) return;

      const clonedId = `S${Date.now()}`;
      const clone = sourceRow.cloneNode(true);
      clone.setAttribute("data-id", clonedId);
      clone.classList.add("editing");

      const checkbox = clone.querySelector("input[type='checkbox']");
      if (checkbox) {
        checkbox.setAttribute("data-id", clonedId);
        checkbox.checked = true;
        checkbox.className = `${section}-select-checkbox`;
      }

      const idCell = clone.querySelector(".line-id-col");
      if (idCell) idCell.textContent = clonedId;

      clone
        .querySelectorAll("td:not(.col-select):not(.line-id-col)")
        .forEach((cell) => {
          cell.setAttribute("contenteditable", "true");
          cell.classList.add("editable");
        });

      const originalCheckbox = sourceRow.querySelector(
        "input[type='checkbox']"
      );
      if (originalCheckbox) originalCheckbox.checked = false;
      state.selectedRows.delete(selectedIds[0]);

      table.prepend(clone);
      state.selectedRows.add(clonedId);
      ButtonBoxMessages.updateSelectedCount(section);
      ButtonBox.wireCheckboxes(section);
    }

    if (action === "add") {
      const newId = `S${Date.now()}`;
      const newRow = document.createElement("tr");
      newRow.classList.add("editing");
      newRow.setAttribute("data-id", newId);
      newRow.setAttribute("data-index", "0");

      newRow.innerHTML = `
        <td class="col-select"><input type="checkbox" class="${section}-select-checkbox" data-id="${newId}" checked></td>
        <td class="line-id-col">${newId}</td>
        <td contenteditable="true" class="editable">Edit</td>
        <td contenteditable="true" class="editable">YYYY-MM-DD</td>
        <td contenteditable="true" class="editable">Upcoming</td>
        <td contenteditable="true" class="editable"></td>
      `;

      newRow.querySelectorAll("td[contenteditable]").forEach((cell) => {
        cell.addEventListener("input", () => newRow.classList.add("dirty"));
      });

      table.prepend(newRow);
      state.selectedRows.add(newId);
      ButtonBoxMessages.updateSelectedCount(section);
      ButtonBox.wireCheckboxes(section);
    }

    if (action === "edit") {
      selectedIds.forEach((id) => {
        const row = table.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;

        row.classList.add("editing", "dirty");
        row
          .querySelectorAll("td:not(.col-select):not(.line-id-col)")
          .forEach((cell) => {
            cell.setAttribute("contenteditable", "true");
            cell.classList.add("editable");
          });
      });
    }

    if (action === "save") {
      const dirtyRows = table.querySelectorAll("tr.editing");

      dirtyRows.forEach((row, i) => {
        row.classList.remove("editing", "dirty");

        row.querySelectorAll("td[contenteditable]").forEach((cell) => {
          cell.removeAttribute("contenteditable");
          cell.classList.remove("editable");
        });

        const finalId = `S${Date.now()}${i}`;
        row.setAttribute("data-id", finalId);

        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox) {
          checkbox.setAttribute("data-id", finalId);
          checkbox.checked = false;
          checkbox.className = `${section}-select-checkbox`;
        }

        const idCell = row.querySelector(".line-id-col");
        if (idCell) idCell.textContent = finalId;

        row.classList.remove("selected-row");
      });

      state.selectedRows.clear();
      ButtonBoxMessages.updateSelectedCount(section);
      ButtonBox.wireCheckboxes(section);
      ButtonBox.showMessage(section, "Rows saved (frontend only).", "success");

      const confirmBtn = document.getElementById(`${section}-confirm-btn`);
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.className = "confirm-btn gray";
        confirmBtn.textContent = "Confirm";
      }
    }

    if (action === "undo") {
      const stack = undoStacks[section];
      if (!stack || stack.length === 0) {
        ButtonBox.showWarning(section, "Nothing to undo.");
        return;
      }

      const last = stack.pop();
      const tbody = table.querySelector("tbody");
      tbody.innerHTML = "";

      last.rows.forEach((rowHTML, i) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = rowHTML.trim();
        const restoredRow = tempDiv.querySelector("tr");
        if (!restoredRow) return;

        // Clean any leftover junk
        restoredRow.classList.remove("editing", "dirty");

        // Rewire checkbox
        const checkbox = restoredRow.querySelector("input[type='checkbox']");
        if (checkbox) {
          checkbox.className = `${section}-select-checkbox`;
          checkbox.addEventListener("change", () => {
            const id = checkbox.dataset.id;
            if (checkbox.checked) {
              state.selectedRows.add(id);
            } else {
              state.selectedRows.delete(id);
            }
            ButtonBoxMessages.updateSelectedCount(section);
          });
        }

        // Reattach
        tbody.appendChild(restoredRow);
        console.log(`[UNDO] Inserted row ${i + 1}`);
      });

      // Restore selected row state
      state.selectedRows = new Set(last.selected);
      ButtonBoxMessages.updateSelectedCount(section);
      ButtonBox.showMessage(section, "Undo successful.");
    }
  }

  return {
    handleRowAction,
    wireCheckboxes,
    undoStacks, // 👀 Still inspectable
  };
})();
