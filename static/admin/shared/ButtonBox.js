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
        state.activeAction = action;
        setStatus(section, action);
        clearWarning(section);
        resetButtons(section, btn);

        // ✅ Cell-level copy
        if (action === "copy" && window.getSelection().toString().trim()) {
          state.clipboard = window.getSelection().toString().trim();
          state.clipboardType = "cell";
          showTip(section, "Copying specific data. Use Paste to apply to another cell.");
          lockButtons(section, ["paste"]);
          enableButton(document.getElementById(`${section}-paste-btn`));
          return;
        }

        // ✅ Cell-level paste
        if (action === "paste" && state.clipboardType === "cell") {
          activateCellPasteMode(section);
          return;
        }

        // ✅ Smart: Skip confirm for these
        if (["edit", "copy", "delete"].includes(action)) {
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

    wireCheckboxes(section);
    updateUndo(section);
    setStatus(section, "none");
  }

  function activateCellPasteMode(section) {
    const state = getState(section);
    const cells = document.querySelectorAll(`#${state.domId} td`);

    cells.forEach(cell => {
      cell.classList.add("cell-paste-ready");
      cell.addEventListener("click", function cellPasteHandler(e) {
        if (state.clipboardType === "cell" && state.clipboard) {
          cell.textContent = state.clipboard;
          cell.classList.add("flash-yellow");
          setTimeout(() => cell.classList.remove("flash-yellow"), 500);

          // Reset state
          state.clipboard = null;
          state.clipboardType = null;
          showTip(section, "Cell pasted. Copy again to paste more.");
          unlockButtons(section);
          disableButton(document.getElementById(`${section}-paste-btn`));

          // Remove listeners
          cells.forEach(c => {
            c.classList.remove("cell-paste-ready");
            c.replaceWith(c.cloneNode(true)); // Removes attached events
          });
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
    const all = document.querySelectorAll(`#${section}-toolbar .action-btn`);
    all.forEach(btn => {
      if (!allow.includes(btn.id.replace(`${section}-`, "").replace("-btn", ""))) {
        btn.disabled = true;
        btn.classList.add("disabled-btn");
      }
    });
  }

  function unlockButtons(section) {
    const all = document.querySelectorAll(`#${section}-toolbar .action-btn`);
    all.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("disabled-btn");
    });
  }

  function enableButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove("disabled-btn");
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

  function disableButton(btn) {
    btn.disabled = true;
    btn.classList.add("disabled-btn");
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

    checkboxes.forEach(box => {
      const id = box.dataset.id;
      const row = box.closest("tr");

      box.addEventListener("change", () => {
        if (!row) return;
        if (box.checked) {
          state.selectedRows.add(id);
          row.classList.add("selected-row");
        } else {
          state.selectedRows.delete(id);
          row.classList.remove("selected-row");
        }
        if (count) count.textContent = state.selectedRows.size;
      });

      const cell = box.closest("td");
      if (cell) {
        cell.addEventListener("click", e => {
          if (e.target !== box) box.click();
        });
      }
    });

    if (count) count.textContent = state.selectedRows.size;
  }

  function setStatus(section, action) {
    const actionBox = document.getElementById(`${section}-current-action`);
    if (actionBox) actionBox.textContent = capitalize(action);
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