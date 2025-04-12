// static/admin/api-keys/ApiKeys.js

console.log("🧭 ApiKeys.js loaded");

async function loadApiKeys() {
  console.log("📥 loadApiKeys() has been called");

  try {
    const response = await fetch("/api/api-keys/");
    if (!response.ok) throw new Error("Failed to fetch API keys");

    const keys = await response.json();
    console.log("✅ API Keys Fetched:", keys);

    const table = document.getElementById("api-keys-table");
    console.log("🔍 api-keys-table element:", table);
    if (!table) {
      console.error("❌ api-keys-table not found");
      return;
    }

    const tbody =
      table.querySelector("tbody") || table.getElementsByTagName("tbody")[0];
    console.log("🔍 <tbody> inside api-keys-table:", tbody);
    if (!tbody) {
      console.error("❌ <tbody> not found inside api-keys-table");
      return;
    }

    console.log("🧹 Clearing existing rows");
    tbody.innerHTML = "";

    keys.forEach((key, index) => {
      console.log(`🔧 Rendering row ${index + 1}:`, key);
      const row = document.createElement("tr");
      row.setAttribute("data-id", key.id);
      row.setAttribute("data-index", index + 1);

      row.innerHTML = `
        <td class="col-select">
          <input type="checkbox" class="api-select-checkbox" data-id="${
            key.id
          }">
        </td>
        <td class="line-id-col">${key.id}</td>
        <td>${sanitizeInput(key.name || "—")}</td>
        <td>${sanitizeInput(key.provider || "—")}</td>
        <td>${sanitizeInput(key.key_label || "—")}</td>
        <td>${sanitizeInput(key.status || "Unknown")}</td>
      `;

      tbody.appendChild(row);
    });

    console.log(`✅ Rendered ${keys.length} API key rows`);

    console.log("🔧 Calling ButtonBoxApiKeys.init()");
    ButtonBoxApiKeys.init();

    const waitForButtonBox = setInterval(() => {
      if (window.ButtonBox?.wireCheckboxes) {
        console.log("✅ ButtonBox.wireCheckboxes is available, wiring...");
        clearInterval(waitForButtonBox);
        ButtonBox.wireCheckboxes("api");
      } else {
        console.log("⏳ Waiting for ButtonBox.wireCheckboxes...");
      }
    }, 50);

    const toggle = document.getElementById("api-show-id-toggle");
    console.log("🔍 api-show-id-toggle element:", toggle);
    if (toggle) {
      console.log("✅ Found api-show-id-toggle, adding event listener");
      toggle.addEventListener("change", () => {
        const visible = toggle.checked;
        console.log(`🔁 Toggling ID column visibility: ${visible}`);
        document
          .querySelectorAll("#api-keys-section .line-id-col")
          .forEach((cell) => {
            cell.style.display = visible ? "table-cell" : "none";
          });
      });
      toggle.dispatchEvent(new Event("change"));
    } else {
      console.warn("⚠️ api-show-id-toggle not found");
    }
  } catch (error) {
    console.error("❌ loadApiKeys failed:", error);
    const fallback = document.querySelector("#api-keys-table tbody");
    if (fallback) {
      fallback.innerHTML = `<tr><td colspan="6">Failed to load API keys. Please try again later.</td></tr>`;
    }
  }
}

// ✅ Init logic with tab visibility guard
(() => {
  console.log("🧪 ApiKeys IIFE script init running...");
  if (window.API_KEYS_SCRIPT_LOADED) {
    console.log("⚠️ ApiKeys script already initialized, skipping...");
    return;
  }
  window.API_KEYS_SCRIPT_LOADED = true;

  window.sanitizeInput = function (input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  };

  window.handleApiKeyAction = ButtonBoxRows.handleRowAction;

  console.log("🧪 API_KEYS_SCRIPT_LOADED set = true");
})();
