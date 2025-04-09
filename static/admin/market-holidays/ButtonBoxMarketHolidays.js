// static/admin/market-holidays/ButtonBoxMarketHolidays.js

window.ButtonBoxMarketHolidays = (() => {
  function init() {
    const config = {
      section: "holiday",
      domId: "market-holidays-section",
      tableId: "holidays-table",
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
      if (window.ButtonBox && window.ButtonBoxRows) {
        clearInterval(waitForBox);
        ButtonBox.init(config);
      }
    }, 50);
  }

  function handleHolidayAction(action, selectedIds) {
    console.log(`⚙️ [holiday] handleHolidayAction: ${action}`, selectedIds);

    // Delegate to shared row logic (edit, copy, paste, etc)
    ButtonBoxRows.handleRowAction(action, selectedIds, {
      section: "holiday",
      tableId: "holidays-table",
    });

    // Special hook for saving
    if (action === "save") {
      ButtonBoxDataBase?.saveToDatabase?.("holiday", selectedIds);
    }
  }

  return { init };
})();
