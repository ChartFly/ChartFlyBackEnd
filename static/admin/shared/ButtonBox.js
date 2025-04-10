//static/admin/shared/ButtonBox.js  //
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
      if (!btn) {
        console.warn(`[${section}] ❌ Missing button: ${action}`);
        return;
      }

      btn.addEventListener("click", () => {
        console.log(`[${section}] 🔘 Clicked: ${action}`);

        ButtonBoxMessages.setStatus(section, action);
        ButtonBoxMessages.resetButtons(section, btn);

        const skipConfirm = ["add", "copy", "edit", "undo"].includes(action);

        if (typeof state.onAction !== "function") {
          console.warn(`[${section}] ⚠️ No onAction handler defined!`);
          return;
        }

        if (skipConfirm) {
          state.onAction(action, Array.from(state.selectedRows));
        } else {
          ButtonBoxMessages.enableConfirm(section, action, () => {
            state.onAction(action, Array.from(state.selectedRows));
            ButtonBoxMessages.resetConfirm(section);
          });
        }
      });

      // Make sure Undo button is always active if present
      if (action === "undo") {
        btn.disabled = false;
        btn.classList.remove("disabled-btn");
        console.log(`[${section}] ✅ Undo button explicitly enabled`);
      }
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
    if (!state) return;

    const table = document.getElementById(state.tableId);
    if (!table) return;

    const checkboxes = table.querySelectorAll(`.${section}-select-checkbox`);
    state.selectedRows.clear();

    checkboxes.forEach((checkbox) => {
      const id = checkbox.dataset.id;
      const newCheckbox = checkbox.cloneNode(true);
      checkbox.replaceWith(newCheckbox);

      newCheckbox.addEventListener("change", () => {
        if (newCheckbox.checked) {
          state.selectedRows.add(id);
        } else {
          state.selectedRows.delete(id);
        }

        ButtonBoxMessages.updateSelectedCount(section);
      });
    });

    ButtonBoxMessages.updateSelectedCount(section);
  }

  function showWarning(section, message) {
    ButtonBoxMessages.showWarning(section, message);
  }

  function showMessage(section, message, type = "info") {
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
