// ============================================================
// 📁 FILE: api-keys.js
// 📍 LOCATION: static/admin/api-keys/api-keys.js
// 🎯 PURPOSE: Load and render API Key data into the table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxApiKeys
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase IV — Market Holidays Upgrade Applied
// ============================================================

(() => {
  if (window.API_KEYS_LOADED) return;
  window.API_KEYS_LOADED = true;
  console.log("🧭 ApiKeys.js loaded");

  async function loadApiKeys() {
    console.log("📥 loadApiKeys() called");
    try {
      const response = await fetch("/api/api-keys");
      const keys = await response.json();
      console.log("✅ API Keys fetched:", keys);

      const table = document.getElementById("api-keys-table");
      const tbody = table?.querySelector("tbody");
      if (!tbody) throw new Error("Missing <tbody> in api-keys table");
      tbody.innerHTML = "";

      keys.forEach((key, i) => {
        console.log("🔧 Rendering API Key row", i + 1, ":", key);
        const row = document.createElement("tr");
        row.dataset.id = key.id;

        row.innerHTML = `
          <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="${
            key.id
          }" /></td>
          <td class="line-id-col hidden-col" data-original-id="${
            key.id
          }">&nbsp;</td>
          <td contenteditable="true">${key.key_label}</td>
          <td contenteditable="true">${key.key_type}</td>
          <td contenteditable="true">${key.billing_interval}</td>
          <td contenteditable="true">${key.cost_per_month}</td>
          <td contenteditable="true">${key.cost_per_year}</td>
          <td contenteditable="true">${key.usage_limit_sec}</td>
          <td contenteditable="true">${key.usage_limit_min}</td>
          <td contenteditable="true">${key.usage_limit_5min}</td>
          <td contenteditable="true">${key.usage_limit_hour}</td>
          <td contenteditable="true">${key.priority_order}</td>
          <td contenteditable="true">${key.is_active ? "Yes" : "No"}</td>
        `;
        tbody.appendChild(row);
      });

      if (window.ButtonBox && window.ButtonBoxApiKeys) {
        ButtonBoxApiKeys.init();
        ButtonBox.wireCheckboxes("api");
      }

      applyColumnResize("api-keys");
    } catch (err) {
      console.error("❌ loadApiKeys() error:", err);
    }
  }

  function applyColumnResize(sectionKey) {
    const table = document.getElementById(`${sectionKey}-table`);
    if (!table) return;
    const headers = table.querySelectorAll("thead th");

    headers.forEach((th) => {
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
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      handle.addEventListener("dblclick", () => {
        th.style.width = "";
      });

      if (wasHidden) th.style.display = "none";
    });
  }

  window.addEventListener("DOMContentLoaded", loadApiKeys);
})();
