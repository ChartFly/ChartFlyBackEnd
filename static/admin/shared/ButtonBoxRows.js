// static/admin/shared/ButtonBoxRows.js

window.ButtonBoxRows = (() => {
  const undoStacks = {};
  const clipboards = {};

  function wireCheckboxes(section) {
    const table = document.querySelector(`#${section}-section table`);
    const checkboxes = table.querySelectorAll(`.${section}-select-checkbox`);
    ButtonBox.getState(section).selectedRows.clear();

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = checkbox.dataset.id;
        const state = ButtonBox.getState(section);
        if (checkbox.checked) {
          state.selectedRows.add(id);
        } else {
          state.selectedRows.delete(id);
        }
      });
    });
  }

  function pushUndo(section) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(state.tableId);
    const snapshot = Array.from(table.querySelectorAll("tbody tr")).map(
      (row) => row.outerHTML
    );

    if (!undoStacks[section]) undoStacks[section] = [];
    undoStacks[section].push(snapshot);
    if (undoStacks[section].length > 30) undoStacks[section].shift();
  }

  function handleRowAction(action, selectedIds, { section, tableId }) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(`❌ Table not found for section "${section}"`);
      return;
    }

    if (["add", "edit", "delete", "copy"].includes(action)) {
      pushUndo(section);
    }

    if (action === "delete") {
      selectedIds.forEach((id) => {
        const row = table.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();
      });
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

      const newId = `copy-${Date.now()}`;
      const wrapper = document.createElement("tbody");
      wrapper.innerHTML = sourceRow.outerHTML;
      const clone = wrapper.firstElementChild;

      if (!clone) return;
      clone.setAttribute("data-id", newId);
      clone.classList.add("editing");

      const checkbox = clone.querySelector("input[type='checkbox']");
      if (checkbox) {
        checkbox.setAttribute("data-id", newId);
        checkbox.checked = true;
        checkbox.className = `${section}-select-checkbox`;
      }

      const idCell = clone.querySelector(".line-id-col");
      if (idCell) idCell.textContent = newId;

      clone
        .querySelectorAll("td:not(.col-select):not(.line-id-col)")
        .forEach((cell) => {
          cell.setAttribute("contenteditable", "true");
          cell.classList.add("editable");
        });

      table.prepend(clone);
      ButtonBox.wireCheckboxes(section);
      ButtonBox.showMessage(section, "Row copied and editable.");
    }

    if (action === "paste") {
      const html = clipboards[section];
      if (!html) {
        ButtonBox.showWarning(section, "Clipboard is empty. Copy a row first.");
        return;
      }

      const newId = `paste-${Date.now()}`;
      const wrapper = document.createElement("tbody");
      wrapper.innerHTML = html;
      const clone = wrapper.firstElementChild;

      if (!clone) return;
      clone.setAttribute("data-id", newId);
      clone.classList.add("editing");

      const checkbox = clone.querySelector("input[type='checkbox']");
      if (checkbox) {
        checkbox.setAttribute("data-id", newId);
        checkbox.checked = true;
        checkbox.className = `${section}-select-checkbox`;
      }

      const idCell = clone.querySelector(".line-id-col");
      if (idCell) idCell.textContent = newId;

      clone
        .querySelectorAll("td:not(.col-select):not(.line-id-col)")
        .forEach((cell) => {
          cell.setAttribute("contenteditable", "true");
          cell.classList.add("editable");
        });

      table.prepend(clone);
      ButtonBox.wireCheckboxes(section);
    }

    if (action === "add") {
      const newId = `new-${Date.now()}`;
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

        const finalId = `saved-${Date.now()}-${i}`;
        row.setAttribute("data-id", finalId);

        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox) {
          checkbox.setAttribute("data-id", finalId);
          checkbox.checked = false;
        }

        const idCell = row.querySelector(".line-id-col");
        if (idCell) idCell.textContent = finalId;

        row.classList.remove("selected-row");
      });

      ButtonBox.wireCheckboxes(section);
      ButtonBox.showMessage(section, "Rows saved (frontend only).", "success");
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
      last.forEach((rowHTML) => {
        tbody.insertAdjacentHTML("beforeend", rowHTML);
      });

      ButtonBox.wireCheckboxes(section);
      ButtonBox.showMessage(section, "Undo successful.");
    }
  }

  return {
    handleRowAction,
    wireCheckboxes,
  };
})();
