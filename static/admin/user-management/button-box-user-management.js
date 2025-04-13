// ===========================================================
// ✅ button-box-user-management.js
// -----------------------------------------------------------
// ButtonBox Integration Logic for User Management Admin Tab
// Author: Captain & Chatman
// Version: MPA Phase I (User Management)
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

    if (action === "save") {
      // ButtonBoxDataBase.saveToDatabase("user", selectedIds);
    }
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
      }
    }, 50);
  }

  return { init };
})();
