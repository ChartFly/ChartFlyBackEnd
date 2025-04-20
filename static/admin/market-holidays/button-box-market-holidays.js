// ============================================================================
// 📁 FILE: button-box-market-holidays.js
// 📍 LOCATION: static/admin/market-holidays/button-box-market-holidays.js
// 🎯 PURPOSE: Initializes ButtonBox for the Market Holidays section
// 🧩 AUTHOR: Captain & Chatman
// 🔖 Version: MPA Phase IV — Shared Logic Finalized
// ============================================================================

window.ButtonBoxMarketHolidays = (() => {
  let initialized = false;

  function handleHolidayAction(action, selectedIds) {
    const skipSelectionCheck = ["add", "undo", "save", "edit", "copy"];
    if (
      !skipSelectionCheck.includes(action) &&
      (!selectedIds || selectedIds.length === 0)
    ) {
      ButtonBox.showWarning("holiday", "No rows selected.");
      return;
    }

    ButtonBoxRows.handleRowAction(action, selectedIds, {
      section: "holiday",
      tableId: "market-holidays-table",
    });
  }

  function wireIdToggle() {
    const toggle = document.getElementById("holiday-show-id-toggle");
    if (!toggle) return;

    toggle.addEventListener("change", () => {
      ButtonBox.toggleLineIdVisibility("holiday", toggle.checked);
    });

    toggle.dispatchEvent(new Event("change"));
  }

  function init() {
    if (initialized) return;
    initialized = true;

    const config = {
      section: "holiday",
      domId: "market-holidays-section",
      tableId: "market-holidays-table",
      tipBoxId: "holiday-info-box",
      warningBoxId: "holiday-info-box",
      footerId: "holiday-action-footer",
      enabledActions: [
        "edit",
        "copy",
        "paste",
        "add",
        "delete",
        "save",
        "undo",
      ],
      onAction: handleHolidayAction,
    };

    const waitForBox = setInterval(() => {
      if (window.ButtonBox && window.ButtonBoxRows && window.ButtonBoxColumns) {
        clearInterval(waitForBox);
        ButtonBox.init(config);
        ButtonBox.wireCheckboxes("holiday");
        ButtonBoxColumns.activateHeaderClicks("holiday");
        wireIdToggle();
        console.log("✅ ButtonBox Market Holidays fully initialized");
      }
    }, 50);
  }

  return { init };
})();

window.addEventListener("DOMContentLoaded", () => {
  window.ButtonBoxMarketHolidays.init();
});
