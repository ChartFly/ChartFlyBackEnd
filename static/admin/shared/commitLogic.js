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

// 🔁 State Tracking
let selectedRows = new Set();
let activeAction = null;
let undoBuffer = null;

/**
 * Initializes commit logic for a tab
 * @param {Object} config - Configuration object
 * @param {string} config.section - ID prefix (e.g., "holiday", "api", "user")
 * @param {Function} config.onConfirm - Function to execute on Confirm
 * @param {Object} config.messages - (Optional) Custom messages for buttons
 */
function initCommitLogic({ section, onConfirm, messages = {} }) {
  const confirmBox = document.getElementById(`${section}-confirm`);
  const actions = ["edit", "copy", "paste", "add", "delete", "save"];
  const mergedMessages = { ...defaultMessages, ...messages };

  // ✅ Button Wiring
  actions.forEach(action => {
    const btn = document.getElementById(`${section}-${action}-btn`);
    if (!btn) return;

    btn.addEventListener("click", () => {
      activeAction = action;

      actions.forEach(a => {
        const otherBtn = document.getElementById(`${section}-${a}-btn`);
        if (otherBtn) otherBtn.classList.remove("active");
      });

      btn.classList.add("active");

      if (selectedRows.size === 0) {
        confirmBox.innerHTML = `<div class="confirm-box warn">${mergedMessages.noSelection}</div>`;
        return;
      }

      const selectedIndexes = Array.from(document.querySelectorAll("tr.selected-row"))
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

  // ✅ Confirm Hook
  window[`confirmCommitAction`] = function (sectionKey) {
    if (!activeAction || selectedRows.size === 0) {
      confirmBox.innerHTML = `<div class="confirm-box warn">${mergedMessages.noSelection}</div>`;
      return;
    }

    if (typeof onConfirm === "function") {
      onConfirm(activeAction, Array.from(selectedRows));
    }

    confirmBox.innerHTML = `<div class="confirm-box success">${mergedMessages.confirmSuccess(activeAction)}</div>`;
    resetSelection(section);
  };
}

/**
 * Resets state and UI selections
 */
function resetSelection(section) {
  activeAction = null;
  selectedRows.clear();

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

/**
 * Used to update selected row state externally
 */
function toggleRowSelection(id, isSelected) {
  if (isSelected) {
    selectedRows.add(id);
  } else {
    selectedRows.delete(id);
  }
}

/**
 * Utility
 */
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

window.initCommitLogic = initCommitLogic;