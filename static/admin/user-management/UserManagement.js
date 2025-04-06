// static/admin/user-management/UserManagement.js
(() => {
  if (window.USER_MANAGEMENT_LOADED) return;
  window.USER_MANAGEMENT_LOADED = true;

  window.addEventListener("DOMContentLoaded", loadAdminUsers);

  async function loadAdminUsers() {
    try {
      const response = await fetch("https://chartflybackend.onrender.com/api/users/");
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
          <td class="line-id-col" style="display: none;">${user.id}</td>
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

      ButtonBox.init({
        section: "user",
        domId: "user-management-section",
        tableId: "user-management-table",
        confirmBoxId: "user-confirm-bar",
        messageId: "user-confirm-message",
        tipBoxId: "user-tip-box",
        warningBoxId: "user-warning-box",
        onAction: (action, selectedIds) => {
          const table = document.getElementById("user-management-table");

          if (action === "delete") {
            selectedIds.forEach(id => {
              const row = table.querySelector(`tr[data-id="${id}"]`);
              if (row) row.remove();
            });
          }

          if (action === "copy") {
            if (selectedIds.length !== 1) {
              ButtonBox.showWarning("user", "Copy requires exactly 1 row selected.");
              return;
            }

            const row = table.querySelector(`tr[data-id="${selectedIds[0]}"]`);
            if (!row) return;

            const clone = row.cloneNode(true);
            const newId = `copy-${Date.now()}`;
            clone.setAttribute("data-id", newId);
            clone.classList.add("editing");

            clone.querySelectorAll("td:not(.col-select):not(.line-id-col)").forEach(cell => {
              cell.setAttribute("contenteditable", "true");
              cell.classList.add("editable");
            });

            clone.querySelector(".col-select").innerHTML =
              `<input type="checkbox" class="user-select-checkbox" data-id="${newId}" checked>`;
            clone.querySelector(".line-id-col").textContent = newId;

            table.prepend(clone);
          }

          if (action === "add") {
            const newId = `new-${Date.now()}`;
            const row = document.createElement("tr");
            row.classList.add("editing");
            row.setAttribute("data-id", newId);
            row.setAttribute("data-index", "0");

            row.innerHTML = `
              <td class="col-select"><input type="checkbox" class="user-select-checkbox" data-id="${newId}" checked></td>
              <td class="line-id-col" style="display: none;">${newId}</td>
              <td contenteditable="true" class="editable">First</td>
              <td contenteditable="true" class="editable">Last</td>
              <td contenteditable="true" class="editable">email@example.com</td>
              <td contenteditable="true" class="editable">username</td>
              <td contenteditable="true" class="editable">admin</td>
              <td contenteditable="true" class="editable">Yes</td>
              <td contenteditable="true" class="editable">Active</td>
              <td contenteditable="true" class="editable">—</td>
            `;

            row.querySelectorAll("td[contenteditable]").forEach(cell => {
              cell.addEventListener("input", () => row.classList.add("dirty"));
            });

            table.prepend(row);
          }

          if (action === "save") {
            const dirtyRows = table.querySelectorAll("tr.editing");
            dirtyRows.forEach(row => {
              row.classList.remove("editing", "dirty");
              row.querySelectorAll("td[contenteditable]").forEach(cell => {
                cell.removeAttribute("contenteditable");
                cell.classList.remove("editable");
              });
              const checkbox = row.querySelector("input[type='checkbox']");
              if (checkbox) checkbox.checked = false;
              row.classList.remove("selected-row");
            });
            ButtonBox.showMessage("user", "User rows saved (frontend only).", "success");
          }

          if (action === "paste") {
            console.warn("Paste logic not yet implemented for User Management.");
          }
        }
      });

    } catch (error) {
      console.error("❌ Failed to load admin users:", error);
      const table = document.getElementById("user-management-table");
      if (table) {
        table.innerHTML = `<tr><td colspan="10">Failed to load users. Please try again later.</td></tr>`;
      }
    }
  }

  function sanitizeInput(input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  }
})();