// ============================================================
// 📁 FILE: api-keys.js
// 📍 LOCATION: static/admin/api-keys/api-keys.js
// 🎯 PURPOSE: Load and render API Key data into the table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxApiKeys
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase III (Fixed ID Column + Preserved Formatting)
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

      keys.forEach((key) => {
        const row = document.createElement("tr");
        row.dataset.id = key.id;

        // 🔘 Select checkbox
        const selectTd = document.createElement("td");
        selectTd.className = "col-select";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "api-select-checkbox";
        checkbox.dataset.id = key.id;
        selectTd.appendChild(checkbox);

        // 🆔 ID column
        const idTd = document.createElement("td");
        idTd.className = "line-id-col hidden-col";
        idTd.dataset.originalId = key.id;
        idTd.textContent = key.id;

        // 🧱 Data cells
        const cells = [
          key.key_label,
          key.key_type,
          key.billing_interval,
          key.cost_per_month,
          key.cost_per_year,
          key.usage_limit_sec,
          key.usage_limit_min,
          key.usage_limit_5min,
          key.usage_limit_hour,
          key.priority_order,
          key.is_active ? "Yes" : "No",
        ];

        const editableKeys = [
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true, // editable until "Active"
        ];

        const tdElements = cells.map((value, i) => {
          const td = document.createElement("td");
          td.textContent = value;
          td.setAttribute("contenteditable", "true");
          return td;
        });

        // 🧩 Final assembly
        row.appendChild(selectTd);
        row.appendChild(idTd);
        tdElements.forEach((td) => row.appendChild(td));
        tbody.appendChild(row);
      });

      console.log(`✅ Rendered ${keys.length} API keys`);

      // 🔁 Wire ButtonBox and ID toggle logic
      if (window.ButtonBox && window.ButtonBoxApiKeys) {
        ButtonBoxApiKeys.init();
        ButtonBox.wireCheckboxes("api");

        const toggle = document.getElementById("api-show-id-toggle");
        if (toggle) {
          ButtonBox.toggleLineIdVisibility("api", toggle.checked);
          console.log("🔄 Re-applied ID toggle post-render");
        }
      }
    } catch (err) {
      console.error("❌ loadApiKeys() error:", err);
    }
  }

  window.addEventListener("DOMContentLoaded", loadApiKeys);
})();
