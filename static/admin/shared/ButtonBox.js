// =====================================================
// 🧠 wireCheckboxes(section)  ButtonBox.js
// Wires up all checkboxes in the given section, updates
// state.selectedRows, and logs changes in the console.
// =====================================================
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
    const id = checkbox.dataset.id;
    console.log(`[${section}] ✅ Found checkbox with ID: ${id}`);

    // Clear old listeners first (in case of rewire)
    checkbox.replaceWith(checkbox.cloneNode(true));
    const newCheckbox = table.querySelector(
      `.${section}-select-checkbox[data-id="${id}"]`
    );

    newCheckbox.addEventListener("change", () => {
      if (newCheckbox.checked) {
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
