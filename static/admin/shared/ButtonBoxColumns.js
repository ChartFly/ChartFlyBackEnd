// static/admin/shared/ButtonBoxColumns.js

window.ButtonBoxColumns = (() => {
  function handleCellAction(section, action) {
    const state = ButtonBox.getState(section);

    if (action === "copy") {
      const selectedText = window.getSelection().toString().trim();
      if (!selectedText) {
        ButtonBox.showWarning(section, "Highlight text to Copy.");
        return;
      }

      state.clipboard = selectedText;
      state.clipboardType = "cell";
      ButtonBox.showTip(section, "Copying specific data. Use Paste to apply to another cell.");
      lockButtonsExceptPaste(section);
      enablePaste(section);
      return;
    }

    if (action === "paste" && state.clipboardType === "cell") {
      activateCellPasteMode(section);
      return;
    }

    if (!["save", "undo"].includes(action)) {
      ButtonBox.showWarning(section, `Switch to 'Edit Lines' to use ${capitalize(action)}.`);
      return;
    }
  }

  function activateCellPasteMode(section) {
    const state = ButtonBox.getState(section);
    const cells = document.querySelectorAll(`#${state.domId} td`);

    cells.forEach(cell => {
      cell.classList.add("cell-paste-ready");
      cell.addEventListener("mousedown", function handler(e) {
        if (state.clipboardType === "cell" && state.clipboard) {
          e.preventDefault();
          cell.textContent = state.clipboard;
          cell.classList.add("flash-yellow");
          setTimeout(() => cell.classList.remove("flash-yellow"), 500);
          state.clipboard = null;
          state.clipboardType = null;
          ButtonBox.showTip(section, "Cell pasted. Copy again to paste more.");
          unlockButtons(section);
          disablePaste(section);
          cells.forEach(c => c.replaceWith(c.cloneNode(true)));
        }
      }, { once: true });
    });
  }

  function lockButtonsExceptPaste(section) {
    document.querySelectorAll(`#${section}-toolbar .action-btn`).forEach(btn => {
      const id = btn.id;
      if (!id.endsWith("paste-btn")) {
        btn.disabled = true;
        btn.classList.add("disabled-btn");
      }
    });
  }

  function unlockButtons(section) {
    document.querySelectorAll(`#${section}-toolbar .action-btn`).forEach(btn => {
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
    handleCellAction
  };
})();