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
      undoBuffer: null,
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

      const actionInfo = document.createElement("div");
      actionInfo.innerHTML = `
        <strong>Action:</strong> ${action.toUpperCase()}<br>
        <strong>Selected Rows:</strong> ${selectedIndexes.join(", ") || "(None)"}
      `;

      const confirmButton = document.createElement("button");
      confirmButton.className = "confirm-btn yellow";
      confirmButton.textContent = `Confirm and Save ${capitalize(action)}`;
      confirmButton.addEventListener("click", () => confirmCommitAction(section));

      confirmDiv.appendChild(actionInfo);
      confirmDiv.appendChild(confirmButton);

      confirmBox.innerHTML = "";
      confirmBox.appendChild(confirmDiv);
    });
  });

  setTimeout(() => wireCheckboxes(section), 0);
}

function wireCheckboxes(section) {
  const state = getState(section);
  const checkboxes = document.querySelectorAll(`#${state.domId} input[type="checkbox"]`);

  checkboxes.forEach(box => {
    const id = box.dataset.id;
    box.addEventListener("change", () => {
      const row = box.closest("tr");
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
  });
}

function confirmCommitAction(section) {
  const state = getState(section);
  const confirmBox = document.getElementById(`${section}-confirm`);
  const msg = defaultMessages;

  if (!state.activeAction) {
    confirmBox.innerHTML = `<div class="confirm-box warn">${msg.noSelection}</div>`;
    return;
  }

  // 🚫 ADD requires edit before confirm
  if (state.activeAction === "add") {
    const newRow = document.querySelector(`#${state.domId} tr[data-id^="new-"]`);
    if (newRow && !newRow.classList.contains("dirty")) {
      confirmBox.innerHTML = `<div class="confirm-box warn">Please edit the new row before confirming Add.</div>`;
      return;
    }
  }

  // ✅ COPY inserts editable yellow clone
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

  // ✅ Finalize rows for Edit and Save
  if (["edit", "save"].includes(state.activeAction)) {
    document.querySelectorAll(`#${state.domId} tr.editing`).forEach(row => {
      const checkbox = row.querySelector('input[type="checkbox"]');
      if (checkbox?.checked || state.activeAction === "edit") {
        row.classList.remove("editing", "dirty");
        row.querySelectorAll("td.editable").forEach(cell => {
          cell.removeAttribute("contenteditable");
          cell.classList.remove("editable");
        });
        if (checkbox) checkbox.checked = false;
        row.classList.remove("selected-row");
      }
    });
    state.selectedRows.clear();
  }

  // Trigger the onConfirm hook (e.g., to insert rows, update undoBuffer, etc.)
  if (typeof state.onConfirm === "function") {
    state.onConfirm(state.activeAction, Array.from(state.selectedRows));
  }

  // ✅ Show success message
  const successMsg = document.createElement("div");
  successMsg.className = "confirm-box success";
  successMsg.textContent = msg.confirmSuccess(state.activeAction);
  confirmBox.innerHTML = "";
  confirmBox.appendChild(successMsg);

  // ✅ Auto-clear confirm bar after 5s
  setTimeout(() => {
    if (confirmBox.contains(successMsg)) {
      confirmBox.innerHTML = "";
    }
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

function updateConfirmCount(section) {
  const state = getState(section);
  const box = document.getElementById(`${section}-confirm`);

  if (state.selectedRows.size === 0) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `
    <div class="confirm-box info">
      ${state.selectedRows.size} row(s) selected.
    </div>
  `;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

window.initCommitLogic = initCommitLogic;
window.getState = getState;
window.wireCheckboxes = wireCheckboxes;