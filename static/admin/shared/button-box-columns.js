// ============================================
// ✅ button-box-columns.js
// --------------------------------------------
// Handles cell-level Copy/Paste logic for
// Edit Columns mode in ButtonBox
// Author: Captain & Chatman
// Version: MPA Phase IV — Single Cell Focus
// ============================================

window.ButtonBoxColumns = (() => {
  const cellUndoMap = new Map();

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
      `Switch to 'Edit Rows' to use ${capitalize(action)}.`
    );
  }

  function activateHeaderClicks(section) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(state.tableId);
    if (!table) return;

    const headers = table.querySelectorAll("thead th");

    headers.forEach((header, index) => {
      if (
        header.classList.contains("col-select") ||
        header.classList.contains("line-id-col")
      )
        return;

      header.addEventListener("click", () => {
        if (ButtonBox.getEditMode(section) !== "cell") return; // 🛑 Ignore if not in Orange Mode

        const prev = state.activeEditableColumnIndex ?? -1;

        if (index === prev) {
          clearActiveColumn(table);
          state.activeEditableColumnIndex = null;
          ButtonBox.showTip(section, "Column deselected.");
          return;
        }

        clearActiveColumn(table);
        state.activeEditableColumnIndex = index;

        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const cell = row.cells[index];
          if (!cell) return;

          if (
            cell.classList.contains("col-select") ||
            cell.classList.contains("line-id-col")
          )
            return;

          cell.classList.add("editable-col-cell");

          cell.addEventListener("click", (e) => {
            activateSingleEditableCell(cell, section);
          });
        });

        ButtonBox.showTip(
          section,
          `Column ${index + 1} activated. Click a cell to edit.`
        );

        // Optional: Auto-focus first cell
        const firstRow = table.querySelector("tbody tr");
        if (firstRow && firstRow.cells[index]) {
          activateSingleEditableCell(firstRow.cells[index], section);
        }

        // Add arrow key navigation
        table.addEventListener("keydown", (e) => {
          if (!["ArrowUp", "ArrowDown"].includes(e.key)) return;
          e.preventDefault();
          navigateColumnCells(table, section, index, e.key === "ArrowDown");
        });
      });
    });
  }

  function activateSingleEditableCell(cell, section) {
    const table = cell.closest("table");
    if (!table) return;

    table.querySelectorAll("td").forEach((td) => {
      td.removeAttribute("contenteditable");
      td.classList.remove("editable-focus-cell");
    });

    cell.setAttribute("contenteditable", "true");
    cell.classList.add("editable-focus-cell");

    cell.focus();

    cell.addEventListener("input", () => {
      pushCellUndo(section, cell);
      cell.classList.add("dirty");
    });
  }

  function navigateColumnCells(table, section, columnIndex, moveDown) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const currentCell = table.querySelector(".editable-focus-cell");
    if (!currentCell) return;

    const currentRowIndex = rows.findIndex((row) => row.contains(currentCell));

    const nextIndex = moveDown ? currentRowIndex + 1 : currentRowIndex - 1;
    if (nextIndex < 0 || nextIndex >= rows.length) return;

    const nextCell = rows[nextIndex].cells[columnIndex];
    if (nextCell) activateSingleEditableCell(nextCell, section);
  }

  function clearActiveColumn(table) {
    table.querySelectorAll("thead th").forEach((th) => {
      th.classList.remove("editable-col");
    });
    table.querySelectorAll("tbody td").forEach((td) => {
      td.classList.remove(
        "editable-col-cell",
        "editable-focus-cell",
        "cell-paste-ready"
      );
      td.removeAttribute("contenteditable");
    });
  }

  function activateCellPasteMode(section) {
    const state = ButtonBox.getState(section);
    const table = document.getElementById(state.tableId);
    if (!table || !state.clipboard) return;

    const columnIndex = state.activeEditableColumnIndex;
    if (columnIndex === undefined || columnIndex < 0) {
      ButtonBox.showWarning(section, "Click a column header to activate it.");
      return;
    }

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cell = row.cells[columnIndex];
      if (
        !cell ||
        cell.classList.contains("line-id-col") ||
        cell.classList.contains("col-select")
      )
        return;

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

  function pushCellUndo(section, cell) {
    if (!cellUndoMap.has(section)) cellUndoMap.set(section, []);
    const stack = cellUndoMap.get(section);
    stack.push({
      cell,
      prevValue: cell.textContent,
    });
    if (stack.length > 30) stack.shift();

    if (stack.length === 30) {
      showUndoLimit(section, true);
    }

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

    if (stack.length < 30) {
      showUndoLimit(section, false);
    }

    console.log(`↩️ Cell undo applied (${stack.length} left)`);
  }

  function showUndoLimit(section, isMax) {
    const box = document.getElementById(`${section}-undo-limit-box`);
    if (!box) return;
    box.textContent = isMax ? "Warning: Max Undo 30" : "";
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
    activateHeaderClicks,
  };
})();
