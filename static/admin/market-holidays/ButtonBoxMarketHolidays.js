// static/admin/market-holidays/ButtonBoxMarketHolidays.js

// Wire this up by calling this not ButtonBox Direct, ButtonBoxMarketHolidays.init();

window.ButtonBoxMarketHolidays = (() => {
  function init() {
    ButtonBox.init({
      section: "holiday",
      domId: "market-holidays-section",
      tableId: "holidays-table",
      onAction: handleHolidayAction
    });
  }

  function handleHolidayAction(action, selectedIds) {
    console.log(`⚙️ [holiday] handleHolidayAction fired: ${action}`, selectedIds);

    // For now, rely on ButtonBoxRows logic for everything.
    // This placeholder can override behaviors in future if needed.
    if (action === "save") {
      // You could intercept and validate here if needed
      ButtonBoxDataBase.saveToDatabase("holiday", selectedIds);
    }
  }

  return {
    init
  };
})();