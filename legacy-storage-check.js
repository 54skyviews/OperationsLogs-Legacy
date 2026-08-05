(function () {
  "use strict";

  function showStorageWarning() {
    var warning = document.getElementById("legacyStorageWarning");
    if (warning) warning.hidden = false;
  }

  try {
    var key = "operationslogs-legacy-storage-test";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
  } catch (error) {
    window.OPERATIONSLOGS_STORAGE_UNAVAILABLE = true;
    document.addEventListener("DOMContentLoaded", showStorageWarning);
  }
}());
