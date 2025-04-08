// static/admin/market-holidays/ButtonBoxMarketHolidays.js

window.ButtonBoxMarketHolidays = (() => {
  function init() {
    ButtonBox.init({
      section: "holiday",
      domId: "market-holidays-section",
      tableId: "holidays-table",
      onAction: handleHolidayAction,
    });
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

document.addEventListener("DOMContentLoaded", () => {
  if (window.ButtonBoxMarketHolidays) {
    ButtonBoxMarketHolidays.init();
  }
});
