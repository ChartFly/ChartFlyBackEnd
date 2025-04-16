// =============================================================
// 📁 FILE: button-box-api-keys.js
// 📍 LOCATION: static/admin/api-keys/button-box-api-keys.js
// 🎯 PURPOSE: Wire ButtonBox logic to API Keys table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxRows, ButtonBoxColumns
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase I (Header Clicks + ID Toggle Fix)
// =============================================================

window.ButtonBoxApiKeys = (() => {
  let initialized = false;

  function handleApiAction(action, selectedIds) {
    const skipSelectionCheck = ["add", "undo", "save", "edit", "copy"];
    if (
      !skipSelectionCheck.includes(action) &&
      (!selectedIds || selectedIds.length === 0)
    ) {
      ButtonBox.showWarning("api", "No rows selected.");
      return;
    }

    ButtonBoxRows.handleRowAction(action, selectedIds, {
      section: "api",
      tableId: "api-keys-table",
    });

    if (action === "save") {
      // ButtonBoxDataBase.saveToDatabase("api", selectedIds);
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;

    const config = {
      section: "api",
      domId: "api-keys-section",
      tableId: "api-keys-table",
      tipBoxId: "api-info-box",
      warningBoxId: "api-info-box",
      footerId: "api-action-footer",
      enabledActions: [
        "edit",
        "copy",
        "paste",
        "add",
        "delete",
        "save",
        "undo",
      ],
      onAction: handleApiAction,
    };

    const waitForBox = setInterval(() => {
      const table = document.getElementById("api-keys-table");
      if (window.ButtonBox && window.ButtonBoxRows && table) {
        clearInterval(waitForBox);
        ButtonBox.init(config);
        wireIdToggle();
        ButtonBox.wireCheckboxes("api");
        ButtonBoxMessages.updateIdColumnVisibility("api");
        ButtonBoxColumns.activateHeaderClicks("api");
      }
    }, 50);
  }

  function wireIdToggle() {
    const toggle = document.getElementById("api-show-id-toggle");
    if (!toggle) return;

    toggle.addEventListener("change", () => {
      ButtonBoxMessages.updateIdColumnVisibility("api");
    });

    toggle.dispatchEvent(new Event("change"));
  }

  return { init };
})();

// ✅ Auto-run on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.ButtonBoxApiKeys.init();
});
