// static/admin/user-management/UserManagement.js

async function loadAdminUsers() {
  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/users/"
    );
    if (!response.ok) throw new Error("Failed to fetch admin users");

    const users = await response.json();
    const table = document.getElementById("users-table");
    if (!table) throw new Error("❌ users-table element not found");
    table.innerHTML = "";

    users.forEach((user, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", user.id);
      row.setAttribute("data-index", index + 1);

      row.innerHTML = `
        <td class="col-select"><input type="checkbox" class="user-select-checkbox" data-id="${
          user.id
        }"></td>
        <td class="line-id-col">${user.id}</td>
        <td>${sanitizeInput(user.first_name || "")}</td>
        <td>${sanitizeInput(user.last_name || "")}</td>
        <td>${sanitizeInput(user.username || "")}</td>
        <td>${sanitizeInput(user.role || "")}</td>
      `;

      table.appendChild(row);
    });

    ButtonBoxUserManagement.init();
    ButtonBox.wireCheckboxes("user");

    const toggle = document.getElementById("user-show-id-toggle");
    if (toggle) {
      const updateVisibility = () => {
        document
          .querySelectorAll("#user-management-section .line-id-col")
          .forEach(
            (cell) =>
              (cell.style.display = toggle.checked ? "table-cell" : "none")
          );
      };
      toggle.addEventListener("change", updateVisibility);
      updateVisibility();
    }
  } catch (error) {
    console.error("❌ Failed to load admin users:", error);
    const table = document.getElementById("users-table");
    if (table) {
      table.innerHTML = `<tr><td colspan="6">Failed to load admin users. Please try again later.</td></tr>`;
    }
  }
}

(() => {
  if (window.ADMIN_USERS_LOADED) return;
  window.ADMIN_USERS_LOADED = true;

  window.sanitizeInput = function (input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  };

  window.handleUserAction = ButtonBoxRows.handleRowAction;
})();

window.addEventListener("DOMContentLoaded", loadAdminUsers);
