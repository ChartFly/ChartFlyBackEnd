// static/admin/shared/ButtonBox.js

window.ButtonBox = (() => {
  const sectionStates = {};
  const tipIntervalMs = 60000;

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
        confirmBoxId: null,
        messageBoxId: null,
        footerBoxId: null,
        tips: [
          "Check one or more rows before clicking an action.",
          "Use Copy → Edit → Save to duplicate and modify entries.",
          "Undo supports up to 20 levels of rollback.",
          "Paste only works after Copy. Use wisely!"
        ],
        tipIndex: 0,
        tipTimer: null,
        onAction: defaultHandler
      };
    }
    return sectionStates[section];
  }

  function init({ section, domId, tableId, confirmBoxId, messageBoxId, footerBoxId, onAction }) {
    const state = getState(section);
    Object.assign(state, { domId, tableId, confirmBoxId, messageBoxId, footerBoxId });

    if (typeof onAction === "function") state.onAction = onAction;

    console.log(`🚀 ButtonBox initialized for section: ${section}`);

    setupButtons(section);
    updateUndoButton(section);
    updateFooter(section);
    wireCheckboxes(section);
    cycleTips(section);
  }

  function setupButtons(section) {
    const actions = ["edit", "copy", "paste", "add", "delete", "save", "undo"];
    const state = getState(section);

    actions.forEach(action => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (!btn) return;

      if (action === "paste") {
        btn.disabled = true;
        btn.classList.add("disabled-btn");
      }

      btn.addEventListener("click", () => {
        state.activeAction = action;
        clearMessage(section);
        updateFooter(section);
        actions.forEach(a => {
          const otherBtn = document.getElementById(`${section}-${a}-btn`);
          if (otherBtn) otherBtn.classList.remove("active");
        });

        btn.classList.add("active");

        if (action === "undo") return triggerUndo(section);
        if (action === "save") return triggerConfirm(section);

        if (action === "paste" && !state.clipboard) {
          showMessage(section, "⚠️ Paste requires a copied row.", "warn");
          return;
        }

        if (!["add", "paste"].includes(action) && state.selectedRows.size === 0) {
          showMessage(section, "⚠️ Please select one or more rows first.", "warn");
          return;
        }

        if (action === "edit") {
          state.onAction("edit", Array.from(state.selectedRows));
          return;
        }

        updateConfirmButton(section);
      });
    });

    updateConfirmButton(section); // Show initial state
  }

  function updateConfirmButton(section) {
    const state = getState(section);
    const bar = document.getElementById(state.confirmBoxId);
    const btn = bar.querySelector("button.confirm-btn");

    const labels = {
      add: "Confirm and Make Editable",
      copy: "Confirm and Make Editable",
      edit: "Confirm and Make Editable",
      delete: "Confirm and Delete",
      paste: "Confirm and Paste",
      undo: "Confirm and Undo",
      save: "Confirm and Save"
    };

    const label = labels[state.activeAction] || "Confirm Action";

    btn.textContent = label;
    btn.disabled = !state.activeAction;
    btn.className = `confirm-btn ${state.activeAction ? "yellow" : "disabled-btn"}`;
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

    updateUndoButton(section);
    updateConfirmButton(section);
    updateFooter(section);

    document.querySelectorAll(`#${state.domId} .action-btn`).forEach(btn =>
      btn.classList.remove("active")
    );
    document.querySelectorAll(`#${state.domId} tr.selected-row`).forEach(row =>
      row.classList.remove("selected-row")
    );
    document.querySelectorAll(`#${state.domId} input[type="checkbox"]`).forEach(box =>
      (box.checked = false)
    );
  }

  function triggerUndo(section) {
    const state = getState(section);
    const table = document.getElementById(state.tableId);
    if (!table || state.undoStack.length === 0) return;

    const lastSnapshot = state.undoStack.pop();
    table.innerHTML = "";
    lastSnapshot.forEach(row => table.appendChild(row.cloneNode(true)));

    wireCheckboxes(section);
    updateUndoButton(section);
    showMessage(section, "Tip: Last change was undone.", "tip");
  }

  function showMessage(section, text, type = "tip") {
    const box = document.getElementById(getState(section).messageBoxId);
    if (!box) return;
    box.className = type === "warn" ? "tip-box warn" : "tip-box tip";
    box.innerHTML = `<strong>${type === "warn" ? "⚠️ Warning:" : "Tip:"}</strong> ${text}`;
  }

  function clearMessage(section) {
    const box = document.getElementById(getState(section).messageBoxId);
    if (box) {
      box.className = "tip-box tip";
      box.innerHTML = "";
    }
  }

  function updateFooter(section) {
    const state = getState(section);
    const footer = document.getElementById(state.footerBoxId);
    if (!footer) return;
    footer.innerHTML = `
      <strong>Action:</strong> ${state.activeAction || "None"} &nbsp;&nbsp;&nbsp;
      <strong>Selected Rows:</strong> ${state.selectedRows.size}
    `;
  }

  function updateUndoButton(section) {
    const state = getState(section);
    const undoBtn = document.getElementById(`${section}-undo-btn`);
    if (!undoBtn) return;

    if (state.undoStack.length === 0) {
      undoBtn.disabled = true;
      undoBtn.classList.add("disabled-btn");
    } else {
      undoBtn.disabled = false;
      undoBtn.classList.remove("disabled-btn");
    }
  }

  function cycleTips(section) {
    const state = getState(section);
    if (state.tipTimer) clearInterval(state.tipTimer);

    state.tipTimer = setInterval(() => {
      if (!state.activeAction) {
        state.tipIndex = (state.tipIndex + 1) % state.tips.length;
        showMessage(section, state.tips[state.tipIndex], "tip");
      }
    }, tipIntervalMs);
  }

  function wireCheckboxes(section) {
    const state = getState(section);
    const checkboxes = document.querySelectorAll(`#${state.domId} input[type="checkbox"]`);

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

        updateFooter(section);
      });

      const cell = box.closest("td");
      if (cell) {
        cell.addEventListener("click", (e) => {
          if (e.target !== box) box.click();
        });
      }
    });
  }

  function defaultHandler(action, selected) {
    console.log("🛠️ Default handler:", action, selected);
  }

  return {
    init,
    showMessage,
    getSelectedIds: section => Array.from(getState(section).selectedRows),
    clearMessage
  };
})();