// static/admin/shared/ButtonBox.js

window.ButtonBox = (() => {
  const sectionStates = {};
  const rotatingTips = [
    "Click a button to begin an action.",
    "Select rows before editing or deleting.",
    "Paste only works after you Copy.",
    "Undo will reverse your last change.",
    "You can copy/paste individual cell text!"
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

    const actions = ["edit", "copy", "paste", "add", "delete", "save", "undo"];
    actions.forEach(action => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (!btn) return;
      if (action === "paste") disableButton(btn);

      btn.addEventListener("click", () => {
        console.log(`👉 [${section}] Button clicked: ${action}`);
        state.activeAction = action;
        setStatus(section, action);
        clearWarning(section);
        resetButtons(section, btn);

        const mode = getEditMode(section);
        console.log(`✏️ Mode is: ${mode}`);

        if (mode === "cell") {
          if (action === "copy") {
            const selectedText = window.getSelection().toString().trim();
            if (!selectedText) {
              showWarning(section, "Highlight text to Copy.");
              return;
            }
            state.clipboard = selectedText;
            state.clipboardType = "cell";
            showTip(section, "Copying specific data. Use Paste to apply to another cell.");
            lockButtons(section, ["paste"]);
            enableButton(document.getElementById(`${section}-paste-btn`));
            return;
          }

          if (action === "paste" && state.clipboardType === "cell") {
            activateCellPasteMode(section);
            return;
          }

          if (!["save", "undo"].includes(action)) {
            showWarning(section, `Switch to 'Edit Lines' to use ${capitalize(action)}.`);
            return;
          }
        }

        if (["edit", "copy", "delete"].includes(action)) {
          if (mode === "cell") {
            showWarning(section, `Switch to 'Edit Lines' to use ${capitalize(action)}.`);
            return;
          }
          if (state.selectedRows.size === 0) {
            showWarning(section, `Please select one or more rows to ${action}.`);
            return;
          }
          setTimeout(() => {
            state.onAction(action, Array.from(state.selectedRows));
          }, 10);
          return;
        }

        if (action === "undo") return triggerUndo(section);
        if (action === "save") return triggerConfirm(section);

        enableConfirm(section, action);
      });
    });

    const idToggle = document.getElementById(`${section}-show-id-toggle`);
    if (idToggle) {
      idToggle.addEventListener("change", () => {
        document.querySelectorAll(`#${state.tableId} .line-id-col`).forEach(col => {
          col.style.display = idToggle.checked ? "" : "none";
        });
      });
    }

    const modeRadios = document.querySelectorAll(`input[name="${section}-edit-mode"]`);
    modeRadios.forEach(radio => {
      radio.addEventListener("change", () => {
        updateButtonColors(section);
      });
    });

    updateButtonColors(section);
    wireCheckboxes(section);
    updateUndo(section);
    setStatus(section, "none");
  }

  function updateButtonColors(section) {
    const isCell = getEditMode(section) === "cell";
    document.querySelectorAll(`#${section}-toolbar .action-btn`).forEach(btn => {
      btn.classList.toggle("cell-mode", isCell);
    });
  }

  function setStatus(section, action) {
    const box = document.getElementById(`${section}-current-action`);
    if (box) box.textContent = capitalize(action);
  }

  function activateCellPasteMode(section) {
    const state = getState(section);
    const cells = document.querySelectorAll(`#${state.domId} td`);

    cells.forEach(cell => {
      cell.classList.add("cell-paste-ready");
      cell.addEventListener("click", function handler() {
        if (state.clipboardType === "cell" && state.clipboard) {
          cell.textContent = state.clipboard;
          cell.classList.add("flash-yellow");
          setTimeout(() => cell.classList.remove("flash-yellow"), 500);
          state.clipboard = null;
          state.clipboardType = null;
          showTip(section, "Cell pasted. Copy again to paste more.");
          unlockButtons(section);
          disableButton(document.getElementById(`${section}-paste-btn`));
          cells.forEach(c => c.replaceWith(c.cloneNode(true)));
        }
      }, { once: true });
    });
  }

  function resetButtons(section, activeBtn) {
    const actions = ["edit", "copy", "paste", "add", "delete", "save", "undo"];
    actions.forEach(action => {
      const otherBtn = document.getElementById(`${section}-${action}-btn`);
      if (otherBtn) otherBtn.classList.remove("active");
    });
    if (activeBtn) activeBtn.classList.add("active");
  }

  function lockButtons(section, allow = []) {
    document.querySelectorAll(`#${section}-toolbar .action-btn`).forEach(btn => {
      const key = btn.id.replace(`${section}-`, "").replace("-btn", "");
      if (!allow.includes(key)) {
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

  function enableButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove("disabled-btn");
  }

  function disableButton(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add("disabled-btn");
  }

  function enableConfirm(section, action) {
    const btn = document.getElementById(`${section}-confirm-btn`);
    if (btn) {
      const labels = {
        add: "Confirm and Make Editable",
        copy: "Confirm and Make Editable",
        edit: "Confirm and Make Editable",
        delete: "Confirm and Delete",
        paste: "Confirm and Paste",
        undo: "Confirm and Undo",
        save: "Confirm and Save"
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

  function getSelectedIds(section) {
    return Array.from(getState(section).selectedRows);
  }


  function defaultHandler(action, selectedIds) {
    console.warn(`⚠️ No custom handler for action "${action}".`, selectedIds);
    showTip("global", `Unhandled: ${action}`);
  }


  return {
    init,
    showTip,
    showWarning,
    clearWarning,
    getSelectedIds,
    wireCheckboxes
  };
})();