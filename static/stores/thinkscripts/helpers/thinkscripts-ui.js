// ===============================================
// 📁 FILE: thinkscripts-ui.js
// 🎯 PURPOSE: UI interactions for ThinkScripts Admin Console
// 👥 Author: Captain & Chatman
// ===============================================

import { fetchThinkScripts, deleteThinkScript } from "./thinkscripts-api.js";

document.addEventListener("DOMContentLoaded", () => {
  loadTable();
});

async function loadTable() {
  try {
    const scripts = await fetchThinkScripts();

    // Use RedStripe directly as it is globally available
    RedStripe.renderTable({
      targetId: "thinkscripts-table-container",
      columns: ["label", "short_description", "price", "active", "actions"],
      data: scripts.map((script) => ({
        label: script.label,
        short_description: script.short_description,
        price: `$${script.price.toFixed(2)}`,
        active: script.active ? "Active" : "Inactive",
        actions: `
          <button class="edit-btn" data-id="${script.id}">Edit</button>
          <button class="delete-btn" data-id="${script.id}">Delete</button>
        `,
      })),
    });

    attachActionListeners();
  } catch (err) {
    console.error("❌ Failed to load table:", err);
    document.getElementById("thinkscripts-table-container").innerHTML =
      "<p style='color:red;'>Error loading table.</p>";
  }
}

function attachActionListeners() {
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("❌ Confirm delete this script?")) {
        try {
          await deleteThinkScript(id);
          loadTable(); // Refresh after delete
        } catch (err) {
          console.error("❌ Failed to delete:", err);
          alert("Error deleting script.");
        }
      }
    });
  });

  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      alert(`✏️ Edit Script ID: ${id} (Coming soon!)`);
      // Future phase: open edit popup
    });
  });
}
