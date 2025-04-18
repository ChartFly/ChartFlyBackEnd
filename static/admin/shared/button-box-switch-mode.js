// ============================================
// ✅ button-box-switch-mode.js
// --------------------------------------------
// Logic for handling edit mode switch when
// unsaved changes exist.
// Author: Captain & Chatman
// Version: MPA Phase IV — Mode Switch Overlay (Working)
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

  function handleOption(section, choice) {
    console.log(`🔧 Mode switch choice: ${choice}`);
    removePopup();

    if (choice === "save") {
      ButtonBox.save(section);
      setTimeout(() => ButtonBox.switchEditMode(section), 100);
    } else if (choice === "discard") {
      ButtonBox.cancelChanges(section);
      ButtonBox.switchEditMode(section);
    } else {
      // Stay: do nothing
    }
  }

  function showOverlay(section, onSave, onDiscard, onStay) {
    injectPopup(section);

    const saveBtn = document.querySelector(`#${popupId} .save`);
    const discardBtn = document.querySelector(`#${popupId} .discard`);
    const stayBtn = document.querySelector(`#${popupId} .stay`);

    if (saveBtn)
      saveBtn.onclick = () => {
        removePopup();
        onSave();
      };
    if (discardBtn)
      discardBtn.onclick = () => {
        removePopup();
        onDiscard();
      };
    if (stayBtn)
      stayBtn.onclick = () => {
        removePopup();
        onStay();
      };
  }

  return {
    injectPopup,
    removePopup,
    showOverlay, // ✅ Exposed for devtools or ButtonBox.js
  };
})();
