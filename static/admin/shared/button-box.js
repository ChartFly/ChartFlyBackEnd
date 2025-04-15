// ============================================
// ✅ button-box-rows.js
// --------------------------------------------
// Shared row-level actions: add, edit, copy,
// delete, undo, save for admin sections
// Author: Captain & Chatman
// Version: MPA Phase I (API Add Patch Edition)
// ============================================

window.ButtonBoxRows = (() => {
  const undoMap = new Map();

  function handleRowAction(action, selectedIds, config) {
    const { section, tableId } = config;
    const table = document.getElementById(tableId);
    const tbody = table?.querySelector("tbody");
    if (!tbody) return;

    saveUndoState(section, tbody);

    switch (action) {
      case "add":
        const newRow = createEditableRow(section);
        if (newRow) {
          tbody.insertBefore(newRow, tbody.firstChild);
        }
        break;

      case "undo":
        restoreUndoState(section, tbody);
        break;

      default:
        console.log(`⚠️ Action not yet implemented: ${action}`);
    }
  }

  function saveUndoState(section, tbody) {
    const clone = tbody.cloneNode(true);
    undoMap.set(section, clone);
    console.log(`💾 Undo state saved for ${section}`);
  }

  function restoreUndoState(section, tbody) {
    const saved = undoMap.get(section);
    if (!saved) {
      console.warn(`⚠️ No undo state to restore for ${section}`);
      return;
    }
    tbody.replaceWith(saved.cloneNode(true));
    undoMap.delete(section);
    ButtonBox.wireCheckboxes(section);
    console.log(`↩️ Undo restored for ${section}`);
  }

  function createEditableRow(section) {
    const row = document.createElement("tr");

    if (section === "api") {
      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="new" /></td>
        <td class="id-col hidden-col">New</td>
        <td><input type="text" placeholder="Label" /></td>
        <td><input type="text" placeholder="Key Type" /></td>
        <td><input type="text" placeholder="Billing" /></td>
        <td><input type="number" placeholder="Monthly" /></td>
        <td><input type="number" placeholder="Yearly" /></td>
        <td><input type="number" placeholder="Limit/Sec" /></td>
        <td><input type="number" placeholder="Limit/Min" /></td>
        <td><input type="number" placeholder="Limit/5m" /></td>
        <td><input type="number" placeholder="Limit/Hour" /></td>
        <td><input type="number" placeholder="Priority" /></td>
        <td>
          <select>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </td>
      `;
    } else {
      console.warn(`⚠️ createEditableRow not implemented for: ${section}`);
      return null;
    }

    row.classList.add("editable-row");
    return row;
  }

  return {
    handleRowAction,
  };
})();
