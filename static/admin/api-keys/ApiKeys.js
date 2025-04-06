// static/admin/api-keys/ApiKeys.js
(() => {
  if (window.API_KEYS_LOADED) return;
  window.API_KEYS_LOADED = true;

  window.addEventListener("DOMContentLoaded", loadApiKeys);

  async function loadApiKeys() {
    try {
      const response = await fetch("https://chartflybackend.onrender.com/api/api-keys/");
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
          <td>${sanitizeInput(key.key_label)}</td>
          <td>${sanitizeInput(key.api_key_identifier)}</td>
          <td>${sanitizeInput(key.provider)}</td>
          <td>${formatCell(key.priority_order)}</td>
          <td>${key.is_active ? "Active" : "Inactive"}</td>
          <td>${formatCell(key.usage_limit_sec)}</td>
          <td>${formatCell(key.usage_limit_min)}</td>
          <td>${formatCell(key.usage_limit_5min)}</td>
          <td>${formatCell(key.usage_limit_10min)}</td>
          <td>${formatCell(key.usage_limit_15min)}</td>
          <td>${formatCell(key.usage_limit_hour)}</td>
          <td>${formatCell(key.usage_limit_day)}</td>
          <td>$${parseFloat(key.cost_per_month || 0).toFixed(2)}</td>
          <td>${sanitizeInput(key.billing_interval)}</td>
          <td>${sanitizeInput(key.key_type)}</td>
        `;

        table.appendChild(row);
      });

      const toggle = document.getElementById("toggle-id-column");
      if (toggle) {
        toggle.addEventListener("change", (e) => {
          const show = e.target.checked;
          document.querySelectorAll(".id-col").forEach(col => {
            col.style.display = show ? "" : "none";
          });
        });
      }

      ButtonBox.init({
        section: "api",
        domId: "api-keys-section",
        tableId: "api-keys-table",
        onAction: handleApiKeyAction
      });

    } catch (error) {
      console.error("❌ Failed to load API keys:", error);
      const table = document.getElementById("api-keys-table");
      if (table) {
        table.innerHTML = `<tr><td colspan="17">Failed to load API keys. Please try again later.</td></tr>`;
      }
    }
  }

  function handleApiKeyAction(action, selectedIds) {
    const table = document.getElementById("api-keys-table");

    if (action === "delete") {
      selectedIds.forEach(id => {
        const row = table.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();
      });
      ButtonBox.wireCheckboxes("api");
    }

    if (action === "copy") {
      if (selectedIds.length !== 1) {
        ButtonBox.showWarning("api", "Copy requires exactly 1 row selected.");
        return;
      }

      const row = table.querySelector(`tr[data-id="${selectedIds[0]}"]`);
      if (!row) return;

      const clone = row.cloneNode(true);
      const newId = `copy-${Date.now()}`;
      clone.setAttribute("data-id", newId);
      clone.classList.add("editing");

      clone.querySelector(".col-select").innerHTML =
        `<input type="checkbox" class="api-select-checkbox" data-id="${newId}" checked>`;

      const idCell = clone.querySelector(".id-col");
      if (idCell) idCell.textContent = newId;

      clone.querySelectorAll("td:not(.col-select):not(.id-col)").forEach(cell => {
        cell.setAttribute("contenteditable", "true");
        cell.classList.add("editable");
      });

      table.prepend(clone);
      ButtonBox.wireCheckboxes("api");
    }

    if (action === "add") {
      const newId = `new-${Date.now()}`;
      const row = document.createElement("tr");
      row.classList.add("editing");
      row.setAttribute("data-id", newId);
      row.setAttribute("data-index", "0");

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="${newId}" checked></td>
        <td class="id-col" style="display: none;">${newId}</td>
        <td contenteditable="true" class="editable">Label</td>
        <td contenteditable="true" class="editable">Key123</td>
        <td contenteditable="true" class="editable">Provider</td>
        <td contenteditable="true" class="editable">1</td>
        <td contenteditable="true" class="editable">Active</td>
        <td contenteditable="true" class="editable">1</td>
        <td contenteditable="true" class="editable">10</td>
        <td contenteditable="true" class="editable">20</td>
        <td contenteditable="true" class="editable">30</td>
        <td contenteditable="true" class="editable">45</td>
        <td contenteditable="true" class="editable">60</td>
        <td contenteditable="true" class="editable">100</td>
        <td contenteditable="true" class="editable">$0.00</td>
        <td contenteditable="true" class="editable">monthly</td>
        <td contenteditable="true" class="editable">read</td>
      `;

      row.querySelectorAll("td[contenteditable]").forEach(cell => {
        cell.addEventListener("input", () => row.classList.add("dirty"));
      });

      table.prepend(row);
      ButtonBox.wireCheckboxes("api");
    }

    if (action === "save") {
      const dirtyRows = table.querySelectorAll("tr.editing");

      dirtyRows.forEach((row, i) => {
        row.classList.remove("editing", "dirty");

        row.querySelectorAll("td[contenteditable]").forEach(cell => {
          cell.removeAttribute("contenteditable");
          cell.classList.remove("editable");
        });

        const finalId = `saved-${Date.now()}-${i}`;
        row.setAttribute("data-id", finalId);

        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox) {
          checkbox.setAttribute("data-id", finalId);
          checkbox.checked = false;
        }

        const idCell = row.querySelector(".id-col");
        if (idCell) idCell.textContent = finalId;

        row.classList.remove("selected-row");
      });

      ButtonBox.wireCheckboxes("api");
      ButtonBox.showMessage("api", "API key rows saved (frontend only).", "success");
    }

    if (action === "paste") {
      ButtonBox.showWarning("api", "Paste is not implemented yet.");
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
})();