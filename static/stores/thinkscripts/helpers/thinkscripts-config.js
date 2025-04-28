// ===============================================
// 📁 FILE: thinkscripts-config.js
// 🎯 PURPOSE: Configuration for ThinkScripts RedStripe table
// 👥 Author: Captain & Chatman
// ===============================================

export const thinkScriptsConfig = {
  targetId: "thinkscripts-table-container",
  columns: [
    { header: "Label", field: "label", width: "25%" },
    { header: "Short Description", field: "short_description", width: "40%" },
    { header: "Price", field: "price", width: "15%" },
    { header: "Status", field: "active", width: "10%" },
    { header: "Actions", field: "actions", width: "10%" },
  ],
  fetchUrl: "/api/stores/thinkscripts",
  parseData: (scripts) => {
    return scripts.map((script) => ({
      label: script.label,
      short_description: script.short_description,
      price: `$${script.price.toFixed(2)}`,
      active: script.active ? "Active" : "Inactive",
      actions: "📝 ✖️", // Placeholder action buttons
    }));
  },
};
