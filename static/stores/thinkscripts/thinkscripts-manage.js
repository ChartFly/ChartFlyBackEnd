// ===============================================
// 📁 FILE: thinkscripts-manage.js
// 🎯 PURPOSE: Client-side table for ThinkScripts Admin Console
// 👥 Author: Captain & Chatman
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  loadThinkScripts();

  const addBtn = document.getElementById("add-script-btn");
  addBtn.addEventListener("click", () => {
    alert("➕ Add New Script - Coming Soon!");
  });
});

async function loadThinkScripts() {
  const container = document.getElementById("thinkscripts-table-container");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch("/api/stores/thinkscripts");
    const scripts = await response.json();

    if (!Array.isArray(scripts)) throw new Error("Invalid data");

    let tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Short Description</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    scripts.forEach((script) => {
      tableHtml += `
        <tr>
          <td>${script.label}</td>
          <td>${script.short_description}</td>
          <td>$${script.price.toFixed(2)}</td>
          <td>${script.active ? "Active" : "Inactive"}</td>
          <td><button>Edit</button> <button>Delete</button></td>
        </tr>
      `;
    });

    tableHtml += "</tbody></table>";

    container.innerHTML = tableHtml;
  } catch (err) {
    console.error("❌ Failed to load ThinkScripts:", err);
    container.innerHTML = "<p style='color:red;'>Error loading scripts.</p>";
  }
}
