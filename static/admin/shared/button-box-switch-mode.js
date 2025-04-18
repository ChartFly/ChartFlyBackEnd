// Save & Switch
() => {
  const state = ButtonBox.getState(section);
  if (state && typeof state.onAction === "function") {
    ButtonBoxMessages.setStatus(section, "save");
    ButtonBoxMessages.resetConfirm(section);
    state.onAction("save", Array.from(state.selectedRows));
  }
  cleanupMode(section, currentMode);
  forceSwitchMode(section, targetMode);
},

// Discard & Switch
() => {
  cleanupMode(section, currentMode);
  forceSwitchMode(section, targetMode);
},
