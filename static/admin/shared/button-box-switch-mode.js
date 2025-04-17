// ============================================
// ✅ button-box-switch-mode.js
// --------------------------------------------
// Logic for handling edit mode switch when
// unsaved changes exist.
// Author: Captain & Chatman
// Version: MPA Phase IV — Mode Switch Overlay
// ============================================

window.ButtonBoxSwitchMode = (() => {
  function showOverlay(section, onSave, onDiscard, onStay) {
    const overlay = document.getElementById("mode-switch-overlay");
    if (!overlay) return;

    overlay.classList.remove("hidden");

    document.getElementById("mode-switch-save-btn").onclick = () => {
      overlay.classList.add("hidden");
      if (typeof onSave === "function") onSave();
    };

    document.getElementById("mode-switch-discard-btn").onclick = () => {
      overlay.classList.add("hidden");
      if (typeof onDiscard === "function") onDiscard();
    };

    document.getElementById("mode-switch-stay-btn").onclick = () => {
      overlay.classList.add("hidden");
      if (typeof onStay === "function") onStay();
    };
  }

  return {
    showOverlay,
  };
})();
