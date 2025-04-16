// ============================================
// ✅ button-box-rows.js
// --------------------------------------------
// Handles row-level actions (add, edit, copy,
// paste, delete, save, undo) and checkbox logic.
// Author: Captain & Chatman
// Version: MPA Phase II — Column Count Dynamic
// ============================================

window.ButtonBoxRows = (() => {
  const undoStacks = {};
  const clipboards = {};

  function wireCheckboxes(section) {
    const state = ButtonBox.getState(section);
    if (!state) return;

    const table = document.getElementById(state.tableId);
    if (!table) return;

    const checkboxes = table.querySelectorAll(`.${section}-select-checkbox`);
    state.selectedRows.clear();

    checkboxes.forEach((checkbox) => {
      const id = checkbox.dataset.id;
      const newCheckbox = checkbox.cloneNode(true);
      checkbox.replaceWith(newCheckbox);

      newCheckbox.addEventListener("change", () => {
        if (newCheckbox.checked) {
          state.selectedRows.add(id);
        } else {
          state.selectedRows.delete(id);
        }
        ButtonBoxMessages.updateSelectedCount(section);
      });
    });

    ButtonBoxMessages.updateSelectedCount(section);
  }

  function pushUndo(section) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(state.tableId);
    if (!table) return;

    const snapshot = Array.from(table.querySelectorAll("tbody tr")).map((row) =>
      row.cloneNode(true)
    );

    if (!undoStacks[section]) undoStacks[section] = [];

    undoStacks[section].push({
      rows: snapshot,
      selected: Array.from(state.selectedRows),
    });

    if (undoStacks[section].length > 30) undoStacks[section].shift();
  }

  function handleRowAction(action, selectedIds, { section, tableId }) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(tableId);
    if (!table) return;

    if (["add", "edit", "delete", "copy", "paste"].includes(action)) {
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

      const rowHTML = sourceRow.outerHTML;
      state.clipboard = rowHTML;
      state.clipboardType = "row";

      ButtonBox.showTip(section, "Copied row. Use Paste to add duplicate.");
      ButtonBox.enablePaste(section);
    }

    if (action === "paste" && state.clipboardType === "row") {
      const tbody = table.querySelector("tbody");
      const temp = document.createElement("tbody");
      temp.innerHTML = state.clipboard;

      const clone = temp.firstElementChild;
      const clonedId = `S${Date.now()}`;
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

      if (state.clipboard) {
        const copiedRow = table.querySelector(
          `tr[data-id="${selectedIds[0]}"]`
        );
        if (copiedRow) {
          const oldCheckbox = copiedRow.querySelector("input[type='checkbox']");
          if (oldCheckbox) oldCheckbox.checked = false;
        }
      }

      tbody.prepend(clone);
      state.selectedRows.clear();
      state.selectedRows.add(clonedId);
      ButtonBox.wireCheckboxes(section);
      ButtonBoxMessages.updateSelectedCount(section);
      ButtonBox.showMessage(
        section,
        "Row pasted and ready to edit.",
        "success"
      );
    }

    if (action === "add") {
      const newId = `S${Date.now()}`;
      const newRow = document.createElement("tr");
      newRow.classList.add("editing");
      newRow.setAttribute("data-id", newId);
      newRow.setAttribute("data-index", "0");

      // Get column count dynamically
      const headerCells = table.querySelectorAll("thead th");
      const hasIdColumn =
        table.querySelector(".line-id-col")?.offsetParent !== null;
      let columnHtml = `
        <td class="col-select"><input type="checkbox" class="${section}-select-checkbox" data-id="${newId}" checked></td>
      `;

      if (hasIdColumn) {
        columnHtml += `<td class="line-id-col">${newId}</td>`;
      }

      headerCells.forEach((th) => {
        if (
          th.classList.contains("col-select") ||
          th.classList.contains("line-id-col")
        )
          return;

        columnHtml += `<td contenteditable="true" class="editable"></td>`;
      });

      newRow.innerHTML = columnHtml;

      newRow.querySelectorAll("td[contenteditable]").forEach((cell) => {
        cell.addEventListener("input", () => newRow.classList.add("dirty"));
      });

      table.querySelector("tbody").prepend(newRow);
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

      last.rows.forEach((rowNode) => {
        tbody.appendChild(rowNode.cloneNode(true));
      });

      state.selectedRows = new Set(last.selected);
      ButtonBox.wireCheckboxes(section);
      ButtonBoxMessages.updateSelectedCount(section);
      ButtonBox.showMessage(section, "Undo successful.");
    }
  }

  return {
    handleRowAction,
    wireCheckboxes,
    undoStacks,
  };
})();
