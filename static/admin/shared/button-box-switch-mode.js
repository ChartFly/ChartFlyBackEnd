// ================================================
// ✅ button-box-switch-mode.js
// --------------------------------------------
// Logic for handling edit mode switch when
// unsaved changes exist.
// Author: Captain & Chatman
// Version: MPA Phase IV — Bulletproof Mode Switch (Final Fix)
// ================================================

window.ButtonBoxSwitchMode = (() => {
  const popupId = "switch-mode-popup";

  function injectPopup(section, modeAtTrigger) {
    const box = document.getElementById(`${section}-button-box`);
    const existing = document.getElementById(popupId);
    if (!box) {
      console.warn("❌ No ButtonBox container found for popup injection");
      return;
    }
    if (existing) {
      console.warn("🧽 Removing existing popup before reinjecting");
      existing.remove();
    }

    const popup = document.createElement("div");
    popup.id = popupId;
    popup.className = "switch-mode-popup";
    popup.innerHTML = `
      <div class="switch-mode-popup-inner">
        <div class="switch-mode-message">There are unsaved changes. Pick an option below:</div>
        <div class="switch-mode-buttons">
          <button id="save-btn" class="switch-mode-btn save">Save & Switch</button>
          <button id="discard-btn" class="switch-mode-btn discard">Discard & Switch</button>
          <button id="stay-btn" class="switch-mode-btn stay">Stay in Current Mode</button>
        </div>
      </div>
    `;
    box.appendChild(popup);
    console.log("✅ Popup injected into DOM");

    setTimeout(() => {
      wirePopupButtons(section, modeAtTrigger);
    }, 10);
  }

  function wirePopupButtons(section, modeAtTrigger) {
    const saveBtn = document.getElementById("save-btn");
    const discardBtn = document.getElementById("discard-btn");
    const stayBtn = document.getElementById("stay-btn");

    if (saveBtn) {
      console.log("✅ Binding Save & Switch");
      saveBtn.onclick = () => {
        console.log("💾 Save & Switch clicked");
        removePopup();

        const state = ButtonBox.getState(section);

        if (modeAtTrigger === "cell") {
          console.log("🟠 Saving dirty cells...");
          const saveFn = ButtonBoxColumns?.saveDirtyCells;
          if (typeof saveFn === "function") {
            saveFn(section);
            console.log("✅ saveDirtyCells executed");
          } else {
            console.warn("❌ ButtonBoxColumns.saveDirtyCells missing");
          }
          ButtonBox.cleanupMode(section, "cell");
        } else {
          console.log("🔵 Saving dirty rows...");
          const selected = Array.from(state.selectedRows);
          if (typeof state.onAction === "function") {
            state.onAction("save", selected);
            console.log("✅ Row save triggered");
          } else {
            console.warn("❌ state.onAction is not a function");
          }
          ButtonBox.cleanupMode(section, "row");
        }

        setTimeout(() => {
          forceSwitchMode(section, modeAtTrigger);
        }, 100);
      };
    } else {
      console.warn("❌ Save button not found in popup");
    }

    if (discardBtn) {
      console.log("✅ Binding Discard & Switch");
      discardBtn.onclick = () => {
        console.log("🗑️ Discard & Switch clicked");
        removePopup();

        if (modeAtTrigger === "cell") {
          console.log("🟠 Reverting dirty cells via discardAllCellChanges...");
          const discardFn = ButtonBoxColumns?.discardAllCellChanges;
          if (typeof discardFn === "function") {
            discardFn(section);
            console.log("✅ discardAllCellChanges executed");
          } else {
            console.warn("❌ ButtonBoxColumns.discardAllCellChanges missing");
          }
        }

        ButtonBox.cleanupMode(section, modeAtTrigger);

        setTimeout(() => {
          forceSwitchMode(section, modeAtTrigger);
        }, 100);
      };
    } else {
      console.warn("❌ Discard button not found in popup");
    }

    if (stayBtn) {
      console.log("✅ Binding Stay");
      stayBtn.onclick = () => {
        console.log("🙅 Stay in Current Mode clicked");
        removePopup();
      };
    } else {
      console.warn("❌ Stay button not found in popup");
    }
  }

  function removePopup() {
    const existing = document.getElementById(popupId);
    if (existing) {
      existing.remove();
      console.log("🧹 Popup removed");
    }
  }

  function forceSwitchMode(section, modeAtTrigger) {
    const current = modeAtTrigger;
    const target = current === "row" ? "cell" : "row";

    const input = document.querySelector(
      `input[name="${section}-edit-mode"][value="${target}"]`
    );
    if (input) {
      input.checked = true;
      ButtonBoxMessages.updateButtonColors(section);
      ButtonBoxMessages.initTips(section);
      ButtonBox.getState(section).currentMode = target;
      console.log(`🔁 Mode switched to: ${target}`);
    } else {
      console.warn("⚠️ Radio input not found for mode switch");
    }
  }

  function showOverlay(section, modeAtTrigger) {
    injectPopup(section, modeAtTrigger);
  }

  return {
    injectPopup,
    removePopup,
    showOverlay,
  };
})();
