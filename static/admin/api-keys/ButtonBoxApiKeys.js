// static/admin/api-keys/ButtonBoxApiKeys.js

window.ButtonBoxApiKeys = (() => {
  function init() {
    const config = {
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
    };

    const waitForBox = setInterval(() => {
      if (window.ButtonBox) {
        clearInterval(waitForBox);
        console.log("🚀 ButtonBox initialized for section: api");
        ButtonBox.init(config);
      }
    }, 50);
  }

  return { init };
})();

// ✅ Add this line to actually run it!
window.ButtonBoxApiKeys.init();
