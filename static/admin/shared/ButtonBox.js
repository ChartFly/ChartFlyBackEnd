// static/admin/shared/ButtonBox.js

window.ButtonBox = (() => {
  const sectionStates = {};
  const tipTimers = {};

  function getState(section) {
    if (!sectionStates[section]) {
      sectionStates[section] = {
        selectedRows: new Set(),
        activeAction: null,
        clipboard: null,
        clipboardType: null,
        undoStack: [],
        maxUndo: 20,
        domId: null,
        tableId: null,
        onAction: defaultHandler,
        tipIndex: 0
      };
    }
    return sectionStates[section];
  }

  function getEditMode(section) {
    const selected = document.querySelector(`input[name="${section}-edit-mode"]:checked`);
    return selected ? selected.value : "row";
  }

  function init({ section, domId, tableId, onAction }) {
    const state = getState(section);
    Object.assign(state, { domId, tableId });
    if (typeof onAction === "function") state.onAction = onAction;

    console.log(`🚀 ButtonBox initialized for section: ${section}`);

    ButtonBoxMessages.initTips(section, tipTimers, state.tipIndex);
    ButtonBoxMessages.updateButtonColors(section);
    ButtonBoxMessages.updateIdColumnVisibility(section);
    ButtonBoxMessages.updateUndo(section);

    ButtonBoxRows.wireCheckboxes(section); // Initial wire

    const actions = ["edit", "copy", "paste", "add", "delete", "save", "undo"];
    actions.forEach(action => {
      const btn = document.getElementById(`${section}-${action}-btn`);
      if (!btn) return;
      if (action === "paste") ButtonBoxMessages.disableButton(btn);

      btn.addEventListener("click", () => {
        console.log(`👉 [${section}] Button clicked: ${action}`);
        state.activeAction = action;
        ButtonBoxMessages.setStatus(section, action);
        ButtonBoxMessages.clearWarning(section);
        ButtonBoxMessages.resetButtons(section, btn);

        const mode = getEditMode(section);
        console.log(`✏️ Mode is: ${mode}`);

        if (mode === "cell") {
          ButtonBoxColumns.handleCellAction(section, action);
        } else {
          ButtonBoxRows.handleRowAction(section, action);
        }
      });
    });

    const idToggle = document.getElementById(`${section}-show-id-toggle`);
    if (idToggle) {
      idToggle.addEventListener("change", () =>
        ButtonBoxMessages.updateIdColumnVisibility(section)
      );
    }

    const modeRadios = document.querySelectorAll(`input[name="${section}-edit-mode"]`);
    modeRadios.forEach(radio => {
      radio.addEventListener("change", () =>
        ButtonBoxMessages.updateButtonColors(section)
      );
    });

    ButtonBoxMessages.setStatus(section, "none");
  }

  function defaultHandler(action, selectedIds) {
    console.warn(`⚠️ No handler for action "${action}".`, selectedIds);
    ButtonBoxMessages.showTip("global", `Unhandled: ${action}`);
  }

  return {
    init,
    getState,
    getEditMode,
    getSelectedIds: (section) => Array.from(getState(section).selectedRows),

    // Delegated helpers
    wireCheckboxes: ButtonBoxRows.wireCheckboxes,
    showTip: ButtonBoxMessages.showTip,
    showWarning: ButtonBoxMessages.showWarning,
    clearWarning: ButtonBoxMessages.clearWarning,
    updateButtonColors: ButtonBoxMessages.updateButtonColors,
    updateIdColumnVisibility: ButtonBoxMessages.updateIdColumnVisibility,
    setStatus: ButtonBoxMessages.setStatus
  };
})();