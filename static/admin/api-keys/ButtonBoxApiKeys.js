// static/admin/api-keys/ButtonBoxApiKeys.js

window.ButtonBoxApiKeys = (() => {
  function init() {
    console.log("🚀 ButtonBox initialized for section: api");
    ButtonBox.init({
      section: "api",
      tableId: "api-keys-table",
      tipBoxId: "api-tips",
      warningBoxId: "api-warning",
      confirmButtonId: "api-confirm-button",
      actionLabelId: "api-action-label",
      selectedCountId: "api-selected-count",
      enabledActions: [
        "edit",
        "copy",
        "paste",
        "add",
        "delete",
        "save",
        "undo",
      ],
      handleAction: window.handleApiKeyAction,
    });
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (window.ButtonBoxApiKeys) {
    ButtonBoxApiKeys.init();
  }
});
