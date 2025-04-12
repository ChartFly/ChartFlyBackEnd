// static/admin/user-management/UserManagement.js

console.log("🌭 UserManagement.js loaded");

async function loadAdminUsers() {
  console.log("🔥 loadAdminUsers() has been called");
  console.log("📍 UserManagement call stack:", new Error().stack);

  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/users/"
    );
    if (!response.ok) throw new Error("Failed to fetch admin users");

    const users = await response.json();
    console.log("✅ Admin users fetched:", users);

    const table = document.getElementById("user-table");
    if (!table) throw new Error("❌ user-table element not found");

    let tbody =
      table.querySelector("tbody") || table.getElementsByTagName("tbody")[0];
    if (!tbody) {
      console.error("❌ <tbody> not found inside user-table");
      return;
    }

    console.log("🧹 Clearing existing rows");
    tbody.innerHTML = "";

    users.forEach((user, index) => {
      console.log(`🔧 Rendering user row ${index + 1}:`, user);
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
        <td>${sanitizeInput(user.username || "")}</td>
        <td>${sanitizeInput(user.role || "")}</td>
        <td>${sanitizeInput(user.is_2fa_enabled ? "Yes" : "No")}</td>
        <td>${sanitizeInput(user.status || "")}</td>
        <td>${sanitizeInput(user.last_login || "")}</td>
      `;

      tbody.appendChild(row);
    });

    console.log(`✅ Rendered ${users.length} admin user rows`);

    if (window.ButtonBoxUserManagement?.init) {
      ButtonBoxUserManagement.init();
    }

    const waitForButtonBox = setInterval(() => {
      if (window.ButtonBox?.wireCheckboxes) {
        clearInterval(waitForButtonBox);
        ButtonBox.wireCheckboxes("user");
      }
    }, 50);

    function waitForIdToggle() {
      const toggle = document.getElementById("user-show-id-toggle");
      console.log("🔍 user-show-id-toggle:", toggle);

      if (toggle) {
        toggle.addEventListener("change", () => {
          const visible = toggle.checked;
          document
            .querySelectorAll("#user-management-section .line-id-col")
            .forEach((cell) => {
              cell.style.display = visible ? "table-cell" : "none";
            });
        });
        toggle.dispatchEvent(new Event("change"));
      } else {
        setTimeout(waitForIdToggle, 100);
      }
    }

    requestAnimationFrame(waitForIdToggle);
  } catch (error) {
    console.error("❌ Failed to load admin users:", error);
    const tbody = document.querySelector("#user-table tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="10">Failed to load admin users. Please try again later.</td></tr>`;
    }
  }
}

(() => {
  console.log("🤪 UserManagement IIFE initializing...");
  if (window.ADMIN_USERS_LOADED) {
    console.log("⚠️ ADMIN_USERS_LOADED already true, skipping...");
    return;
  }

  console.log("✅ ADMIN_USERS_LOADED now set to true");
  window.ADMIN_USERS_LOADED = true;

  window.sanitizeInput = function (input) {
    return typeof input === "string"
      ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : input ?? "—";
  };

  window.handleUserAction = ButtonBoxRows.handleRowAction;
})();
