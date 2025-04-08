// static/admin/api-keys/ApiKeys.js

async function loadApiKeys() {
  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/api-keys/"
    );
    if (!response.ok) throw new Error("Failed to fetch API keys");

    const keys = await response.json();
    const table = document.getElementById("api-keys-table");
    if (!table) throw new Error("❌ api-keys-table element not found");
    table.innerHTML = "";

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

      table.appendChild(row);
    });

    ButtonBoxApiKeys.init();

    const waitForButtonBox = setInterval(() => {
      if (window.ButtonBox && ButtonBox.wireCheckboxes) {
        clearInterval(waitForButtonBox);
        ButtonBox.wireCheckboxes("api");
      }
    }, 50);

    const toggle = document.getElementById("api-show-id-toggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        document
          .querySelectorAll("#api-keys-section .line-id-col")
          .forEach(
            (cell) =>
              (cell.style.display = toggle.checked ? "table-cell" : "none")
          );
      });
      toggle.dispatchEvent(new Event("change"));
    }
  } catch (error) {
    console.error("❌ Failed to load API keys:", error);
    const table = document.getElementById("api-keys-table");
    if (table) {
      table.innerHTML = `<tr><td colspan="6">Failed to load API keys. Please try again later.</td></tr>`;
    }
  }
}

(() => {
  if (window.API_KEYS_LOADED) return;
  window.API_KEYS_LOADED = true;

  window.sanitizeInput = function (input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  };

  window.handleApiKeyAction = ButtonBoxRows.handleRowAction;
})();

window.addEventListener("DOMContentLoaded", loadApiKeys);
