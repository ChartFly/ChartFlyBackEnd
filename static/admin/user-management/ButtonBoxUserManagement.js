// static/admin/user-management/ButtonBoxUserManagement.js

window.ButtonBoxUserManagement = (() => {
  function init() {
    console.log("🚀 ButtonBox initialized for section: user");
    ButtonBox.init({
      section: "user",
      tableId: "user-management-table",
      tipBoxId: "user-tips",
      warningBoxId: "user-warning",
      confirmButtonId: "user-confirm-button",
      actionLabelId: "user-action-label",
      selectedCountId: "user-selected-count",
      enabledActions: [
        "edit",
        "copy",
        "paste",
        "add",
        "delete",
        "save",
        "undo",
      ],
      handleAction: window.handleUserAction,
    });
  }

  return { init };
})();
