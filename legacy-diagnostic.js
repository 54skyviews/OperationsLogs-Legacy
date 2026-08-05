(function (global) {
  "use strict";
  var steps = [];
  var technical = [];

  function byId(id) { return document.getElementById(id); }
  function timestamp() {
    try { return new Date().toISOString(); } catch (e) { return String(new Date()); }
  }
  function render() {
    var list = byId("legacyDiagnosticList");
    if (!list) return;
    list.innerHTML = "";
    for (var i = 0; i < steps.length; i++) {
      var li = document.createElement("li");
      li.className = "legacy-step legacy-step-" + steps[i].status;
      li.appendChild(document.createTextNode(steps[i].label));
      if (steps[i].detail) {
        var small = document.createElement("small");
        small.appendChild(document.createTextNode(steps[i].detail));
        li.appendChild(small);
      }
      list.appendChild(li);
    }
    var tech = byId("legacyDiagnosticTechnical");
    if (tech) tech.textContent = technical.join("\n");
  }
  function log(message) {
    technical.push(timestamp() + "  " + String(message));
    render();
  }
  function step(id, label, status, detail) {
    var found = false;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].id === id) {
        steps[i] = { id:id, label:label, status:status, detail:detail || "" };
        found = true;
        break;
      }
    }
    if (!found) steps.push({ id:id, label:label, status:status, detail:detail || "" });
    log(label + " | " + status + (detail ? " | " + detail : ""));
  }
  function summary(text, status) {
    var el = byId("legacyDiagnosticSummary");
    if (!el) return;
    el.textContent = text;
    el.className = "legacy-diagnostic-summary legacy-summary-" + status;
  }
  function stringifyError(error) {
    if (error == null) return "Unknown error";
    if (typeof error === "string") return error;
    if (error.message) {
      try {
        return error.message + (error.details ? " | " + JSON.stringify(error.details) : "");
      } catch (ignore) {
        return error.message;
      }
    }
    try {
      return JSON.stringify(error);
    } catch (jsonError) {
      return String(error);
    }
  }

  function fail(stage, error) {
    var message = stringifyError(error);
    step(stage, stage, "error", message);
    summary("STARTUP FAILED", "error");
    var box = byId("legacyDiagnosticError");
    if (box) { box.hidden = false; box.textContent = message; }
    log(error && error.stack ? error.stack : message);
  }

  function http(method, url, status, responseText) {
    log(method + " " + url + " | HTTP " + status);
    if (responseText) log("RESPONSE: " + responseText);
  }

  global.LegacyDiagnostic = {
    step:step,
    summary:summary,
    fail:fail,
    log:log,
    http:http,
    stringifyError:stringifyError
  };

  global.addEventListener("error", function (event) {
    fail("JavaScript error", event.error || event.message);
  });
  global.addEventListener("unhandledrejection", function (event) {
    fail("Promise rejection", event.reason || "Unknown rejection");
  });

  document.addEventListener("DOMContentLoaded", function () {
    step("browser", "Browser and JavaScript started", "ok", navigator.userAgent);
    step("dom", "Page controls loaded", "ok", "");
    summary("RUNNING STARTUP CHECKS…", "working");
    var button = byId("legacyDiagnosticButton");
    var tech = byId("legacyDiagnosticTechnical");
    if (button && tech) {
      button.addEventListener("click", function () {
        tech.hidden = !tech.hidden;
        button.textContent = tech.hidden ? "SHOW TECHNICAL DETAILS" : "HIDE TECHNICAL DETAILS";
      });
    }
  });
}(window));
