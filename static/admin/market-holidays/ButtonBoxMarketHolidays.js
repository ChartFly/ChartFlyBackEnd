// static/admin/market-holidays/ButtonBoxMarketHolidays.js

window.ButtonBoxMarketHolidays = (() => {
  function init() {
    const config = {
      section: "holiday",
      domId: "market-holidays-section",
      tableId: "holidays-table",
      onAction: handleHolidayAction,
    };

    const waitForBox = setInterval(() => {
      if (window.ButtonBox) {
        clearInterval(waitForBox);
        ButtonBox.init(config);
      }
    }, 50);
  }

  function handleHolidayAction(action, selectedIds) {
    console.log(
      `⚙️ [holiday] handleHolidayAction fired: ${action}`,
      selectedIds
    );

    if (action === "save") {
      ButtonBoxDataBase.saveToDatabase("holiday", selectedIds);
    }
  }

  return { init };
})();
