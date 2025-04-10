// static/admin/shared/ButtonBoxMessages.js

window.ButtonBoxMessages = (() => {
  const rotatingTips = [
    "Click a button to begin an action.",
    "Select rows before editing or deleting.",
    "Paste only works after you Copy.",
    "Undo will reverse your last change.",
    "You can copy/paste individual cell text!",
  ];

  const tipTimers = {};

  function initTips(section, tipIndex = 0) {
    const state = ButtonBox.getState(section);
    if (!state) return;

    showTip(section, rotatingTips[tipIndex]);
    tipTimers[section] = setInterval(() => {
      state.tipIndex = (state.tipIndex + 1) % rotatingTips.length;
      showTip(section, rotatingTips[state.tipIndex]);
    }, 60000);
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
  }

  function clearWarning(section) {
    const state = ButtonBox.getState(section);
    if (!state) return;
    state.tipIndex = 0;
    showTip(section, rotatingTips[0]);
  }

  function enableConfirm(section, action, onClickHandler) {
    const btn = document.getElementById(`${section}-confirm-btn`);
    if (!btn) return;

    const labels = {
      delete: "Confirm and Delete",
      save: "Confirm and Save",
      paste: "Confirm and Paste",
      undo: "Confirm and Undo",
    };

    btn.disabled = false;
    btn.className = "confirm-btn yellow";
    btn.textContent = labels[action] || `Confirm ${capitalize(action)}`;
    btn.onclick = onClickHandler;
  }

  function resetConfirm(section) {
    const btn = document.getElementById(`${section}-confirm-btn`);
    if (btn) {
      btn.disabled = true;
      btn.className = "confirm-btn gray";
      btn.textContent = "Confirm";
      btn.onclick = null;
    }
  }

  function setStatus(section, action) {
    const box = document.getElementById(`${section}-current-action`);
    if (box) box.textContent = capitalize(action);
  }

  function resetButtons(section, activeBtn) {
    const actions = ["edit", "copy", "paste", "add", "delete", "save", "undo"];
    actions.forEach((action) => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (btn) btn.classList.remove("active");
    });
    if (activeBtn) activeBtn.classList.add("active");
  }

  function updateIdColumnVisibility(section) {
    const state = ButtonBox.getState(section);
    if (!state) return;
    const idToggle = document.getElementById(`${section}-show-id-toggle`);
    if (!idToggle) return;

    document
      .querySelectorAll(
        `#${state.domId} .line-id-col, #${state.domId} th.line-id-col`
      )
      .forEach((cell) => {
        cell.style.display = idToggle.checked ? "table-cell" : "none";
      });
  }

  function updateButtonColors(section) {
    const isCell = ButtonBox.getEditMode(section) === "cell";
    document
      .querySelectorAll(`#${section}-toolbar .action-btn`)
      .forEach((btn) => {
        btn.classList.toggle("cell-mode", isCell);
      });
  }

  function updateSelectedCount(section) {
    const state = ButtonBox.getState(section);
    const box = document.getElementById(`${section}-selected-count`);
    if (box && state) {
      box.textContent = state.selectedRows.size;
    }
  }

  // 🔠 Capitalize first letter
  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return {
    initTips,
    showTip,
    showWarning,
    clearWarning,
    enableConfirm,
    resetConfirm,
    resetButtons,
    setStatus,
    updateIdColumnVisibility,
    updateButtonColors,
    updateSelectedCount,
  };
})();
