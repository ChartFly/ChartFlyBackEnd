// static/admin/market-holidays/ButtonBoxMarketHolidays.js
window.ButtonBoxMarketHolidays = (() => {
  let initialized = false;

  function handleHolidayAction(action, selectedIds) {
    if (
      !["add", "undo", "save"].includes(action) &&
      (!selectedIds || selectedIds.length === 0)
    ) {
      ButtonBox.showWarning("holiday", "No rows selected.");
      return;
    }

    ButtonBoxRows.handleRowAction(action, selectedIds, {
      section: "holiday",
      tableId: "holidays-table",
    });

    if (action === "save") {
      // 🔧 Disabled backend call to avoid crash
      // ButtonBoxDataBase?.saveToDatabase?.("holiday", selectedIds);
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;

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
        wireIdToggle();
      }
    }, 50);
  }

  function wireIdToggle() {
    const toggle = document.getElementById("holiday-show-id-toggle");
    if (!toggle) return;

    toggle.addEventListener("change", () => {
      const visible = toggle.checked;
      document
        .querySelectorAll(
          "#market-holidays-section .line-id-col, #market-holidays-section th.line-id-col"
        )
        .forEach((el) => {
          el.style.display = visible ? "table-cell" : "none";
        });
    });

    toggle.dispatchEvent(new Event("change"));
  }

  return { init };
})();

window.ButtonBoxMarketHolidays.init();
