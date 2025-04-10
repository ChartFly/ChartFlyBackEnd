function wireCheckboxes(section) {
  const state = getState(section);
  if (!state) {
    console.error(`❌ State not found for section "${section}"`);
    return;
  }

  const table = document.getElementById(state.tableId);
  if (!table) {
    console.error(
      `❌ Table not found for section "${section}" using ID "${state.tableId}"`
    );
    return;
  }

  const checkboxes = table.querySelectorAll(`.${section}-select-checkbox`);
  if (checkboxes.length === 0) {
    console.warn(`⚠️ No checkboxes found for section "${section}"`);
  }

  console.log(`[${section}] 🔄 Rewiring ${checkboxes.length} checkboxes...`);
  state.selectedRows.clear();

  checkboxes.forEach((checkbox) => {
    console.log(
      `[${section}] ✅ Found checkbox with ID: ${checkbox.dataset.id}`
    );
    checkbox.addEventListener("change", () => {
      const id = checkbox.dataset.id;
      if (checkbox.checked) {
        state.selectedRows.add(id);
        console.log(`[${section}] ➕ Row selected: ${id}`);
      } else {
        state.selectedRows.delete(id);
        console.log(`[${section}] ➖ Row deselected: ${id}`);
      }
      console.log(
        `[${section}] 📋 selectedRows now:`,
        Array.from(state.selectedRows)
      );
    });
  });
}
