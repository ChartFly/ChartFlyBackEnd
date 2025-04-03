// static/admin/api-keys/ApiKeys.js

window.addEventListener("DOMContentLoaded", () => {
  loadApiKeys();

  document.getElementById("toggle-id-column").addEventListener("change", function (e) {
    const show = e.target.checked;
    document.querySelectorAll(".id-col").forEach(el => {
      el.style.display = show ? "" : "none";
    });
  });
});

async function loadApiKeys() {
  try {
    const response = await fetch("https://chartflybackend.onrender.com/api/api-keys");
    if (!response.ok) throw new Error("Failed to fetch API keys");

    const apiKeys = await response.json();
    const table = document.getElementById("api-keys-table");
    table.innerHTML = "";

    apiKeys.forEach((key, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", key.id);
      row.setAttribute("data-index", index + 1);

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="${key.id}"></td>
        <td class="id-col" style="display: none;">${formatCell(key.id)}</td>
        <td>${sanitizeInput(formatCell(key.key_label))}</td>
        <td>${sanitizeInput(formatCell(key.api_key_identifier))}</td>
        <td>${sanitizeInput(formatCell(key.provider))}</td>
        <td>${formatCell(key.priority_order)}</td>
        <td>${key.is_active ? 'Active' : 'Inactive'}</td>
        <td>${formatCell(key.usage_limit_sec)}</td>
        <td>${formatCell(key.usage_limit_min)}</td>
        <td>${formatCell(key.usage_limit_5min)}</td>
        <td>${formatCell(key.usage_limit_10min)}</td>
        <td>${formatCell(key.usage_limit_15min)}</td>
        <td>${formatCell(key.usage_limit_hour)}</td>
        <td>${formatCell(key.usage_limit_day)}</td>
        <td>$${parseFloat(key.cost_per_month || 0).toFixed(2)}</td>
        <td>${sanitizeInput(formatCell(key.billing_interval))}</td>
        <td>${sanitizeInput(formatCell(key.key_type))}</td>
      `;

      table.appendChild(row);
    });

    // 🔌 Plug in the ButtonBox
    ButtonBox.init({
      section: "api",
      tableId: "api-keys-table",
      domId: "api-keys-section",
      confirmBoxId: "apikeys-confirm-bar",
      messageId: "apikeys-confirm-message"
    });

  } catch (error) {
    console.error("❌ Failed to load API keys:", error);
    const table = document.getElementById("api-keys-table");
    table.innerHTML = `<tr><td colspan="16">Failed to load data. Please try again later.</td></tr>`;
  }
}

function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input ?? "—";
}

function formatCell(value) {
  return value === null || value === undefined ? "—" : value;
}