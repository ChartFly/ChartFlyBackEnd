// static/admin/market-holidays/ButtonBoxMarketHolidays.js

window.ButtonBoxMarketHolidays = (() => {
  let initialized = false;

  function handleHolidayAction(action, selectedIds) {
    console.log(`⚙️ [holiday] handleHolidayAction: ${action}`, selectedIds);

    // Skip "no selection" warning for these actions
    const skipSelectionCheck = ["add", "undo", "save", "edit", "copy"];
    if (
      !skipSelectionCheck.includes(action) &&
      (!selectedIds || selectedIds.length === 0)
    ) {
      ButtonBox.showWarning("holiday", "No rows selected.");
      return;
    }

    // 🚀 Delegate to shared row logic
    ButtonBoxRows.handleRowAction(action, selectedIds, {
      section: "holiday",
      tableId: "holidays-table",
    });

    // Placeholder: call backend save logic if needed
    if (action === "save") {
      ButtonBoxDataBase?.saveToDatabase?.("holiday", selectedIds);
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;

    console.log("📦 ButtonBoxMarketHolidays: Preparing to initialize...");

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
        console.log("✅ ButtonBoxMarketHolidays: Initializing ButtonBox");
        ButtonBox.init(config);
        wireIdToggle();
      }
    }, 50);
  }

  function wireIdToggle() {
    const toggle = document.getElementById("holiday-show-id-toggle");
    if (!toggle) {
      console.warn("⚠️ ID toggle not found: #holiday-show-id-toggle");
      return;
    }

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

    toggle.dispatchEvent(new Event("change")); // Trigger once on init
    console.log("🆔 ButtonBoxMarketHolidays: ID toggle wired");
  }

  return { init };
})();

// 🛠️ Auto-run the init
window.ButtonBoxMarketHolidays.init();
