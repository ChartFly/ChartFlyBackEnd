// =============================================================
// 📁 FILE: market-holidays.js
// 📍 LOCATION: static/admin/market-holidays/market-holidays.js
// 🎯 PURPOSE: Load and render holiday data into the holidays table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxMarketHolidays
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase IV — Final Lockdown Edition
// =============================================================

(() => {
  if (window.MARKET_HOLIDAYS_LOADED) return;
  window.MARKET_HOLIDAYS_LOADED = true;
  console.log("🧭 MarketHolidays.js loaded");

  async function loadMarketHolidays() {
    console.log("📥 loadMarketHolidays() called");
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
          <td class="line-id-col hidden-col" data-original-id="${
            holiday.id
          }">&nbsp;</td>
          <td>${holiday.name}</td>
          <td>${holiday.date}</td>
          <td>${holiday.close_time ?? ""}</td>
          <td>${holiday.status}</td>
        `;
        tbody.appendChild(row);
      });

      const idToggle = document.getElementById("holiday-show-id-toggle");
      if (idToggle) {
        idToggle.addEventListener("change", () => {
          ButtonBox.toggleLineIdVisibility("holiday", idToggle.checked);
          setTimeout(() => {
            applyColumnResize("market-holidays");
            lockAllColumnWidths("market-holidays");
            lockTableWidth("market-holidays");
          }, 100);
        });
      }

      if (window.ButtonBox && window.ButtonBoxMarketHolidays) {
        ButtonBoxMarketHolidays.init();
        ButtonBox.wireCheckboxes("holiday");
      }

      applyStartingWidths("market-holidays");
      applyColumnResize("market-holidays");
      lockAllColumnWidths("market-holidays");
      lockTableWidth("market-holidays");
    } catch (err) {
      console.error("❌ loadMarketHolidays() error:", err);
    }
  }

  function applyStartingWidths(sectionKey) {
    const table = document.getElementById(`${sectionKey}-table`);
    if (!table) return;
    const headers = table.querySelectorAll("thead th");

    headers.forEach((th) => {
      if (th.classList.contains("col-select")) {
        th.style.width = "50px";
      } else if (th.classList.contains("line-id-col")) {
        th.style.width = "60px";
      } else if (th.classList.contains("col-name")) {
        th.style.width = "180px";
      } else if (th.classList.contains("col-date")) {
        th.style.width = "100px";
      } else if (th.classList.contains("col-close")) {
        th.style.width = "100px";
      } else if (th.classList.contains("col-status")) {
        th.style.width = "120px";
      }
    });
  }

  function applyColumnResize(sectionKey) {
    const table = document.getElementById(`${sectionKey}-table`);
    if (!table) return;
    const headers = table.querySelectorAll("thead th");

    const savedWidths = JSON.parse(
      localStorage.getItem(`chartfly_colwidths_${sectionKey}`) || "{}"
    );

    headers.forEach((th) => {
      const headerText = th.textContent?.trim() || th.dataset.name || "Unnamed";
      if (savedWidths[headerText]) {
        th.style.width = savedWidths[headerText] + "px";
      }

      if (th.classList.contains("col-select")) return;

      const wasHidden = th.style.display === "none";
      if (wasHidden) th.style.display = "table-cell";

      const handle = document.createElement("div");
      handle.className = "resize-handle";
      handle.title = "Drag to resize • Double-click to reset";
      th.appendChild(handle);

      let startX, startWidth;

      handle.addEventListener("mousedown", (e) => {
        startX = e.pageX;
        startWidth = th.offsetWidth;
        document.body.style.cursor = "col-resize";

        // 🛡️ LOCK everything immediately on mousedown
        lockAllColumnWidths(sectionKey);
        lockTableWidth(sectionKey);

        headers.forEach((otherTh) => {
          if (otherTh !== th) {
            const width = otherTh.offsetWidth;
            otherTh.style.width = `${width}px`;
            otherTh.style.minWidth = `${width}px`;
            otherTh.style.maxWidth = `${width}px`;
          }
        });

        function onMouseMove(e) {
          const newWidth = Math.max(40, startWidth + e.pageX - startX);
          th.style.width = `${newWidth}px`;
        }

        function onMouseUp() {
          document.body.style.cursor = "";
          const headerText =
            th.textContent?.trim() || th.dataset.name || "Unnamed";
          savedWidths[headerText] = th.offsetWidth;
          localStorage.setItem(
            `chartfly_colwidths_${sectionKey}`,
            JSON.stringify(savedWidths)
          );
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);

          // 🛡️ Re-lock all columns and table after drag
          lockAllColumnWidths(sectionKey);
          lockTableWidth(sectionKey);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      handle.addEventListener("dblclick", () => {
        th.style.width = "";
        const headerText =
          th.textContent?.trim() || th.dataset.name || "Unnamed";
        delete savedWidths[headerText];
        localStorage.setItem(
          `chartfly_colwidths_${sectionKey}`,
          JSON.stringify(savedWidths)
        );
      });

      if (wasHidden) th.style.display = "none";
    });
  }

  document.addEventListener("mousedown", (e) => {
    const selectHeader = document.querySelector(
      "#market-holidays-section .admin-table th.col-select"
    );
    const selectCells = document.querySelectorAll(
      "#market-holidays-section .admin-table td.col-select"
    );

    if (e.target.closest(".resize-handle")) {
      if (selectHeader) {
        selectHeader.style.width = "50px";
        selectHeader.style.minWidth = "50px";
        selectHeader.style.maxWidth = "50px";
      }
      selectCells.forEach((cell) => {
        cell.style.width = "50px";
        cell.style.minWidth = "50px";
        cell.style.maxWidth = "50px";
      });
    }
  });

  function lockAllColumnWidths(sectionKey) {
    const table = document.getElementById(`${sectionKey}-table`);
    if (!table) return;
    const headers = table.querySelectorAll("thead th");

    headers.forEach((th) => {
      const width = th.offsetWidth;
      th.style.width = `${width}px`;
      th.style.minWidth = `${width}px`;
      th.style.maxWidth = `${width}px`;
    });
  }

  function lockTableWidth(sectionKey) {
    const table = document.getElementById(`${sectionKey}-table`);
    if (!table) return;
    const headers = table.querySelectorAll("thead th");

    let totalWidth = 0;
    headers.forEach((th) => {
      totalWidth += th.offsetWidth;
    });

    table.style.width = `${totalWidth}px`;
    table.style.minWidth = `${totalWidth}px`;
    table.style.maxWidth = `${totalWidth}px`;
  }

  window.addEventListener("DOMContentLoaded", loadMarketHolidays);
})();
