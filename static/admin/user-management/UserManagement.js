// static/admin/user-management/UserManagement.js

async function loadAdminUsers() {
  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/users/"
    );
    if (!response.ok) throw new Error("Failed to fetch admin users");

    const users = await response.json();
    const table = document.getElementById("admin-users-table");
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
        <td>${sanitizeInput(user.email || "")}</td>
        <td>${sanitizeInput(user.phone_number || "")}</td>
        <td>${sanitizeInput(user.status || "")}</td>
        <td>${sanitizeInput(user.role || "")}</td>
        <td>${user.is_2fa_enabled ? "Yes" : "No"}</td>
        <td>${sanitizeInput(user.two_fa_method || "")}</td>
      `;

      table.appendChild(row);
    });

    // ✅ Init and wire checkboxes
    ButtonBoxUserManagement.init();
    ButtonBox.wireCheckboxes("user");
  } catch (error) {
    console.error("❌ Failed to load admin users:", error);
    const table = document.getElementById("admin-users-table");
    table.innerHTML = `<tr><td colspan="10">Failed to load admin users.</td></tr>`;
  }
}

(() => {
  if (window.USER_MANAGEMENT_LOADED) return;
  window.USER_MANAGEMENT_LOADED = true;

  window.sanitizeInput = function (input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  };

  // 🧠 Delegate to ButtonBoxRows
  window.handleUserAction = ButtonBoxRows.handleRowAction;
})();

window.addEventListener("DOMContentLoaded", loadAdminUsers);
