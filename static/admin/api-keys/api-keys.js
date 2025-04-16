// =============================================================
// 📁 FILE: api-keys.js
// 📍 LOCATION: static/admin/api-keys/api-keys.js
// 🎯 PURPOSE: Load and render API Key data into the table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxApiKeys
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase III (ID Column Fix with Manual Cells)
// =============================================================

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

        // Checkbox cell
        const checkboxTd = document.createElement("td");
        checkboxTd.className = "col-select";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "api-select-checkbox";
        checkbox.dataset.id = key.id;
        checkboxTd.appendChild(checkbox);

        // ID column cell
        const idTd = document.createElement("td");
        idTd.className = "line-id-col hidden-col";
        idTd.dataset.originalId = key.id;
        idTd.textContent = key.id;

        // Remaining cells via innerHTML
        const rest = document.createElement("tr");
        rest.innerHTML = `
          <td>${key.key_label}</td>
          <td>${key.key_type}</td>
          <td>${key.billing_interval}</td>
          <td>${key.cost_per_month}</td>
          <td>${key.cost_per_year}</td>
          <td>${key.usage_limit_sec}</td>
          <td>${key.usage_limit_min}</td>
          <td>${key.usage_limit_5min}</td>
          <td>${key.usage_limit_hour}</td>
          <td>${key.priority_order}</td>
          <td>${key.is_active ? "Yes" : "No"}</td>
        `;

        // Assemble the full row
        row.appendChild(checkboxTd);
        row.appendChild(idTd);
        Array.from(rest.children[0].children).forEach((cell) =>
          row.appendChild(cell)
        );

        tbody.appendChild(row);
      });

      console.log(`✅ Rendered ${keys.length} API keys`);

      // ✅ Re-wire ButtonBox + ID toggle logic
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
