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

    // ✅ Wire up checkboxes
    window.wireCheckboxes("api");

    // ✅ Initialize ButtonBox
    ButtonBox.init({
      section: "api",
      domId: "api-keys-section",
      tableId: "api-keys-table",
      confirmBoxId: "apikeys-confirm-bar",
      messageId: "apikeys-confirm-message",
      onAction: (action, selectedIds) => {
        console.log(`📦 [ButtonBox] Action triggered: ${action}`, selectedIds);

        if (action === "delete") {
          selectedIds.forEach(id => {
            const row = document.querySelector(`#api-keys-section tr[data-id="${id}"]`);
            if (row) row.remove();
          });
        }

        if (action === "copy") {
          const row = document.querySelector(`#api-keys-section tr[data-id="${selectedIds[0]}"]`);
          if (!row) return;

          const clone = row.cloneNode(true);
          clone.setAttribute("data-id", `copy-${Date.now()}`);
          clone.classList.add("editing");
          clone.querySelectorAll("td:not(.col-select)").forEach(cell => {
            cell.setAttribute("contenteditable", "true");
            cell.classList.add("editable");
          });

          const table = document.getElementById("api-keys-table");
          table.prepend(clone);
        }

        // Additional actions (add, edit, paste) can be implemented similarly
      }
    });

  } catch (error) {
    console.error("❌ Failed to load API keys:", error);
    const table = document.getElementById("api-keys-table");
    table.innerHTML = `<tr><td colspan="17">Failed to load data. Please try again later.</td></tr>`;
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