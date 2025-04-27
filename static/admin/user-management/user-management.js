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
        console.log("🔧 Rendering Admin User row", i + 1, ":", user);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="col-select"><input type="checkbox" class="user-select-checkbox" data-id="${
            user.id
          }" /></td>
          <td class="line-id-col hidden-col" data-original-id="${
            user.id
          }">&nbsp;</td>
          <td contenteditable="true">${user.username}</td>
          <td contenteditable="true">${user.phone_number}</td>
          <td contenteditable="true">${user.email}</td>
          <td contenteditable="true">${user.created}</td>
          <td contenteditable="true">${user.permissions ?? ""}</td>
          <td contenteditable="true">${user.role}</td>
          <td contenteditable="true">${user.first_name}</td>
          <td contenteditable="true">${user.last_name}</td>
        `;
        tbody.appendChild(row);
      });

      if (window.ButtonBox && window.ButtonBoxUserManagement) {
        ButtonBoxUserManagement.init();
        ButtonBox.wireCheckboxes("user");
      }

      applyColumnResize("user-management");
    } catch (err) {
      console.error("❌ loadAdminUsers() error:", err);
    }
  }

  function applyColumnResize(sectionKey) {
    const table = document.getElementById(`${sectionKey}-table`);
    if (!table) return;
    const headers = table.querySelectorAll("thead th");

    headers.forEach((th) => {
      if (th.classList.contains("col-select")) return;

      const wasHidden = th.style.display === "none";
      if (wasHidden) th.style.display = "table-cell";

      const handle = document.createElement("div");
      handle.className = "resize-handle";
      handle.title = "Drag to resize • Double-click to reset";
      th.appendChild(handle);

      let startX, startWidth;

      handle.addEventListener("mousedown", (e) => {
        startX = e.pageX;
        startWidth = th.offsetWidth;
        document.body.style.cursor = "col-resize";

        headers.forEach((otherTh) => {
          if (otherTh !== th) {
            const width = otherTh.offsetWidth;
            otherTh.style.width = `${width}px`;
            otherTh.style.minWidth = `${width}px`;
            otherTh.style.maxWidth = `${width}px`;
          }
        });

        function onMouseMove(e) {
          const newWidth = Math.max(40, startWidth + e.pageX - startX);
          th.style.width = `${newWidth}px`;
        }

        function onMouseUp() {
          document.body.style.cursor = "";
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      handle.addEventListener("dblclick", () => {
        th.style.width = "";
      });

      if (wasHidden) th.style.display = "none";
    });
  }

  window.addEventListener("DOMContentLoaded", loadAdminUsers);
})();
