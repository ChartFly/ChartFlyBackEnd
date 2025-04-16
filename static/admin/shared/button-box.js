// ============================================
// ✅ button-box.js
// --------------------------------------------
// Core ButtonBox controller: manages state,
// button logic, event wiring, and UI updates.
// Author: Captain & Chatman
// Version: MPA Phase II — Line ID Toggle Logic Added
// ============================================

console.log("🧠 ButtonBox.js loaded ✅");

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
      clipboard: null,
      clipboardType: null,
      onAction,
      tipIndex: 0,
    };

    stateMap.set(section, state);
    console.log(`🚀 ButtonBox initialized for section: ${section}`);
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
        console.warn(`⚠️ Missing button for action: ${action}`);
        return;
      }

      btn.addEventListener("click", () => {
        console.log(`🔘 Button clicked: ${section}-${action}-btn`);
        ButtonBoxMessages.setStatus(section, action);
        ButtonBoxMessages.resetButtons(section, btn);

        const skipConfirm = ["add", "copy", "edit", "undo"].includes(action);

        if (action === "copy" && getEditMode(section) === "row") {
          const selected = Array.from(state.selectedRows);
          if (selected.length !== 1) {
            showWarning(section, "Select one row to copy.");
            return;
          }
          state.clipboard = selected[0];
          state.clipboardType = "row";
          enablePaste(section);
          ButtonBoxMessages.showTip(
            section,
            "Copied row. Paste to add duplicate."
          );
        }

        if (typeof state.onAction !== "function") {
          console.warn(
            `⚠️ No onAction handler defined for section: ${section}`
          );
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

      if (action === "undo") {
        btn.disabled = false;
        btn.classList.remove("disabled-btn");
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
        toggleLineIdVisibility(section, idToggle.checked);
      });
      idToggle.dispatchEvent(new Event("change"));
    }

    const modeRadios = document.querySelectorAll(
      `input[name="${section}-edit-mode"]`
    );
    modeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        state.clipboard = null;
        state.clipboardType = null;
        disablePaste(section);
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

  function toggleLineIdVisibility(section, show) {
    const table = document.getElementById(`${section}-table`);
    if (!table) return;

    const headers = table.querySelectorAll("th.line-id-col");
    const cells = table.querySelectorAll("td.id-col");

    headers.forEach((th) => {
      if (show) {
        th.classList.remove("hidden-col");
        th.textContent = "ID";
      } else {
        th.classList.add("hidden-col");
        th.textContent = "";
      }
    });

    cells.forEach((td) => {
      if (show) {
        td.classList.remove("hidden-col");
        td.textContent = td.dataset.originalId || "";
      } else {
        td.classList.add("hidden-col");
        td.dataset.originalId = td.textContent;
        td.textContent = "";
      }
    });
  }

  function showWarning(section, message) {
    ButtonBoxMessages.showWarning(section, message);
  }

  function showMessage(section, message, type = "info") {
    if (type === "success") {
      ButtonBoxMessages.clearWarning(section);
    }
  }

  function enablePaste(section) {
    const btn = document.getElementById(`${section}-paste-btn`);
    if (btn) {
      btn.disabled = false;
      btn.classList.remove("disabled-btn");
    }
  }

  function disablePaste(section) {
    const btn = document.getElementById(`${section}-paste-btn`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add("disabled-btn");
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
    toggleLineIdVisibility,
  };
})();
