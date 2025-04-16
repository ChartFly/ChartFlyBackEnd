// ===========================================================
// ✅ button-box-user-management.js
// -----------------------------------------------------------
// ButtonBox Integration Logic for User Management Admin Tab
// Author: Captain & Chatman
// Version: MPA Phase II — Shared Line ID Toggle Logic
// ===========================================================

window.ButtonBoxUserManagement = (() => {
  let initialized = false;

  function handleUserAction(action, selectedIds) {
    const skipSelectionCheck = ["add", "undo", "save", "edit", "copy"];
    if (
      !skipSelectionCheck.includes(action) &&
      (!selectedIds || selectedIds.length === 0)
    ) {
      ButtonBox.showWarning("user", "No rows selected.");
      return;
    }

    ButtonBoxRows.handleRowAction(action, selectedIds, {
      section: "user",
      tableId: "user-management-table",
    });
  }

  function wireIdToggle() {
    const toggle = document.getElementById("user-show-id-toggle");
    if (!toggle) return;

    toggle.addEventListener("change", () => {
      ButtonBox.toggleLineIdVisibility("user", toggle.checked);
    });

    toggle.dispatchEvent(new Event("change"));
  }

  function init() {
    if (initialized) return;
    initialized = true;

    const config = {
      section: "user",
      domId: "user-management-section",
      tableId: "user-management-table",
      tipBoxId: "user-tips",
      warningBoxId: "user-warning",
      footerId: "user-action-footer",
      enabledActions: [
        "edit",
        "copy",
        "paste",
        "add",
        "delete",
        "save",
        "undo",
      ],
      onAction: handleUserAction,
    };

    const waitForBox = setInterval(() => {
      if (window.ButtonBox && window.ButtonBoxRows) {
        clearInterval(waitForBox);
        ButtonBox.init(config);
        wireIdToggle();
      }
    }, 50);
  }

  return { init };
})();
