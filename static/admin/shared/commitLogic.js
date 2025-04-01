// static/admin/shared/commitLogic.js

// 🔧 Configurable Defaults
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

// 🧠 State per section
const sectionStates = {};
function getState(section) {
  if (!sectionStates[section]) {
    sectionStates[section] = {
      selectedRows: new Set(),
      activeAction: null,
      undoBuffer: null
    };
  }
  return sectionStates[section];
}

// 🚀 Init Commit Logic
function initCommitLogic({ section, onConfirm, messages = {} }) {
  const confirmBox = document.getElementById(`${section}-confirm`);
  const actions = ["edit", "copy", "paste", "add", "delete", "save"];
  const msg = { ...defaultMessages, ...messages };
  const state = getState(section);

  // 🔘 Button Listeners
  actions.forEach(action => {
    const btn = document.getElementById(`${section}-${action}-btn`);
    if (!btn) return;

    btn.addEventListener("click", () => {
      state.activeAction = action;

      // Remove .active from all buttons
      actions.forEach(a => {
        const otherBtn = document.getElementById(`${section}-${a}-btn`);
        if (otherBtn) otherBtn.classList.remove("active");
      });

      btn.classList.add("active");

      if (state.selectedRows.size === 0) {
        confirmBox.innerHTML = `<div class="confirm-box warn">${msg.noSelection}</div>`;
        return;
      }

      const selectedIndexes = Array.from(document.querySelectorAll(`#${section}-section tr.selected-row`))
        .map(row => row.dataset.index);

      confirmBox.innerHTML = `
        <div class="confirm-box info">
          <strong>Action:</strong> ${action.toUpperCase()}<br>
          <strong>Selected Rows:</strong> ${selectedIndexes.join(", ")}<br>
          <button class="confirm-btn yellow" onclick="confirmCommitAction('${section}')">Confirm ${action}</button>
        </div>
      `;
    });
  });

  // ✅ Checkbox Row Selection Wiring
  document.querySelectorAll(`#${section}-section .admin-table input[type="checkbox"]`).forEach(box => {
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

// 🟡 Confirm Button Handler
window.confirmCommitAction = function (section) {
  const state = getState(section);
  const confirmBox = document.getElementById(`${section}-confirm`);
  const msg = defaultMessages;

  if (!state.activeAction || state.selectedRows.size === 0) {
    confirmBox.innerHTML = `<div class="confirm-box warn">${msg.noSelection}</div>`;
    return;
  }

  if (typeof sectionStates[section].onConfirm === "function") {
    sectionStates[section].onConfirm(state.activeAction, Array.from(state.selectedRows));
  }

  confirmBox.innerHTML = `<div class="confirm-box success">${msg.confirmSuccess(state.activeAction)}</div>`;
  resetSelection(section);
};

// 🔄 Reset UI after Confirm
function resetSelection(section) {
  const state = getState(section);
  state.activeAction = null;
  state.selectedRows.clear();

  document.querySelectorAll(`#${section}-section .action-btn`).forEach(btn =>
    btn.classList.remove("active")
  );

  document.querySelectorAll(`#${section}-section .admin-table input[type="checkbox"]`).forEach(box =>
    (box.checked = false)
  );

  document.querySelectorAll(`#${section}-section .admin-table tr.selected-row`).forEach(row =>
    row.classList.remove("selected-row")
  );
}

// 🧮 Update Row Count Bar (reusable)
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

// 🧰 Utility
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function toggleRowSelection(id, isSelected) {
  for (const section in sectionStates) {
    const state = sectionStates[section];
    if (isSelected) {
      state.selectedRows.add(id);
    } else {
      state.selectedRows.delete(id);
    }
  }
}

// ✅ Make available to other modules
window.initCommitLogic = initCommitLogic;