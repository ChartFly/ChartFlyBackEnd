// static/admin/shared/commitLogic.js

const defaultMessages = {
  edit: "Edit mode enabled. You may now make changes.",
  copy: "Row(s) copied. Use Paste to duplicate.",
  paste: "Paste mode active. Select a destination.",
  add: "New line, edit & save.",
  delete: "Row(s) marked for deletion. Confirm to proceed.",
  save: "Changes ready to be saved.",
  noSelection: "Please select one or more rows before choosing an action.",
  confirmSuccess: (action) => `✅ ${capitalize(action)} confirmed!`,
  undoSuccess: "Last change undone.",
  nothingToUndo: "Nothing to undo.",
  nothingToPaste: "Nothing to paste. You must copy something first.",
};

const sectionStates = {};
function getState(section) {
  if (!sectionStates[section]) {
    sectionStates[section] = {
      selectedRows: new Set(),
      activeAction: null,
      undoBuffer: [],
      onConfirm: null,
      domId: null,
      clipboard: null,
    };
  }
  return sectionStates[section];
}

function initCommitLogic({ section, sectionDomId = `${section}-section`, onConfirm, messages = {} }) {
  const confirmBox = document.getElementById(`${section}-confirm`);
  const actions = ["edit", "copy", "paste", "add", "delete", "save"];
  const msg = { ...defaultMessages, ...messages };
  const state = getState(section);
  state.onConfirm = onConfirm;
  state.domId = sectionDomId;

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

      if (action === "save") {
        confirmCommitAction(section);
        return;
      }

      const hasSelection = state.selectedRows.size > 0;
      const actionNeedsSelection = !["add", "paste", "undo"].includes(action);
      if (!hasSelection && actionNeedsSelection) {
        confirmBox.innerHTML = `<div class="confirm-box warn">${msg.noSelection}</div>`;
        return;
      }

      if (action === "paste" && !state.clipboard) {
        confirmBox.innerHTML = `<div class="confirm-box warn">${msg.nothingToPaste}</div>`;
        return;
      }

      if (action === "copy") {
        const pasteBtn = document.getElementById(`${section}-paste-btn`);
        if (pasteBtn) {
          pasteBtn.disabled = false;
          pasteBtn.classList.remove("disabled-btn");
        }
      }

      if (action === "edit") {
        for (const id of state.selectedRows) {
          const row = document.querySelector(`#${state.domId} tr[data-id="${id}"]`);
          if (!row) continue;
          row.classList.add("editing");
          row.querySelectorAll("td:not(.col-select)").forEach(cell => {
            const note = cell.querySelector(".early-close-note");
            if (note) note.remove();
            cell.setAttribute("contenteditable", "true");
            cell.classList.add("editable");
          });
        }
      }

      const selectedIndexes = Array.from(document.querySelectorAll(`#${state.domId} tr.selected-row`))
        .map(row => row.dataset.index);

      const confirmDiv = document.createElement("div");
      confirmDiv.className = "confirm-box info";
      confirmDiv.innerHTML = `
        <strong>Action:</strong> ${action.toUpperCase()}<br>
        <strong>Selected Rows:</strong> ${selectedIndexes.join(", ") || "(None)"}
      `;

      const confirmButton = document.createElement("button");
      confirmButton.className = "confirm-btn yellow";
      confirmButton.textContent = `Confirm and Save ${capitalize(action)}`;
      confirmButton.addEventListener("click", () => confirmCommitAction(section));

      confirmBox.innerHTML = "";
      confirmBox.appendChild(confirmDiv);
      confirmDiv.appendChild(confirmButton);
    });
  });

  const undoBtn = document.getElementById(`${section}-undo-btn`);
  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      const state = getState(section);
      const table = document.getElementById("holidays-table");
      if (!state.undoBuffer.length) return;

      const lastSnapshot = state.undoBuffer.pop();
      table.innerHTML = "";
      lastSnapshot.forEach(oldRow => {
        const cloned = oldRow.cloneNode(true);
        const newId = `undo-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        cloned.setAttribute("data-id", newId);
        const checkbox = cloned.querySelector("input[type='checkbox']");
        if (checkbox) checkbox.setAttribute("data-id", newId);
        table.appendChild(cloned);
      });

      wireCheckboxes(section);
      updateUndoButton(section);
    });
  }

  setTimeout(() => wireCheckboxes(section), 0);
  updateUndoButton(section);
}

function confirmCommitAction(section) {
  const state = getState(section);
  const confirmBox = document.getElementById(`${section}-confirm`);
  const msg = defaultMessages;

  if (!state.activeAction) {
    confirmBox.innerHTML = `<div class="confirm-box warn">${msg.noSelection}</div>`;
    return;
  }

  if (state.activeAction === "add") {
    const newRow = document.querySelector(`#${state.domId} tr[data-id^="new-"]`);
    if (newRow && !newRow.classList.contains("dirty")) {
      confirmBox.innerHTML = `<div class="confirm-box warn">Please edit the new row before confirming Add.</div>`;
      return;
    }
  }

  if (state.activeAction === "copy") {
    const copied = document.querySelector(`#${state.domId} tr[data-id^="copy-"]`);
    if (copied) {
      copied.classList.add("editing");
      copied.querySelectorAll("td:not(.col-select)").forEach(cell => {
        cell.setAttribute("contenteditable", "true");
        cell.classList.add("editable");
      });
    }
  }

  if (["edit", "save"].includes(state.activeAction)) {
    const editableRows = document.querySelectorAll(`#${state.domId} tr.editing`);
    let finalized = 0;

    editableRows.forEach(row => {
      const box = row.querySelector('input[type="checkbox"]');
      const shouldSave = state.activeAction === "edit" || (box && box.checked);
      if (shouldSave) {
        const newId = `saved-${Date.now()}`;
        row.setAttribute("data-id", newId);
        row.classList.remove("editing", "dirty", "selected-row");
        row.querySelectorAll("td.editable").forEach(cell => {
          cell.removeAttribute("contenteditable");
          cell.classList.remove("editable");
        });
        if (box) {
          box.checked = false;
          box.setAttribute("data-id", newId);
        }
        finalized++;
      }
    });

    if (state.activeAction === "save" && finalized === 0) {
      confirmBox.innerHTML = `<div class="confirm-box warn">No rows selected. Please check one or more rows to save.</div>`;
      return;
    }

    state.selectedRows.clear();
  }

  if (typeof state.onConfirm === "function") {
    const table = document.getElementById("holidays-table");
    const snapshot = Array.from(table.querySelectorAll("tr")).map(row => row.cloneNode(true));
    if (state.undoBuffer.length >= 20) state.undoBuffer.shift();
    state.undoBuffer.push(snapshot);
    updateUndoButton(section);
    state.onConfirm(state.activeAction, Array.from(state.selectedRows));
  }

  confirmBox.innerHTML = `<div class="confirm-box success">${msg.confirmSuccess(state.activeAction)}</div>`;
  setTimeout(() => {
    if (confirmBox.innerHTML.includes("✅")) confirmBox.innerHTML = "";
  }, 5000);

  resetSelection(section);
}

function resetSelection(section) {
  const state = getState(section);
  state.activeAction = null;
  state.selectedRows.clear();

  document.querySelectorAll(`#${state.domId} .action-btn`).forEach(btn =>
    btn.classList.remove("active")
  );
  document.querySelectorAll(`#${state.domId} input[type="checkbox"]`).forEach(box =>
    (box.checked = false)
  );
  document.querySelectorAll(`#${state.domId} tr.selected-row`).forEach(row =>
    row.classList.remove("selected-row")
  );
}

function updateUndoButton(section) {
  const state = getState(section);
  const undoBtn = document.getElementById(`${section}-undo-btn`);
  if (!undoBtn) return;
  undoBtn.disabled = state.undoBuffer.length === 0;
  undoBtn.classList.toggle("disabled-btn", undoBtn.disabled);
}

function updateConfirmCount(section) {
  const state = getState(section);
  const box = document.getElementById(`${section}-confirm`);
  if (state.selectedRows.size === 0) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = `<div class="confirm-box info">${state.selectedRows.size} row(s) selected.</div>`;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

window.initCommitLogic = initCommitLogic;
window.getState = getState;
window.wireCheckboxes = wireCheckboxes;