// static/admin/shared/ButtonBox.js

window.ButtonBox = (() => {
  const sectionStates = {};
  const rotatingTips = [
    "Click a button to begin an action.",
    "Select rows before editing or deleting.",
    "Paste only works after you Copy.",
    "Undo will reverse your last change."
  ];
  const tipTimers = {};

  function getState(section) {
    if (!sectionStates[section]) {
      sectionStates[section] = {
        selectedRows: new Set(),
        activeAction: null,
        clipboard: null,
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

    // 🔄 Start rotating tips
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

        actions.forEach(a => {
          const otherBtn = document.getElementById(`${section}-${a}-btn`);
          if (otherBtn) otherBtn.classList.remove("active");
        });

        btn.classList.add("active");

        if (action === "undo") return triggerUndo(section);
        if (action === "save") return triggerConfirm(section);

        if (action === "paste" && !state.clipboard) {
          showWarning(section, "Paste requires a copied row.");
          return;
        }

        if (!["add", "paste"].includes(action) && state.selectedRows.size === 0) {
          showWarning(section, "Please select one or more rows first.");
          return;
        }

        if (action === "copy") {
         // Slight delay ensures checkbox selection is finalized
        setTimeout(() => {
        state.onAction("copy", Array.from(state.selectedRows));
        }, 10);
        return;
}

if (action === "edit") {
  state.onAction("edit", Array.from(state.selectedRows));
  return;
}


        enableConfirm(section, action);
      });
    });

    wireCheckboxes(section);
    updateUndo(section);
    setStatus(section, "none");
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

    // 🔁 Stop tip rotation temporarily
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
      const actionLabels = {
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
      btn.textContent = actionLabels[action] || `Confirm ${capitalize(action)}`;
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

    document.querySelectorAll(`#${state.domId} .action-btn`).forEach(btn =>
      btn.classList.remove("active")
    );
    document.querySelectorAll(`#${state.domId} tr.selected-row`).forEach(row =>
      row.classList.remove("selected-row")
    );
    document.querySelectorAll(`#${state.domId} input[type="checkbox"]`).forEach(box =>
      (box.checked = false)
    );

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