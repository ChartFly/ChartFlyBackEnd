// static/admin/shared/ButtonBox.js
window.ButtonBox = (() => {
  const stateMap = new Map();

  function init(config) {
    const {
      section,
      tableId,
      domId,
      tipBoxId,
      warningBoxId,
      footerId,
      enabledActions,
      onAction,
    } = config;

    const state = {
      section,
      tableId,
      domId,
      tipBoxId,
      warningBoxId,
      footerId,
      enabledActions,
      selectedRows: new Set(),
      onAction,
      tipIndex: 0,
    };

    stateMap.set(section, state);
    wireButtons(state);
    ButtonBoxMessages.initTips(section);
  }

  function getState(section) {
    return stateMap.get(section);
  }

  function getEditMode(section) {
    const radio = document.querySelector(
      `input[name="${section}-edit-mode"]:checked`
    );
    return radio ? radio.value : "row";
  }

  function wireButtons(state) {
    const { section, enabledActions } = state;

    enabledActions.forEach((action) => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (!btn) return;

      btn.addEventListener("click", () => {
        const skipConfirm = ["add", "copy", "edit"].includes(action);
        ButtonBoxMessages.setStatus(section, action);
        ButtonBoxMessages.resetButtons(section, btn);

        if (skipConfirm) {
          if (typeof state.onAction === "function") {
            state.onAction(action, Array.from(state.selectedRows));
          }
        } else {
          ButtonBoxMessages.enableConfirm(section, action);
        }
      });
    });

    const confirmBtn = document.getElementById(`${section}-confirm-btn`);
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.className = "confirm-btn gray";
      confirmBtn.textContent = "Confirm";
    }

    const idToggle = document.getElementById(`${section}-show-id-toggle`);
    if (idToggle) {
      idToggle.addEventListener("change", () => {
        ButtonBoxMessages.updateIdColumnVisibility(section);
      });
      idToggle.dispatchEvent(new Event("change"));
    }

    const modeRadios = document.querySelectorAll(
      `input[name="${section}-edit-mode"]`
    );
    modeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        ButtonBoxMessages.updateButtonColors(section);
      });
    });

    ButtonBoxMessages.updateButtonColors(section);
  }

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

      const newCheckbox = checkbox.cloneNode(true);
      checkbox.replaceWith(newCheckbox);

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

        const counter = document.getElementById(`${section}-selected-count`);
        if (counter) {
          counter.textContent = state.selectedRows.size;
        }
      });
    });

    const counter = document.getElementById(`${section}-selected-count`);
    if (counter) {
      counter.textContent = state.selectedRows.size;
    }
  }

  function showWarning(section, message) {
    console.warn(`[${section}] ⚠️ ${message}`);
    ButtonBoxMessages.showWarning(section, message);
  }

  function showMessage(section, message, type = "info") {
    console.log(`[${section}] ✅ ${message}`);
    if (type === "success") {
      ButtonBoxMessages.clearWarning(section);
    }
  }

  return {
    init,
    getState,
    getEditMode,
    wireButtons,
    wireCheckboxes,
    showWarning,
    showMessage,
  };
})();
