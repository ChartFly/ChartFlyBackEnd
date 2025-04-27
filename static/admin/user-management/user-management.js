// =============================================================
// 📁 FILE: user-management.js
// 📍 LOCATION: static/admin/user-management/user-management.js
// 🎯 PURPOSE: Load and render Admin Users table
// =============================================================

(() => {
  if (window.USER_MANAGEMENT_LOADED) return;
  window.USER_MANAGEMENT_LOADED = true;
  console.log("🧭 UserManagement.js loaded");

  async function loadAdminUsers() {
    console.log("📥 loadAdminUsers() called");
    try {
      const response = await fetch("/api/users");
      const users = await response.json();
      console.log("✅ Admin Users fetched:", users);

      const table = document.getElementById("user-management-table");
      const tbody = table?.querySelector("tbody");
      if (!tbody) throw new Error("Missing <tbody> in user management table");
      tbody.innerHTML = "";

      users.forEach((user, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="col-select"><input type="checkbox" /></td>
          <td class="line-id-col hidden-col" data-original-id="${user.id}">${
          user.id
        }</td>
          <td>${user.username}</td>
          <td>${user.phone_number}</td>
          <td>${user.email}</td>
          <td>${user.created}</td>
          <td>${user.permissions ?? ""}</td>
          <td>${user.role}</td>
          <td>${user.first_name}</td>
          <td>${user.last_name}</td>
        `;
        tbody.appendChild(row);
      });

      if (window.ButtonBox && window.ButtonBoxUserManagement) {
        ButtonBoxUserManagement.init();
        ButtonBox.wireCheckboxes("user");
      }
    } catch (err) {
      console.error("❌ loadAdminUsers() error:", err);
    }
  }

  window.addEventListener("DOMContentLoaded", loadAdminUsers);
})();
