// static/admin/shared/ButtonBox.js

window.ButtonBox = (() => {
  const sectionStates = {};

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
        messageId: null,
        tipBoxId: null,
        warningBoxId: null,
        onAction: defaultHandler
      };
    }
    return sectionStates[section];
  }

  function init({ section, domId, tableId, confirmBoxId, messageId, tipBoxId, warningBoxId, onAction }) {
    const state = getState(section);
    Object.assign(state, { domId, tableId, confirmBoxId, messageId, tipBoxId, warningBoxId });

    if (typeof onAction === "function") {
      state.onAction = onAction;
    }

    console.log(`🚀 ButtonBox initialized for section: ${section}`);
    showTip(section, "Tip: Check one or more rows before clicking an action.");

    const actions = ["edit", "copy", "paste", "add", "delete", "save", "undo"];
    actions.forEach(action => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (!btn) return;

      if (action === "paste") {
        btn.disabled = true;
        btn.classList.add("disabled-btn");
      }

      btn.addEventListener("click", () => {
        state.activeAction = action;
        clearTip(section);
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

        if (action === "edit") {
          state.onAction("edit", Array.from(state.selectedRows));
          return;
        }

        showConfirmBox(section, action);
      });
    });

    wireCheckboxes(section);
    updateUndoButton(section);
  }

  function defaultHandler(action, selectedIds) {
    console.warn(`⚠️ No custom handler defined for action "${action}". Selected:`, selectedIds);
    showTip("global", `Default handler received: ${action}`);
  }

  function showMessage(section, message, type = "info") {
    const state = getState(section);
    const msg = document.getElementById(state.messageId);
    const box = document.getElementById(state.confirmBoxId);
    if (msg) {
      msg.className = `confirm-box ${type}`;
      msg.innerHTML = message;
    }
    if (box) {
      box.style.display = "flex";
      box.style.visibility = "visible";
    }
  }

  function showTip(section, message) {
    const tip = document.getElementById(getState(section).tipBoxId);
    if (tip) {
      tip.innerHTML = `<strong>Tip:</strong> ${message}`;
      tip.style.visibility = "visible";
    }
  }

  function clearTip(section) {
    const tip = document.getElementById(getState(section).tipBoxId);
    if (tip) {
      tip.innerHTML = "";
      tip.style.visibility = "hidden";
    }
  }

  function showWarning(section, message) {
    const box = document.getElementById(getState(section).warningBoxId);
    if (box) {
      box.innerHTML = `<strong>⚠️ Warning:</strong> ${message}`;
      box.style.visibility = "visible";
    }
  }

  function clearWarning(section) {
    const box = document.getElementById(getState(section).warningBoxId);
    if (box) {
      box.innerHTML = "";
      box.style.visibility = "hidden";
    }
  }

  function showConfirmBox(section, action) {
    const state = getState(section);
    const msg = document.getElementById(state.messageId);
    const bar = document.getElementById(state.confirmBoxId);

    const selectedIndexes = Array.from(
      document.querySelectorAll(`#${state.domId} tr.selected-row`)
    ).map(row => row.dataset.index);

    if (msg) {
      msg.className = "confirm-box info";
      msg.innerHTML = `
        <strong>Action:</strong> ${action.toUpperCase()}<br>
        <strong>Selected Rows:</strong> ${selectedIndexes.join(", ") || "(None)"}
      `;
    }

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = `Confirm and Save ${capitalize(action)}`;
    confirmBtn.className = "confirm-btn yellow";
    confirmBtn.addEventListener("click", () => triggerConfirm(section));

    msg?.appendChild(confirmBtn);
    bar.style.display = "flex";
    bar.style.visibility = "visible";
  }

  function hideConfirmBox(section) {
    const state = getState(section);
    const bar = document.getElementById(state.confirmBoxId);
    const msg = document.getElementById(state.messageId);
    if (bar) {
      bar.style.visibility = "hidden";
      bar.style.display = "flex";
    }
    if (msg) {
      msg.innerHTML = "";
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

    document.querySelectorAll(`#${state.domId} .action-btn`).forEach(btn =>
      btn.classList.remove("active")
    );
    document.querySelectorAll(`#${state.domId} tr.selected-row`).forEach(row =>
      row.classList.remove("selected-row")
    );
    document.querySelectorAll(`#${state.domId} input[type="checkbox"]`).forEach(box =>
      (box.checked = false)
    );

    updateUndoButton(section);
    hideConfirmBox(section);
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
    showTip(section, "Last change was undone.");
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

        updateConfirmCount(section);
      });

      const cell = box.closest("td");
      if (cell) {
        cell.addEventListener("click", (e) => {
          if (e.target !== box) box.click();
        });
      }
    });
  }

  function updateConfirmCount(section) {
    const state = getState(section);
    const msg = document.getElementById(state.messageId);
    if (!msg) return;

    if (state.selectedRows.size === 0) {
      msg.textContent = "";
      return;
    }

    msg.textContent = `${state.selectedRows.size} row(s) selected.`;
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function getSelectedIds(section) {
    return Array.from(getState(section).selectedRows);
  }

  return {
    init,
    showTip,
    showWarning,
    clearTip,
    clearWarning,
    showMessage,
    getSelectedIds,
    wireCheckboxes
  };
})();