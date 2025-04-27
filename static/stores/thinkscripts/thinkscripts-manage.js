// ===============================================
// 📁 FILE: thinkscripts-manage.js
// 🎯 PURPOSE: Client-side table for ThinkScripts Admin Console (RedStripe Upgrade)
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

    RedStripe.renderTable({
      targetId: "thinkscripts-table-container",
      columns: ["label", "short_description", "price", "active"],
      data: scripts.map((script) => ({
        label: script.label,
        short_description: script.short_description,
        price: `$${script.price.toFixed(2)}`,
        active: script.active ? "Active" : "Inactive",
      })),
    });
  } catch (err) {
    console.error("❌ Failed to load ThinkScripts:", err);
    container.innerHTML = "<p style='color:red;'>Error loading scripts.</p>";
  }
}
