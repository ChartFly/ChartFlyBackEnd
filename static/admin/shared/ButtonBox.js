// static/admin/shared/ButtonBox.js

window.ButtonBox = (() => {
  const sectionStates = {};
  const rotatingTips = [
    "Click a cell to edit it.",
    "Copy cell text and paste with keyboard shortcuts.",
    "Undo reverses your last change.",
    "Avoid editing IDs or checkboxes.",
    "Click a button to begin an action."
  ];
  const tipTimers = {};

  function getState(section) {
    if (!sectionStates[section]) {
      sectionStates[section] = {
        selectedRows: new Set(),
        activeAction: null,
        clipboard: null,
        clipboardType: null,
        undoStack: [],
        maxUndo: 20,
        domId: null,
        tableId: null,
        onAction: defaultHandler,
        tipIndex: 0
      };
    }
    return sectionStates[section];
  }

  function getEditMode(section) {
    const selected = document.querySelector(`input[name="${section}-edit-mode"]:checked`);
    return selected ? selected.value : "row";
  }

  function init({ section, domId, tableId, onAction }) {
    const state = getState(section);
    Object.assign(state, { domId, tableId });
    if (typeof onAction === "function") state.onAction = onAction;

    console.log(`🚀 ButtonBox initialized for section: ${section}`);
    showTip(section, rotatingTips[state.tipIndex]);
    tipTimers[section] = setInterval(() => {
      state.tipIndex = (state.tipIndex + 1) % rotatingTips.length;
      showTip(section, rotatingTips[state.tipIndex]);
    }, 60000);

    wireCheckboxes(section);
    enableCellEditing(section);
    updateUndo(section);
    updateButtonColors(section);
    setStatus(section, "none");

    setupButtons(section);
    setupIdToggle(section);
    setupKeyboardPaste(section);
  }

  function setupButtons(section) {
    const actions = ["edit", "copy", "paste", "add", "delete", "save", "undo"];
    actions.forEach(action => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (!btn) return;
      if (action === "paste") disableButton(btn);

      btn.addEventListener("click", () => {
        const state = getState(section);
        state.activeAction = action;
        setStatus(section, action);
        clearWarning(section);
        resetButtons(section, btn);

        if (["undo", "save"].includes(action)) {
          action === "undo" ? triggerUndo(section) : triggerConfirm(section);
          return;
        }

        if (action === "copy") {
          const selectedText = window.getSelection().toString().trim();
          if (!selectedText) {
            showWarning(section, "Highlight text to Copy.");
            return;
          }
          state.clipboard = selectedText;
          state.clipboardType = "cell";
          showTip(section, "Copied text. Use keyboard or Paste to apply.");
          lockButtons(section, ["paste"]);
          enableButton(document.getElementById(`${section}-paste-btn`));
        }

        if (action === "paste" && state.clipboardType === "cell") {
          showTip(section, "Click a cell or press ↓ to paste down column.");
        }

        if (!["save", "undo"].includes(action)) {
          enableConfirm(section, action);
        }
      });
    });
  }

  function enableCellEditing(section) {
    const state = getState(section);
    const table = document.getElementById(state.tableId);
    if (!table) return;

    table.addEventListener("click", (e) => {
      const cell = e.target.closest("td");
      if (!cell || cell.classList.contains("col-select") || cell.classList.contains("line-id-col")) return;

      const row = cell.closest("tr");
      const isEditable = !cell.hasAttribute("contenteditable");

      if (isEditable) {
        cell.setAttribute("contenteditable", "true");
        cell.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(cell);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      cell.addEventListener("input", () => row.classList.add("dirty"));
    });
  }

  function setupKeyboardPaste(section) {
    const state = getState(section);
    document.addEventListener("keydown", (e) => {
      if (!state.clipboard || state.clipboardType !== "cell") return;

      const sel = window.getSelection();
      const active = sel.anchorNode?.parentElement;
      if (!active || !active.isContentEditable) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const td = active.closest("td");
        const tr = td.closest("tr");
        const cellIndex = Array.from(tr.children).indexOf(td);
        const nextRow = tr.nextElementSibling;
        if (!nextRow) return;

        const nextCell = nextRow.children[cellIndex];
        if (nextCell && nextCell.isContentEditable) {
          nextCell.textContent = state.clipboard;
          nextRow.classList.add("dirty");
          nextCell.classList.add("flash-yellow");
          setTimeout(() => nextCell.classList.remove("flash-yellow"), 500);

          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(nextCell);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });
  }

  function setupIdToggle(section) {
    const state = getState(section);
    const idToggle = document.getElementById(`${section}-show-id-toggle`);
    if (!idToggle) return;

    const toggleLineIdCol = () => {
      document.querySelectorAll(`#${state.domId} .line-id-col, #${state.domId} th.line-id-col`).forEach(cell => {
        cell.style.display = idToggle.checked ? "table-cell" : "none";
      });
    };

    idToggle.addEventListener("change", toggleLineIdCol);
    toggleLineIdCol();
  }

  function setStatus(section, action) {
    const box = document.getElementById(`${section}-current-action`);
    if (box) box.textContent = capitalize(action);
  }

  function enableConfirm(section, action) {
    const btn = document.getElementById(`${section}-confirm-btn`);
    if (btn) {
      const labels = {
        add: "Confirm and Add Row",
        copy: "Confirm Copy",
        edit: "Confirm Edit",
        delete: "Confirm Delete",
        paste: "Confirm Paste",
        undo: "Confirm Undo",
        save: "Confirm Save"
      };
      btn.disabled = false;
      btn.className = "confirm-btn yellow";
      btn.textContent = labels[action] || `Confirm ${capitalize(action)}`;
      btn.onclick = () => triggerConfirm(section);
    }
  }

  function triggerConfirm(section) {
    const state = getState(section);
    const table = document.getElementById(state.tableId);
    if (!table) return;

    const snapshot = Array.from(table.querySelectorAll("tr")).map(row => row.cloneNode(true));
    if (state.undoStack.length >= state.maxUndo) state.undoStack.shift();
    state.undoStack.push(snapshot);

    state.onAction(state.activeAction, Array.from(state.selectedRows));
    state.activeAction = null;
    state.selectedRows.clear();

    document.querySelectorAll(`#${state.domId} .action-btn`).forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(`#${state.domId} tr.selected-row`).forEach(row => row.classList.remove("selected-row"));
    document.querySelectorAll(`#${state.domId} input[type="checkbox"]`).forEach(box => box.checked = false);

    updateUndo(section);
    setStatus(section, "none");

    const btn = document.getElementById(`${section}-confirm-btn`);
    if (btn) {
      btn.disabled = true;
      btn.className = "confirm-btn gray";
      btn.textContent = "Confirm";
    }
  }

  function triggerUndo(section) {
    const state = getState(section);
    const table = document.getElementById(state.tableId);
    if (!table || state.undoStack.length === 0) return;

    const last = state.undoStack.pop();
    table.innerHTML = "";
    last.forEach(row => table.appendChild(row.cloneNode(true)));

    wireCheckboxes(section);
    updateUndo(section);
    showTip(section, "Last change was undone.");
  }

  function updateUndo(section) {
    const btn = document.getElementById(`${section}-undo-btn`);
    const hasUndo = getState(section).undoStack.length > 0;
    if (btn) {
      btn.disabled = !hasUndo;
      btn.classList.toggle("disabled-btn", !hasUndo);
    }
  }

  function wireCheckboxes(section) {
    const state = getState(section);
    const checkboxes = document.querySelectorAll(`#${state.domId} input[type="checkbox"]`);
    const count = document.getElementById(`${section}-selected-count`);

    state.selectedRows.clear();

    checkboxes.forEach(box => {
      const id = box.dataset.id;
      const row = box.closest("tr");

      const newBox = box.cloneNode(true);
      box.replaceWith(newBox);

      newBox.addEventListener("change", () => {
        if (!row) return;
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

  function showTip(section, message) {
    const box = document.getElementById(`${section}-info-box`);
    const label = document.getElementById(`${section}-info-label`);
    const text = document.getElementById(`${section}-info-message`);
    if (box && label && text) {
      box.className = "info-box tip";
      label.textContent = "Tip:";
      text.textContent = message;
    }
  }

  function showWarning(section, message) {
    const box = document.getElementById(`${section}-info-box`);
    const label = document.getElementById(`${section}-info-label`);
    const text = document.getElementById(`${section}-info-message`);
    if (box && label && text) {
      box.className = "info-box warn";
      label.textContent = "Warning:";
      text.textContent = message;
    }
    if (tipTimers[section]) clearInterval(tipTimers[section]);
  }

  function clearWarning(section) {
    const state = getState(section);
    state.tipIndex = 0;
    showTip(section, rotatingTips[0]);
    if (tipTimers[section]) clearInterval(tipTimers[section]);
    tipTimers[section] = setInterval(() => {
      state.tipIndex = (state.tipIndex + 1) % rotatingTips.length;
      showTip(section, rotatingTips[state.tipIndex]);
    }, 60000);
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function defaultHandler(action, selectedIds) {
    console.warn(`⚠️ No custom handler for action "${action}".`, selectedIds);
    showTip("global", `Unhandled: ${action}`);
  }

function getSelectedIds(section) {
  return Array.from(getState(section).selectedRows);
}

  return {
    init,
    showTip,
    showWarning,
    clearWarning,
    getSelectedIds,
    wireCheckboxes,

  };
})();