// =============================================================
// 📁 FILE: api-keys.js
// 📍 LOCATION: static/admin/api-keys/api-keys.js
// 🎯 PURPOSE: Load and render API Key data into the table
// 🧩 DEPENDENCIES: None (render only)
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase I (Render-Only Refactor)
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

      keys.forEach((key, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="${
            key.id
          }" /></td>
          <td class="id-col hidden-col">${key.id}</td>
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
        tbody.appendChild(row);
      });

      console.log(`✅ Rendered ${keys.length} API keys`);
    } catch (err) {
      console.error("❌ loadApiKeys() error:", err);
    }
  }

  window.addEventListener("DOMContentLoaded", loadApiKeys);
})();
