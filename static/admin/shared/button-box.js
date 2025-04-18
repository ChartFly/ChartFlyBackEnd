// ============================================
// ✅ button-box.js
// --------------------------------------------
// Core ButtonBox controller: manages state,
// button logic, event wiring, and UI updates.
// Author: Captain & Chatman
// Version: MPA Phase IV — Mode Switch Overlay (Final Fix)
// ============================================

console.log("🧠 ButtonBox.js loaded ✅");
console.log("🧨 ButtonBox toggleLineIdVisibility running...");

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
      activeEditableColumnIndex: null,
      previousMode: getEditMode(section),
    };

    stateMap.set(section, state);
    console.log(`🚀 ButtonBox initialized for section: ${section}`);
    wireButtons(state);
    wireModeSwitchHandler(state); // ✅ Moved here correctly
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
  }

  function wireModeSwitchHandler(state) {
    const { section } = state;

    const radios = document.querySelectorAll(
      `input[name="${section}-edit-mode"]`
    );
    console.log(
      `🎯 Found ${radios.length} radio buttons for section: ${section}`
    );

    radios.forEach((radio) => {
      console.log(`📻 Wiring radio:`, radio);

      radio.addEventListener("focus", () => {
        state.previousMode = getEditMode(section);
      });

      radio.addEventListener("change", (e) => {
        const currentMode = state.previousMode;
        const targetMode = e.target.value;

        console.log(
          `🔁 Attempting to switch from ${currentMode} ➜ ${targetMode}`
        );

        if (currentMode === targetMode) return;

        const isDirty = checkDirtyState(section, currentMode);
        console.log(`🧼 Dirty check for mode ${currentMode}:`, isDirty);

        if (isDirty) {
          e.preventDefault();
          radio.checked = false;

          console.log("⚠️ Dirty detected — showing mode switch popup");
          ButtonBoxSwitchMode.showOverlay(
            section,
            () => {
              cleanupMode(section, currentMode);
              forceSwitchMode(section, targetMode);
            },
            () => {
              cleanupMode(section, currentMode);
              forceSwitchMode(section, targetMode);
            },
            () => {
              console.log("🚫 Stay in current mode selected");
            }
          );
        } else {
          console.log("✅ No unsaved changes — switching mode cleanly");
          cleanupMode(section, currentMode);
          forceSwitchMode(section, targetMode);
        }
      });
    });
  }

  function checkDirtyState(section, mode) {
    const table = document.getElementById(getState(section).tableId);
    if (!table) return false;

    if (mode === "row") {
      return table.querySelectorAll("tr.editing, tr.dirty").length > 0;
    }
    if (mode === "cell") {
      return table.querySelectorAll("td.dirty").length > 0;
    }
    return false;
  }

  function cleanupMode(section, mode) {
    const table = document.getElementById(getState(section).tableId);
    if (!table) return;

    if (mode === "row") {
      table.querySelectorAll("tr").forEach((tr) => {
        tr.classList.remove("editing", "dirty", "selected-row");
        const checkbox = tr.querySelector("input[type='checkbox']");
        if (checkbox) checkbox.checked = false;
      });
    } else if (mode === "cell") {
      table.querySelectorAll("td").forEach((td) => {
        td.removeAttribute("contenteditable");
        td.classList.remove(
          "editable-col-cell",
          "editable-focus-cell",
          "dirty",
          "cell-paste-ready"
        );
      });
      table.querySelectorAll("th").forEach((th) => {
        th.classList.remove("editable-col");
      });
    }
  }

  function forceSwitchMode(section, targetMode) {
    const input = document.querySelector(
      `input[name="${section}-edit-mode"][value="${targetMode}"]`
    );
    if (input) {
      input.checked = true;
      ButtonBoxMessages.updateButtonColors(section);
    }
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
    const state = getState(section);
    const table = document.getElementById(state?.tableId || `${section}-table`);
    console.log("🔍 ID Toggle targeting:", table);
    if (!table) return;

    const headers = table.querySelectorAll("th.line-id-col");
    const cells = table.querySelectorAll("td.line-id-col");

    headers.forEach((th) => {
      th.classList.toggle("hidden-col", !show);
      th.textContent = show ? "ID" : "";
    });

    cells.forEach((td) => {
      if (show) {
        td.classList.remove("hidden-col");
        td.textContent = td.dataset.originalId || "";
      } else {
        if (!td.dataset.originalId) {
          td.dataset.originalId = td.textContent;
        }
        td.classList.add("hidden-col");
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

  function showTip(section, message) {
    ButtonBoxMessages.showTip(section, message);
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
    cleanupMode,
    forceSwitchMode,
    showTip,
  };
})();
