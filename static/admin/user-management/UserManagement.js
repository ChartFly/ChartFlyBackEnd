// static/admin/user-management/UserManagement.js

window.addEventListener("DOMContentLoaded", () => {
  loadAdminUsers();
});

async function loadAdminUsers() {
  try {
    const response = await fetch("https://chartflybackend.onrender.com/api/admin-users");
    if (!response.ok) throw new Error("Failed to fetch admin users");

    const users = await response.json();
    const table = document.getElementById("user-management-table");
    table.innerHTML = "";

    users.forEach((user, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", user.id);
      row.setAttribute("data-index", index + 1);

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="user-select-checkbox" data-id="${user.id}"></td>
        <td>${sanitizeInput(user.first_name)}</td>
        <td>${sanitizeInput(user.last_name)}</td>
        <td>${sanitizeInput(user.email)}</td>
        <td>${sanitizeInput(user.username)}</td>
        <td>${sanitizeInput(user.role)}</td>
        <td>${user.is_2fa_enabled ? "Yes" : "No"}</td>
        <td>${sanitizeInput(user.status)}</td>
        <td>${sanitizeInput(user.last_login || "—")}</td>
      `;

      table.appendChild(row);
    });

    window.wireCheckboxes("user");

    ButtonBox.init({
      section: "user",
      domId: "user-management-section",
      tableId: "user-management-table",
      confirmBoxId: "user-confirm-bar",
      messageId: "user-confirm-message",
      tipBoxId: "user-tip-box",
      warningBoxId: "user-warning-box",
      onAction: (action, selectedIds) => {
        console.log(`📦 [ButtonBox] Action triggered: ${action}`, selectedIds);

        const table = document.getElementById("user-management-table");

        if (action === "delete") {
          selectedIds.forEach(id => {
            const row = document.querySelector(`#user-management-section tr[data-id="${id}"]`);
            if (row) row.remove();
          });
        }

        if (action === "copy") {
          if (selectedIds.length !== 1) {
            ButtonBox.showMessage("user", "Copy requires exactly 1 row selected.", "warn");
            return;
          }

          const row = document.querySelector(`#user-management-section tr[data-id="${selectedIds[0]}"]`);
          if (!row) return;

          const clone = row.cloneNode(true);
          clone.setAttribute("data-id", `copy-${Date.now()}`);
          clone.classList.add("editing");
          clone.querySelectorAll("td:not(.col-select)").forEach(cell => {
            cell.setAttribute("contenteditable", "true");
            cell.classList.add("editable");
          });

          table.prepend(clone);
          const checkbox = clone.querySelector("input[type='checkbox']");
          if (checkbox) checkbox.checked = true;
        }

        if (action === "add") {
          const newId = `new-${Date.now()}`;
          const newRow = document.createElement("tr");
          newRow.setAttribute("data-id", newId);
          newRow.setAttribute("data-index", "0");
          newRow.classList.add("editing");

          newRow.innerHTML = `
            <td class="col-select"><input type="checkbox" class="user-select-checkbox" data-id="${newId}" checked></td>
            <td contenteditable="true" class="editable">First</td>
            <td contenteditable="true" class="editable">Last</td>
            <td contenteditable="true" class="editable">email@example.com</td>
            <td contenteditable="true" class="editable">username</td>
            <td contenteditable="true" class="editable">admin</td>
            <td contenteditable="true" class="editable">Yes</td>
            <td contenteditable="true" class="editable">Active</td>
            <td contenteditable="true" class="editable">—</td>
          `;

          table.prepend(newRow);
        }

        if (action === "save") {
          const dirtyRows = table.querySelectorAll("tr.editing");
          dirtyRows.forEach(row => {
            row.classList.remove("editing");
            row.querySelectorAll("td:not(.col-select)").forEach(cell => {
              cell.removeAttribute("contenteditable");
              cell.classList.remove("editable");
            });
            const checkbox = row.querySelector("input[type='checkbox']");
            if (checkbox) checkbox.checked = false;
            row.classList.remove("selected-row");
          });
          ButtonBox.showMessage("user", "User rows saved (frontend only).", "success");
        }
      }
    });

  } catch (error) {
    console.error("❌ Failed to load admin users:", error);
    const table = document.getElementById("user-management-table");
    table.innerHTML = `<tr><td colspan="9">Failed to load users. Please try again later.</td></tr>`;
  }
}

function sanitizeInput(input) {
  return typeof input === "string"
    ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : input ?? "—";
}