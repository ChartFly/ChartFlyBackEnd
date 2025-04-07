// static/admin/api-keys/ApiKeys.js

async function loadApiKeys() {
  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/api-keys/"
    );
    if (!response.ok) throw new Error("Failed to fetch API keys");

    const data = await response.json();
    const table = document.getElementById("api-keys-table");
    table.innerHTML = "";

    data.forEach((item, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", item.id);
      row.setAttribute("data-index", index + 1);

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="${
          item.id
        }"></td>
        <td class="line-id-col">${item.id}</td>
        <td>${sanitizeInput(item.name || "")}</td>
        <td>${sanitizeInput(item.provider || "")}</td>
        <td>${item.is_active ? "Active" : "Inactive"}</td>
        <td>${sanitizeInput(item.key_type || "")}</td>
        <td>${sanitizeInput(item.auth_method || "")}</td>
        <td>${sanitizeInput(item.billing_interval || "")}</td>
        <td>${item.cost_per_month ?? "—"}</td>
        <td>${item.cost_per_year ?? "—"}</td>
      `;

      table.appendChild(row);
    });

    // ✅ Init and wire checkboxes
    ButtonBoxApiKeys.init();
    ButtonBox.wireCheckboxes("api");
  } catch (error) {
    console.error("❌ Failed to load API keys:", error);
    const table = document.getElementById("api-keys-table");
    table.innerHTML = `<tr><td colspan="10">Failed to load API keys.</td></tr>`;
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

  // 🧠 Delegate to ButtonBoxRows
  window.handleApiAction = ButtonBoxRows.handleRowAction;
})();

window.addEventListener("DOMContentLoaded", loadApiKeys);
