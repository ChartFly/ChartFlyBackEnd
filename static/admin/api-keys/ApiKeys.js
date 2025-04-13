// static/admin/api-keys/ApiKeys.js
(() => {
  if (window.API_KEYS_LOADED) return;
  window.API_KEYS_LOADED = true;
  console.log("🧭 ApiKeys.js loaded");

  async function loadApiKeys() {
    console.log("📥 loadApiKeys() has been called");
    console.log("📍 ApiKeys call stack:", new Error().stack);
    try {
      const response = await fetch("/api/api-keys/");
      const keys = await response.json();
      console.log("✅ API Keys Fetched:", keys);

      const table = document.getElementById("apikey-table");
      const tbody = table?.querySelector("tbody");
      if (!tbody) throw new Error("Missing <tbody> in API Keys table");
      tbody.innerHTML = "";

      keys.forEach((key, i) => {
        console.log("🔧 Rendering API key row", i + 1, ":", key);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="id-col hidden-col">${key.id}</td>
          <td>${key.label}</td>
          <td>${key.key}</td>
          <td>${key.limit}</td>
          <td>${key.used}</td>
          <td>${key.status}</td>
          <td><input type="checkbox" /></td>
        `;
        tbody.appendChild(row);
      });
      console.log(`✅ Rendered ${keys.length} API keys`);

      const idToggle = document.getElementById("api-keys-show-id-toggle");
      console.log("🔍 api-keys-show-id-toggle:", idToggle);
      if (!idToggle) console.warn("⚠️ api-keys-show-id-toggle not found");

      if (window.ButtonBox && window.ButtonBoxApiKeys) {
        console.log("✅ ButtonBox and ApiKeys init functions available");
        ButtonBoxApiKeys.init();
        ButtonBox.wireCheckboxes("api-keys");
      }
    } catch (err) {
      console.error("❌ loadApiKeys() error:", err);
    }
  }

  window.addEventListener("DOMContentLoaded", loadApiKeys);
})();
