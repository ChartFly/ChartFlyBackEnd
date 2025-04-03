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
      };
    }
    return sectionStates[section];
  }

  function init({ section, domId, tableId, confirmBoxId, messageId }) {
    const state = getState(section);
    state.domId = domId;
    state.tableId = tableId;
    state.confirmBoxId = confirmBoxId;
    state.messageId = messageId;

    console.log(`🚀 ButtonBox initialized for section: ${section}`);

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

        actions.forEach(a => {
          const otherBtn = document.getElementById(`${section}-${a}-btn`);
          if (otherBtn) otherBtn.classList.remove("active");
        });

        btn.classList.add("active");

        if (action === "undo") {
          triggerUndo(section);
          return;
        }

        if (action === "save") {
          triggerConfirm(section);
          return;
        }

        if (action === "paste" && !state.clipboard) {
          showMessage(section, "Nothing to paste. You must copy something first.");
          return;
        }

        if (!["add", "paste"].includes(action) && state.selectedRows.size === 0) {
          showMessage(section, "Please select one or more rows first.");
          return;
        }

        showConfirmBox(section, action);
      });
    });

    wireCheckboxes(section);
    updateUndoButton(section);
  }

  function showMessage(section, message) {
    const state = getState(section);
    const msg = document.getElementById(state.messageId);
    if (msg) msg.textContent = message;
    const box = document.getElementById(state.confirmBoxId);
    if (box) box.style.display = "flex";
  }

  function showConfirmBox(section, action) {
    const state = getState(section);
    const msg = document.getElementById(state.messageId);
    const bar = document.getElementById(state.confirmBoxId);

    const selectedIndexes = Array.from(
      document.querySelectorAll(`#${state.domId} tr.selected-row`)
    ).map(row => row.dataset.index);

    if (msg) {
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
  }

  function triggerConfirm(section) {
    const state = getState(section);
    const table = document.getElementById(state.tableId);
    if (!table) return;

    const snapshot = Array.from(table.querySelectorAll("tr")).map(row => row.cloneNode(true));
    if (state.undoStack.length >= state.maxUndo) state.undoStack.shift();
    state.undoStack.push(snapshot);

    if (typeof state.onAction === "function") {
      state.onAction(state.activeAction, Array.from(state.selectedRows));
    }

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
    showMessage(section, "Last change undone.");
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

  function hideConfirmBox(section) {
    const state = getState(section);
    const bar = document.getElementById(state.confirmBoxId);
    const msg = document.getElementById(state.messageId);
    if (bar) bar.style.display = "none";
    if (msg) msg.innerHTML = "";
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

  return { init };
})();