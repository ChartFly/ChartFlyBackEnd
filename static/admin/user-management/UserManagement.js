// static/admin/user-management/UserManagement.js

async function loadAdminUsers() {
  console.log("🔥 loadAdminUsers() has been called");
  try {
    const response = await fetch(
      "https://chartflybackend.onrender.com/api/users/"
    );
    if (!response.ok) throw new Error("Failed to fetch admin users");

    const users = await response.json();
    const table = document.getElementById("user-management-table");
    if (!table) throw new Error("❌ user-management-table element not found");

    let tbody =
      table.querySelector("tbody") || table.getElementsByTagName("tbody")[0];
    if (!tbody) {
      console.error("❌ <tbody> not found inside user-management-table");
      return;
    }

    console.log("🧹 Clearing existing rows");
    tbody.innerHTML = "";

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
        <td>${sanitizeInput(user.username || "")}</td>
        <td>${sanitizeInput(user.role || "")}</td>
        <td>${sanitizeInput(user.is_2fa_enabled ? "Yes" : "No")}</td>
        <td>${sanitizeInput(user.status || "")}</td>
        <td>${sanitizeInput(user.last_login || "")}</td>
      `;

      tbody.appendChild(row);
    });

    console.log(`✅ Rendered ${users.length} admin user rows`);
    ButtonBoxUserManagement.init();

    const waitForButtonBox = setInterval(() => {
      if (window.ButtonBox && ButtonBox.wireCheckboxes) {
        clearInterval(waitForButtonBox);
        ButtonBox.wireCheckboxes("user");
      }
    }, 50);

    function waitForIdToggle() {
      const toggle = document.getElementById("user-show-id-toggle");
      if (toggle) {
        toggle.addEventListener("change", () => {
          document
            .querySelectorAll("#user-management-section .line-id-col")
            .forEach((cell) => {
              cell.style.display = toggle.checked ? "table-cell" : "none";
            });
        });
        toggle.dispatchEvent(new Event("change"));
        console.log("✅ user-show-id-toggle wired successfully");
      } else {
        console.warn("⚠️ user-show-id-toggle still not found — retrying...");
        setTimeout(waitForIdToggle, 100);
      }
    }

    requestAnimationFrame(waitForIdToggle);
  } catch (error) {
    console.error("❌ Failed to load admin users:", error);
    const tbody = document.querySelector("#user-management-table tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="10">Failed to load admin users. Please try again later.</td></tr>`;
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
