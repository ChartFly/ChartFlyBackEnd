// =============================================================
// 📁 FILE: api-keys.js
// 📍 LOCATION: static/admin/api-keys/api-keys.js
// 🎯 PURPOSE: Load and render API key data into the API Keys table
// 🧩 DEPENDENCIES: ButtonBox, ButtonBoxApiKeys
// 👥 Author: Captain & Chatman
// 🔖 Version: MPA Phase I (API Keys Script Refactor)
// =============================================================

(() => {
  if (window.API_KEYS_LOADED) return;
  window.API_KEYS_LOADED = true;
  console.log("🧭 ApiKeys.js loaded");

  async function loadApiKeys() {
    console.log("📥 loadApiKeys() called");
    try {
      const response = await fetch("/api/api-keys");
      const apiKeys = await response.json();
      console.log("✅ API Keys fetched:", apiKeys);

      const table = document.getElementById("api-keys-table");
      const tbody = table?.querySelector("tbody");
      if (!tbody) throw new Error("Missing <tbody> in API Keys table");
      tbody.innerHTML = "";

      apiKeys.forEach((key, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="col-select"><input type="checkbox" /></td>
          <td class="id-col hidden-col">${key.id}</td>
          <td>${key.key_label}</td>
          <td>${key.key_type}</td>
          <td>${key.billing_interval}</td>
          <td>${key.cost_per_month}</td>
          <td>${key.cost_per_year}</td>
          <td>${key.api_key_identifier}</td>
          <td>${key.is_active ? "✅" : "❌"}</td>
        `;
        tbody.appendChild(row);
      });

      if (window.ButtonBox && window.ButtonBoxApiKeys) {
        ButtonBoxApiKeys.init();
        ButtonBox.wireCheckboxes("api-keys");
      }
    } catch (err) {
      console.error("❌ loadApiKeys() error:", err);
    }
  }

  window.addEventListener("DOMContentLoaded", loadApiKeys);
})();
