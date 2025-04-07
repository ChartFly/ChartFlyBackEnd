// static/admin/market-holidays/ButtonBoxMarketHolidays.js

// Wire this up by calling ButtonBoxMarketHolidays.init(), not ButtonBox.init() directly

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

    if (action === "save") {
      // Hook into ButtonBoxDataBase save logic
      ButtonBoxDataBase.saveToDatabase("holiday", selectedIds);
    }

    // Optional: Custom action overrides can go here in the future
  }

  return {
    init
  };
})();
