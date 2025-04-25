// ============================================================================
// 📁 FILE: button-box-market-holidays.js
// 📍 LOCATION: static/admin/market-holidays/button-box-market-holidays.js
// 🎯 PURPOSE: Initializes ButtonBox for the Market Holidays section
// 🧩 AUTHOR: Captain & Chatman
// 🔖 Version: MPA Phase IV — WireIdToggle Forced & Verified
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
    console.log("🔌 Attempting to wire holiday-show-id-toggle...");
    const toggle = document.getElementById("holiday-show-id-toggle");

    if (!toggle) {
      console.warn("❌ holiday-show-id-toggle not found at wireIdToggle()");
      return;
    }

    console.log("🎯 Found holiday-show-id-toggle:", toggle);

    toggle.addEventListener("change", () => {
      console.log("🌀 Checkbox changed. Checked:", toggle.checked);
      ButtonBox.toggleLineIdVisibility("holiday", toggle.checked);
    });

    // ✅ Immediately apply on load
    console.log("⚡ Applying toggle state now:", toggle.checked);
    ButtonBox.toggleLineIdVisibility("holiday", toggle.checked);
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

        // 🧪 Force it no matter what
        console.log("🔧 Forcing wireIdToggle immediately after init...");
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
