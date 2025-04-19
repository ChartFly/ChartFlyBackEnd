// =============================================================
// 📁 FILE: button-box-api-keys.js
// 📍 LOCATION: static/admin/api-keys/button-box-api-keys.js
// 🎯 PURPOSE: Wire ButtonBox logic to API Keys table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxRows, ButtonBoxColumns
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase IV — Mode Switch Popup Injected in HTML
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
  }

  function wireIdToggle() {
    const toggle = document.getElementById("api-show-id-toggle");
    if (!toggle) return;

    toggle.addEventListener("change", () => {
      ButtonBox.toggleLineIdVisibility("api", toggle.checked);
    });

    ButtonBox.toggleLineIdVisibility("api", toggle.checked);
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
      if (
        window.ButtonBox &&
        window.ButtonBoxRows &&
        window.ButtonBoxColumns &&
        table
      ) {
        clearInterval(waitForBox);
        ButtonBox.init(config);
        ButtonBox.wireCheckboxes("api");
        ButtonBoxColumns.activateHeaderClicks("api");
        wireIdToggle();
        console.log("✅ ButtonBox API Keys fully initialized");
      }
    }, 50);
  }

  return { init };
})();

window.addEventListener("DOMContentLoaded", () => {
  window.ButtonBoxApiKeys.init();
});
