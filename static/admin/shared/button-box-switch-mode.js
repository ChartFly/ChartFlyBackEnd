// ============================================
// ✅ button-box-switch-mode.js
// --------------------------------------------
// Logic for handling edit mode switch when
// unsaved changes exist.
// Author: Captain & Chatman
// Version: MPA Phase IV — Mode Switch Overlay (Blue + Orange Save FIXED)
// ============================================

window.ButtonBoxSwitchMode = (() => {
  const popupId = "switch-mode-popup";

  function injectPopup(section) {
    const box = document.getElementById(`${section}-button-box`);
    if (!box || document.getElementById(popupId)) return;

    const popup = document.createElement("div");
    popup.id = popupId;
    popup.className = "switch-mode-popup";
    popup.innerHTML = `
      <div class="switch-mode-popup-inner">
        <div class="switch-mode-message">There are unsaved changes. Pick an option below:</div>
        <div class="switch-mode-buttons">
          <button class="switch-mode-btn save">Save & Switch</button>
          <button class="switch-mode-btn discard">Discard & Switch</button>
          <button class="switch-mode-btn stay">Stay in Current Mode</button>
        </div>
      </div>
    `;
    box.appendChild(popup);
  }

  function removePopup() {
    const existing = document.getElementById(popupId);
    if (existing) existing.remove();
  }

  function forceSwitchMode(section) {
    const current = ButtonBox.getEditMode(section);
    const target = current === "row" ? "cell" : "row";

    const input = document.querySelector(
      `input[name="${section}-edit-mode"][value="${target}"]`
    );
    if (input) {
      input.checked = true;
      ButtonBoxMessages.updateButtonColors(section);
    }
  }

  function showOverlay(section, onSave, onDiscard, onStay) {
    injectPopup(section);

    const saveBtn = document.querySelector(`#${popupId} .save`);
    const discardBtn = document.querySelector(`#${popupId} .discard`);
    const stayBtn = document.querySelector(`#${popupId} .stay`);

    if (saveBtn) {
      saveBtn.onclick = () => {
        console.log("💾 Save & Switch clicked");
        removePopup();

        const currentMode = ButtonBox.getEditMode(section);
        const state = ButtonBox.getState(section);

        if (currentMode === "cell") {
          console.log("🟠 Saving dirty cells...");
          if (typeof ButtonBoxColumns?.saveDirtyCells === "function") {
            ButtonBoxColumns.saveDirtyCells(section);
          }
          ButtonBox.cleanupMode(section, "cell");
        } else {
          console.log("🔵 Saving dirty rows...");
          const selected = Array.from(state.selectedRows);
          if (typeof state.onAction === "function") {
            state.onAction("save", selected);
          }
          ButtonBox.cleanupMode(section, "row");
        }

        setTimeout(() => {
          forceSwitchMode(section);
        }, 150);
      };
    }

    if (discardBtn) {
      discardBtn.onclick = () => {
        console.log("🗑️ Discard & Switch clicked");
        removePopup();

        const currentMode = ButtonBox.getEditMode(section);
        ButtonBox.cleanupMode(section, currentMode);

        setTimeout(() => {
          forceSwitchMode(section);
        }, 100);
      };
    }

    if (stayBtn) {
      stayBtn.onclick = () => {
        console.log("🙅 Stay in Current Mode clicked");
        removePopup();
        onStay();
      };
    }
  }

  return {
    injectPopup,
    removePopup,
    showOverlay,
  };
})();
