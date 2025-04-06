// static/admin/shared/ButtonBoxDataBase.js

window.ButtonBoxDataBase = (() => {
  function saveToDatabase(section, rows) {
    console.log(`📡 [${section}] Would save to database:`, rows);
    // TODO: Add real API call logic here
    // Example: POST /api/holidays/save or /api/keys/update etc.
  }

  function validateRow(rowData) {
    console.log("🧪 Validating row data...", rowData);
    // TODO: Add schema validation here
    return true;
  }

  return {
    saveToDatabase,
    validateRow
  };
})();