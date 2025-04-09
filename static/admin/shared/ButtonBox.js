// static/admin/shared/ButtonBox.js

window.ButtonBox = (() => {
  const stateMap = new Map();

  function init(config) {
    const {
      section,
      tableId,
      domId,
      tipBoxId,
      warningBoxId,
      footerId,
      enabledActions,
      onAction,
    } = config;

    const state = {
      section,
      tableId,
      domId,
      tipBoxId,
      warningBoxId,
      footerId,
      enabledActions,
      selectedRows: new Set(),
      onAction,
    };

    stateMap.set(section, state);
    wireButtons(state);
  }

  function getState(section) {
    return stateMap.get(section);
  }

  function wireButtons(state) {
    const { section, enabledActions } = state;

    enabledActions.forEach((action) => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (!btn) return;

      btn.addEventListener("click", () => {
        const selectedIds = Array.from(state.selectedRows);
        if (typeof state.onAction === "function") {
          state.onAction(action, selectedIds);
        }
      });
    });
  }

  function wireCheckboxes(section) {
    const table = document.getElementById(`${section}-table`);
    if (!table) {
      console.error(`❌ Table not found for section "${section}"`);
      return;
    }

    const checkboxes = table.querySelectorAll(`.${section}-select-checkbox`);
    const state = getState(section);
    state.selectedRows.clear();

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = checkbox.dataset.id;
        if (checkbox.checked) {
          state.selectedRows.add(id);
        } else {
          state.selectedRows.delete(id);
        }
      });
    });
  }

  function handleRowAction(action, selectedIds, section) {
    const table = document.getElementById(`${section}-table`);
    if (!table) {
      console.error(`❌ Table not found for section "${section}"`);
      return;
    }

    if (action === "delete") {
      selectedIds.forEach((id) => {
        const row = table.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();
      });
      wireCheckboxes(section);
    }

    if (action === "copy") {
      if (selectedIds.length !== 1) {
        showWarning(section, "Please select exactly one row to copy.");
        return;
      }

      const sourceRow = table.querySelector(`tr[data-id="${selectedIds[0]}"]`);
      if (!sourceRow) return;

      const newId = `copy-${Date.now()}`;
      const clone = sourceRow.cloneNode(true);
      clone.setAttribute("data-id", newId);
      clone.classList.add("editing");

      const checkbox = clone.querySelector("input[type='checkbox']");
      if (checkbox) {
        checkbox.setAttribute("data-id", newId);
        checkbox.checked = true;
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
      wireCheckboxes(section);
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
      wireCheckboxes(section);
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

      wireCheckboxes(section);
      showMessage(section, "Rows saved (frontend only).", "success");
    }

    if (action === "paste") {
      showWarning(section, "Paste is not implemented yet.");
    }
  }

  function showWarning(section, message) {
    console.warn(`[${section}] ⚠️ ${message}`);
    // TODO: UI update
  }

  function showMessage(section, message) {
    console.log(`[${section}] ✅ ${message}`);
    // TODO: UI update
  }

  return {
    init,
    getState,
    wireCheckboxes,
    handleRowAction,
    showWarning,
    showMessage,
  };
})();
