// static/admin/shared/ButtonBoxDataBase.js

window.ButtonBoxDataBase = (() => {
  async function saveToDatabase(section, rowIds) {
    if (section === "holiday") {
      const table = document.getElementById("holidays-table");
      const data = [];

      rowIds.forEach((id) => {
        const row = table.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;

        const cells = row.querySelectorAll("td");
        data.push({
          id: parseInt(id),
          name: cells[2].textContent.trim(),
          date: cells[3].textContent.trim(),
          close_time: cells[5].textContent.trim(),
        });
      });

      try {
        const res = await fetch("/api/holidays/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Save failed");
        ButtonBox.showMessage(
          section,
          "Holidays saved successfully",
          "success"
        );
      } catch (err) {
        ButtonBox.showWarning(section, "Failed to save holiday data.");
      }
    } else {
      console.log(`📡 [${section}] Save not implemented yet.`);
    }
  }

  function validateRow(rowData) {
    // Placeholder for future schema validation
    return true;
  }

  return {
    saveToDatabase,
    validateRow,
  };
})();
