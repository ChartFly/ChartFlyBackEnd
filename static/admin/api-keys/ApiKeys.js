// static/admin/api-keys/ApiKeys.js

async function loadApiKeys() {
  console.log("📥 loadApiKeys() has been called");
  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/api-keys/"
    );
    if (!response.ok) throw new Error("Failed to fetch API keys");

    const keys = await response.json();
    console.log("✅ API Keys Fetched:", keys);

    const table = document.getElementById("api-keys-table");
    const tbody = table.querySelector("tbody");
    if (!tbody) throw new Error("Missing <tbody> in API Keys table");

    tbody.innerHTML = "";

    keys.forEach((key, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", key.id);
      row.setAttribute("data-index", index + 1);

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="${
          key.id
        }"></td>
        <td class="line-id-col">${key.id}</td>
        <td>${sanitizeInput(key.name || "—")}</td>
        <td>${sanitizeInput(key.provider || "—")}</td>
        <td>${sanitizeInput(key.key_label || "—")}</td>
        <td>${sanitizeInput(key.status || "Unknown")}</td>
      `;

      tbody.appendChild(row);
    });

    // ✅ Initialize ButtonBox
    const waitForInit = setInterval(() => {
      if (window.ButtonBoxApiKeys?.init && window.ButtonBox?.wireCheckboxes) {
        clearInterval(waitForInit);
        ButtonBoxApiKeys.init();

        setTimeout(() => {
          ButtonBox.wireCheckboxes("api");
        }, 100);
      }
    }, 50);

    // ✅ ID toggle behavior
    const toggle = document.getElementById("api-show-id-toggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        document
          .querySelectorAll("#api-keys-section .line-id-col")
          .forEach((cell) => {
            cell.style.display = toggle.checked ? "table-cell" : "none";
          });
      });
      toggle.dispatchEvent(new Event("change"));
      console.log("✅ api-show-id-toggle wired successfully");
    }
  } catch (error) {
    console.error("❌ Failed to load API keys:", error);
    const tbody = document.querySelector("#api-keys-table tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6">Failed to load API keys. Please try again later.</td></tr>`;
    }
  }
}

function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input ?? "—";
}

(() => {
  if (window.API_KEYS_LOADED) return;
  window.API_KEYS_LOADED = true;

  window.sanitizeInput = sanitizeInput;
  window.handleApiKeyAction = ButtonBoxRows.handleRowAction;

  // ✅ NEW: Ensure we wait for DOM before running
  window.addEventListener("DOMContentLoaded", loadApiKeys);
})();
