// static/admin/api-keys/ApiKeys.js

let selectedApiRows = new Set();
let activeApiAction = null;
let apiKeysUndoBuffer = null;

window.addEventListener("DOMContentLoaded", () => {
  loadApiKeys();

  // 🔘 Toggle show/hide ID column
  document.getElementById("toggle-id-column").addEventListener("change", function (e) {
    const show = e.target.checked;
    document.querySelectorAll(".id-col").forEach(el => {
      el.style.display = show ? "" : "none";
    });
  });

  // 🔁 Undo Button
  document.getElementById("apikeys-undo-btn").addEventListener("click", () => {
    if (!apiKeysUndoBuffer) return;

    const buffer = apiKeysUndoBuffer;
    const tableBody = document.getElementById("api-keys-table");

    if (buffer.action === 'delete') {
      tableBody.appendChild(buffer.rowElement);
    }

    apiKeysUndoBuffer = null;
    showConfirmBar("Last change undone.");
  });

  // 💾 Save Button
  document.getElementById("apikeys-save-btn").addEventListener("click", () => {
    // TODO: Implement backend save
    apiKeysUndoBuffer = null;
    hideConfirmBar();
    console.log("✅ Changes saved!");
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
        <td class="id-col" style="display: none;">${key.id}</td>
        <td>${sanitizeInput(key.key_label)}</td>
        <td>${sanitizeInput(key.provider)}</td>
        <td>${sanitizeInput(key.priority_order)}</td>
        <td>${key.is_active ? 'Active' : 'Inactive'}</td>
        <td>${sanitizeInput(key.usage_limit_sec)}</td>
        <td>${sanitizeInput(key.usage_limit_min)}</td>
        <td>${sanitizeInput(key.usage_limit_5min)}</td>
        <td>${sanitizeInput(key.usage_limit_10min)}</td>
        <td>${sanitizeInput(key.usage_limit_15min)}</td>
        <td>${sanitizeInput(key.usage_limit_hour)}</td>
        <td>${sanitizeInput(key.usage_limit_day)}</td>
        <td>$${parseFloat(key.cost_per_month || 0).toFixed(2)}</td>
        <td>${sanitizeInput(key.billing_interval)}</td>
        <td>${sanitizeInput(key.key_type)}</td>
      `;

      table.appendChild(row);
    });

    setupApiToolbar();
  } catch (error) {
    console.error("❌ Failed to load API keys:", error);
    const table = document.getElementById("api-keys-table");
    table.innerHTML = `<tr><td colspan="16">Failed to load data. Please try again later.</td></tr>`;
  }
}

function setupApiToolbar() {
  const checkboxes = document.querySelectorAll(".api-select-checkbox");

  checkboxes.forEach(box => {
    box.addEventListener("change", () => {
      const row = box.closest("tr");
      const id = box.dataset.id;

      if (box.checked) {
        selectedApiRows.add(id);
        row.classList.add("selected-row");
      } else {
        selectedApiRows.delete(id);
        row.classList.remove("selected-row");
      }

      updateApiConfirmBox();
    });
  });

  const actions = ["edit", "copy", "paste", "add", "delete", "save"];
  actions.forEach(action => {
    const btn = document.getElementById(`api-${action}-btn`);
    if (!btn) return;

    btn.addEventListener("click", () => {
      activeApiAction = action;

      actions.forEach(a => {
        const otherBtn = document.getElementById(`api-${a}-btn`);
        if (otherBtn) otherBtn.classList.remove("active");
      });
      btn.classList.add("active");

      if (selectedApiRows.size === 0) {
        showConfirmBar("Please select at least one row first.");
        return;
      }

      const selectedIndexes = Array.from(document.querySelectorAll("tr.selected-row"))
        .map(row => row.dataset.index);

      showConfirmBar(`Ready to ${action} row(s): ${selectedIndexes.join(", ")}`);
    });
  });
}

function confirmApiAction() {
  if (!activeApiAction || selectedApiRows.size === 0) {
    showConfirmBar("No action or rows selected.");
    return;
  }

  console.log(`✅ Confirmed [${activeApiAction}] for:`, Array.from(selectedApiRows));

  // 🔁 Example for Delete (only)
  if (activeApiAction === "delete") {
    const table = document.getElementById("api-keys-table");
    const selectedRows = document.querySelectorAll("tr.selected-row");

    selectedRows.forEach(row => {
      const rowId = row.getAttribute("data-id");
      const rowClone = row.cloneNode(true);

      apiKeysUndoBuffer = {
        action: 'delete',
        rowId: rowId,
        rowElement: rowClone
      };

      row.remove();
    });

    showConfirmBar("1 or more rows deleted.");
  }

  activeApiAction = null;
  selectedApiRows.clear();
  document.querySelectorAll(".api-select-checkbox").forEach(box => (box.checked = false));
  document.querySelectorAll("tr.selected-row").forEach(row => row.classList.remove("selected-row"));
  document.querySelectorAll(".action-btn").forEach(btn => btn.classList.remove("active"));
}

function updateApiConfirmBox() {
  const bar = document.getElementById("apikeys-confirm-bar");
  const msg = document.getElementById("apikeys-confirm-message");

  if (selectedApiRows.size === 0) {
    bar.style.display = "none";
    msg.textContent = "";
    return;
  }

  showConfirmBar(`${selectedApiRows.size} row(s) selected.`);
}

function showConfirmBar(message) {
  const bar = document.getElementById("apikeys-confirm-bar");
  const msg = document.getElementById("apikeys-confirm-message");

  msg.textContent = message;
  bar.style.display = "flex";
}

function hideConfirmBar() {
  const bar = document.getElementById("apikeys-confirm-bar");
  bar.style.display = "none";
}

function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input ?? "—";
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}