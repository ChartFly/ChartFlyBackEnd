// =============================================================
// 📁 FILE: market-holidays.js
// 📍 LOCATION: static/admin/market-holidays/market-holidays.js
// 🎯 PURPOSE: Load and render holiday data into the holidays table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxMarketHolidays
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase I (Market Holidays Script Refactor)
// =============================================================

(() => {
  if (window.MARKET_HOLIDAYS_LOADED) return;
  window.MARKET_HOLIDAYS_LOADED = true;
  console.log("🧭 MarketHolidays.js loaded");

  async function loadMarketHolidays() {
    console.log("📥 loadMarketHolidays() called");
    console.log("📍 MarketHolidays call stack:", new Error().stack);
    try {
      const response = await fetch("/api/holidays/year/2025");
      const holidays = await response.json();
      console.log("✅ Holidays fetched:", holidays);

      const table = document.getElementById("market-holidays-table");
      const tbody = table?.querySelector("tbody");
      if (!tbody) throw new Error("Missing <tbody> in holidays table");
      tbody.innerHTML = "";

      holidays.forEach((holiday, i) => {
        console.log("🔧 Rendering holiday row", i + 1, ":", holiday);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="col-select"><input type="checkbox" /></td>  
          <td class="id-col hidden-col">${holiday.id}</td>
          <td>${holiday.name}</td>  
          <td>${holiday.date}</td>
          <td>${holiday.close_time ?? ""}</td>
          <td>${holiday.status}</td>
        `;
        tbody.appendChild(row);
      });
      console.log(`✅ Rendered ${holidays.length} holidays`);

      const idToggle = document.getElementById("holiday-show-id-toggle");
      console.log("🔍 market-holidays-show-id-toggle:", idToggle);
      if (!idToggle)
        console.warn("⚠️ market-holidays-show-id-toggle not found");

      if (window.ButtonBox && window.ButtonBoxMarketHolidays) {
        console.log("✅ ButtonBox and MarketHolidays init functions available");
        ButtonBoxMarketHolidays.init();
        ButtonBox.wireCheckboxes("market-holidays");
      }
    } catch (err) {
      console.error("❌ loadMarketHolidays() error:", err);
    }
  }

  window.addEventListener("DOMContentLoaded", loadMarketHolidays);
})();
