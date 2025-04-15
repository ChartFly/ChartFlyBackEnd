// ============================================
// ✅ button-box-columns.js
// --------------------------------------------
// Handles cell-level Copy/Paste logic for
// Edit Cells & Columns mode in ButtonBox
// Author: Captain & Chatman
// Version: MPA Phase I (Orange Mode Finalized)
// ============================================

window.ButtonBoxColumns = (() => {
  const cellUndoMap = new Map(); // Track up to 30 past cell states per section

  function handleCellAction(section, action) {
    const state = ButtonBox.getState(section);
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";

    if (action === "copy") {
      if (!selectedText) {
        ButtonBox.showWarning(section, "Highlight text to Copy.");
        return;
      }

      state.clipboard = selectedText;
      state.clipboardType = "cell";
      ButtonBox.showTip(
        section,
        "Copying specific data. Use Paste to apply to another cell."
      );
      lockButtonsExceptPaste(section);
      enablePaste(section);
      return;
    }

    if (action === "paste" && state.clipboardType === "cell") {
      activateCellPasteMode(section);
      return;
    }

    if (action === "undo") {
      undoLastCellEdit(section);
      return;
    }

    if (action === "save") {
      ButtonBox.showMessage(
        section,
        "Cell edits saved (frontend only).",
        "success"
      );
      return;
    }

    ButtonBox.showWarning(
      section,
      `Switch to 'Edit Lines' to use ${capitalize(action)}.`
    );
  }

  function activateCellPasteMode(section) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(state.tableId);
    if (!table || !state.clipboard) return;

    const columnIndex = getSelectedColumnIndex(table);
    if (columnIndex === -1) {
      ButtonBox.showWarning(
        section,
        "Click a column header to activate it first."
      );
      return;
    }

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cell = row.cells[columnIndex];
      if (!cell) return;

      cell.classList.add("cell-paste-ready");
      cell.addEventListener(
        "mousedown",
        function handler(e) {
          e.preventDefault();
          pushCellUndo(section, cell);
          cell.textContent = state.clipboard;
          cell.classList.add("flash-yellow");
          setTimeout(() => cell.classList.remove("flash-yellow"), 500);
        },
        { once: true }
      );
    });

    ButtonBox.showTip(
      section,
      "Click cells in the column to paste repeatedly."
    );
  }

  function getSelectedColumnIndex(table) {
    const headers = table.querySelectorAll("thead th");
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].classList.contains("editable-col")) {
        return i;
      }
    }
    return -1;
  }

  function pushCellUndo(section, cell) {
    if (!cellUndoMap.has(section)) cellUndoMap.set(section, []);
    const stack = cellUndoMap.get(section);
    stack.push({
      cell,
      prevValue: cell.textContent,
    });
    if (stack.length > 30) stack.shift();
    console.log(`🧠 Cell undo pushed (${stack.length})`);
  }

  function undoLastCellEdit(section) {
    const stack = cellUndoMap.get(section);
    if (!stack || stack.length === 0) {
      ButtonBox.showWarning(section, "Nothing to undo.");
      return;
    }

    const last = stack.pop();
    last.cell.textContent = last.prevValue;
    last.cell.classList.add("flash-yellow");
    setTimeout(() => last.cell.classList.remove("flash-yellow"), 500);

    if (stack.length === 30) {
      showUndoLimit(section, false); // Reset if backing off max
    }

    console.log(`↩️ Cell undo applied (${stack.length} left)`);
  }

  function showUndoLimit(section, isMax) {
    const box = document.getElementById(`${section}-undo-limit-box`);
    if (!box) return;
    box.textContent = isMax ? "Max Undo 30" : "";
    box.className = isMax ? "undo-limit-box warn" : "undo-limit-box";
  }

  function lockButtonsExceptPaste(section) {
    document
      .querySelectorAll(`#${section}-toolbar .action-btn`)
      .forEach((btn) => {
        const id = btn.id;
        if (!id.endsWith("paste-btn")) {
          btn.disabled = true;
          btn.classList.add("disabled-btn");
        }
      });
  }

  function unlockButtons(section) {
    document
      .querySelectorAll(`#${section}-toolbar .action-btn`)
      .forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove("disabled-btn");
      });
  }

  function enablePaste(section) {
    const pasteBtn = document.getElementById(`${section}-paste-btn`);
    if (pasteBtn) {
      pasteBtn.disabled = false;
      pasteBtn.classList.remove("disabled-btn");
    }
  }

  function disablePaste(section) {
    const pasteBtn = document.getElementById(`${section}-paste-btn`);
    if (pasteBtn) {
      pasteBtn.disabled = true;
      pasteBtn.classList.add("disabled-btn");
    }
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return {
    handleCellAction,
    pushCellUndo,
    undoLastCellEdit,
    showUndoLimit,
  };
})();
