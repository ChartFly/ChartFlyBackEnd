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
        ButtonBoxMessages.setStatus(section, action);
        ButtonBoxMessages.enableConfirm(section, action);
        ButtonBoxMessages.resetButtons(section, btn);
      });
    });

    // Wire Confirm button
    const confirmBtn = document.getElementById(`${section}-confirm-btn`);
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.className = "confirm-btn gray";
    }

    // Wire Show ID toggle if present
    const idToggle = document.getElementById(`${section}-show-id-toggle`);
    if (idToggle) {
      idToggle.addEventListener("change", () => {
        ButtonBoxMessages.updateIdColumnVisibility(section);
      });
      idToggle.dispatchEvent(new Event("change"));
    }

    // Wire Edit mode toggles
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
    const table = document.getElementById(state.tableId);
    if (!table) {
      console.error(
        `❌ Table not found for section "${section}" using ID "${state.tableId}"`
      );
      return;
    }

    const checkboxes = table.querySelectorAll(`.${section}-select-checkbox`);
    state.selectedRows.clear();

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const id = checkbox.dataset.id;
        if (checkbox.checked) {
          state.selectedRows.add(id);
        } else {
          state.selectedRows.delete(id);
        }
      });
    });
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
