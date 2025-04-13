// static/admin/user-management/UserManagement.js
(() => {
  if (window.ADMIN_USERS_LOADED) return;
  window.ADMIN_USERS_LOADED = true;
  console.log("🌭 UserManagement.js loaded");

  async function loadAdminUsers() {
    console.log("🔥 loadAdminUsers() has been called");
    console.log("📍 UserManagement call stack:", new Error().stack);
    try {
      const response = await fetch("/api/users/");
      const users = await response.json();
      console.log("✅ Admin users fetched:", users);

      const table = document.getElementById("user-table");
      const tbody = table?.querySelector("tbody");
      if (!tbody) throw new Error("Missing <tbody> in user table");

      tbody.innerHTML = "";
      console.log("🧹 Clearing existing rows");

      users.forEach((user, i) => {
        console.log("🔧 Rendering user row", i + 1, ":", user);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="id-col hidden-col">${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.access_level ?? "Admin"}</td>
          <td>${user.status ?? "Active"}</td>
          <td><input type="checkbox" /></td>
        `;
        tbody.appendChild(row);
      });
      console.log(`✅ Rendered ${users.length} admin user rows`);

      const idToggle = document.getElementById(
        "user-management-show-id-toggle"
      );
      console.log("🔍 user-management-show-id-toggle:", idToggle);
      if (!idToggle)
        console.warn("⚠️ user-management-show-id-toggle not found");

      if (window.ButtonBox && window.ButtonBoxUserManagement) {
        console.log("✅ ButtonBox and UserManagement init functions available");
        ButtonBoxUserManagement.init();
        ButtonBox.wireCheckboxes("user-management");
      }
    } catch (err) {
      console.error("❌ loadAdminUsers() error:", err);
    }
  }

  window.addEventListener("DOMContentLoaded", loadAdminUsers);
})();
