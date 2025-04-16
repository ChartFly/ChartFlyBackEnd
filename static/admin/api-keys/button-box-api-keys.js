// =============================================================
// 📁 FILE: button-box-api-keys.js
// 📍 LOCATION: static/admin/api-keys/button-box-api-keys.js
// 🎯 PURPOSE: Wire ButtonBox logic to API Keys table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxRows, ButtonBoxColumns
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase I (Column Click Enabled)
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
      if (
        window.ButtonBox &&
        window.ButtonBoxRows &&
        window.ButtonBoxColumns &&
        table
      ) {
        clearInterval(waitForBox);
        ButtonBox.init(config);
        wireIdToggle();
        ButtonBox.wireCheckboxes("api");
        ButtonBoxColumns.activateHeaderClicks("api"); // 🟧 Enable column click-to-edit
      }
    }, 50);
  }

  function wireIdToggle() {
    const toggle = document.getElementById("api-show-id-toggle");
    if (!toggle) return;

    toggle.addEventListener("change", () => {
      const visible = toggle.checked;
      document
        .querySelectorAll(
          "#api-keys-section .line-id-col, #api-keys-section th.line-id-col"
        )
        .forEach((el) => {
          el.style.display = visible ? "table-cell" : "none";
        });
    });

    toggle.dispatchEvent(new Event("change"));
  }

  return { init };
})();

// ✅ Auto-run on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.ButtonBoxApiKeys.init();
});
