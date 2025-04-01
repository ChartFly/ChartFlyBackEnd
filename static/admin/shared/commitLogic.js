// static/admin/shared/commitLogic.js

const defaultMessages = {
  edit: "Edit mode enabled. You may now make changes.",
  copy: "Row(s) copied. Use Paste to duplicate.",
  paste: "Paste mode active. Select a destination.",
  add: "Ready to add new row(s).",
  delete: "Row(s) marked for deletion. Confirm to proceed.",
  save: "Changes ready to be saved.",
  noSelection: "Please select one or more rows before choosing an action.",
  confirmSuccess: (action) => `✅ ${capitalize(action)} confirmed!`,
  undoSuccess: "Last change undone.",
  nothingToUndo: "Nothing to undo.",
};

const sectionStates = {};
function getState(section) {
  if (!sectionStates[section]) {
    sectionStates[section] = {
      selectedRows: new Set(),
      activeAction: null,
      undoBuffer: null,
      onConfirm: null,
      domId: null
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

      // Pre-action visual cue for edit
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

      // Confirm UI
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

  console.log("🔥 confirmCommitAction called:", section);
  if (!state.activeAction) {
    confirmBox.innerHTML = `<div class="confirm-box warn">${msg.noSelection}</div>`;
    return;
  }

  if (typeof state.onConfirm === "function") {
    state.onConfirm(state.activeAction, Array.from(state.selectedRows));
  }

  // ✅ Finalize edited rows for all actions except undo
  if (state.activeAction !== "undo") {
    document.querySelectorAll(`#${state.domId} tr.editing`).forEach(row => {
      row.classList.remove("editing");
      row.querySelectorAll("td.editable").forEach(cell => {
        cell.removeAttribute("contenteditable");
        cell.classList.remove("editable");
      });
    });
  }

  const successMsg = document.createElement("div");
  successMsg.className = "confirm-box success";
  successMsg.textContent = msg.confirmSuccess(state.activeAction);
  confirmBox.innerHTML = "";
  confirmBox.appendChild(successMsg);

  setTimeout(() => {
    if (confirmBox.contains(successMsg)) {
      confirmBox.innerHTML = "";
    }
  }, 7000);

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
window.confirmCommitAction = confirmCommitAction;