var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var DATA = window.OPERATIONSLOGS_MASTER_DATA;
var DB_NAME = "OperationsLogsDB";
var DB_VERSION = 3;
var db;
var currentType = "winch";
var editingFlightId = null;
var currentAdminList = "names";
var lastLoadedRunway = "";
var flyingDayState = {
    suppressEvents: false,
    pending: new Map(),
    timers: new Map(),
    displayed: { day: "", runway: "", windDirection: "", windSpeed: "" }
};
var $ = function (id) { return document.getElementById(id); };
var upper = function (value) { return (value || "").trim().replace(/\s+/g, " ").toUpperCase(); };
var todayISO = function () { return new Date().toISOString().slice(0, 10); };
var timeHHMM = function () { return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }).replace(":", ""); };
function openDb() {
return new Promise(function (resolve, reject) {
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function (e) {
            var database = e.target.result;
            if (!database.objectStoreNames.contains("days")) {
                database.createObjectStore("days", { keyPath: "date" });
            }
            if (!database.objectStoreNames.contains("flights")) {
                var store = database.createObjectStore("flights", { keyPath: "id" });
                store.createIndex("date", "date", { unique: false });
            }
            if (!database.objectStoreNames.contains("syncQueue")) {
                database.createObjectStore("syncQueue", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("masterLists")) {
                database.createObjectStore("masterLists", { keyPath: "key" });
            }
            if (!database.objectStoreNames.contains("conflicts")) {
                database.createObjectStore("conflicts", { keyPath: "id" });
            }
        };
        request.onsuccess = function (e) { db = e.target.result; resolve(db); };
        request.onerror = function () {
return reject(request.error);
        };
    });
}
function put(storeName, value) {
    return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).put(value);
        tx.oncomplete = resolve;
        tx.onerror = function () { return reject(tx.error); };
    });
}
function get(storeName, key) {
    return new Promise(function (resolve, reject) {
        var req = db.transaction(storeName).objectStore(storeName).get(key);
        req.onsuccess = function () { return resolve(req.result); };
        req.onerror = function () { return reject(req.error); };
    });
}
function remove(storeName, key) {
    return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).delete(key);
        tx.oncomplete = resolve;
        tx.onerror = function () { return reject(tx.error); };
    });
}
var MASTER_LIST_KEYS = ["names", "gliders", "tugAircraft", "tugPilots", "payees"];
function cleanMasterValues(values) {
    return __spreadArray([], new Set((values || []).map(upper).filter(Boolean)), true).sort(function (a, b) { return a.localeCompare(b, "en-GB"); });
}
function loadMasterLists() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, MASTER_LIST_KEYS_1, key, saved, defaults;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, MASTER_LIST_KEYS_1 = MASTER_LIST_KEYS;
                    _b.label = 1;
                case 1:
                    if (!(_i < MASTER_LIST_KEYS_1.length)) return [3 /*break*/, 4];
                    key = MASTER_LIST_KEYS_1[_i];
                    return [4 /*yield*/, get("masterLists", key)];
                case 2:
                    saved = _b.sent();
                    defaults = Array.isArray(DATA[key]) ? DATA[key] : [];
                    DATA[key] = cleanMasterValues((_a = saved === null || saved === void 0 ? void 0 : saved.values) !== null && _a !== void 0 ? _a : defaults);
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (!DATA.payees.length)
                        DATA.payees = ["P1", "P2", "VOUCHER", "SHARE"];
                    refreshMasterDatalists();
                    return [2 /*return*/];
            }
        });
    });
}
function saveMasterList(key) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    DATA[key] = cleanMasterValues(DATA[key]);
                    return [4 /*yield*/, put("masterLists", {
                            key: key,
                            values: DATA[key],
                            modifiedAt: new Date().toISOString()
                        })];
                case 1:
                    _a.sent();
                    refreshMasterDatalists();
                    return [4 /*yield*/, syncMasterList(key)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getFlightsByDate(date) {
    return new Promise(function (resolve, reject) {
        var req = db.transaction("flights").objectStore("flights").index("date").getAll(date);
        req.onsuccess = function () { return resolve(req.result || []); };
        req.onerror = function () { return reject(req.error); };
    });
}
function removeFlight(id) {
    return new Promise(function (resolve, reject) {
        var tx = db.transaction("flights", "readwrite");
        tx.objectStore("flights").delete(id);
        tx.oncomplete = resolve;
        tx.onerror = function () { return reject(tx.error); };
    });
}
function fillList(id, values) {
    $(id).innerHTML = values.map(function (v) { return "<option value=\"".concat(String(v).replaceAll('"', '&quot;'), "\"></option>"); }).join("");
}
function refreshMasterDatalists() {
    fillList("nameList", DATA.names);
    fillList("nameListWithSolo", __spreadArray(["SOLO"], DATA.names, true));
    fillList("tugAircraftList", DATA.tugAircraft);
    fillList("tugPilotList", DATA.tugPilots);
    fillList("gliderList", DATA.gliders);
    fillList("payeeList", DATA.payees);
}
function initialiseLists() {
    refreshMasterDatalists();
    $("runway").innerHTML = DATA.runways.map(function (v) { return "<option>".concat(v, "</option>"); }).join("");
}
function showView(id) {
    document.querySelectorAll(".view").forEach(function (v) { return v.classList.remove("active"); });
    $(id).classList.add("active");
    window.scrollTo(0, 0);
}
function setDate(date) {
    $("flyingDate").value = date;
    $("flyingDay").value = new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase();
}
function isValidHHMM(value) {
    if (!/^\d{4}$/.test(value))
        return false;
    var h = +value.slice(0, 2), m = +value.slice(2);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}
function calcDuration(start, end) {
    if (!isValidHHMM(start) || !isValidHHMM(end))
        return "";
    var sh = +start.slice(0, 2), sm = +start.slice(2);
    var eh = +end.slice(0, 2), em = +end.slice(2);
    var mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0)
        mins += 1440;
    return mins;
}
function elapsedMinutes(flight) {
    if (flight.status !== "airborne")
        return +flight.duration || 0;
    var start = new Date(flight.takeoffAt || flight.createdAt);
    return Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000));
}
function hhmmToDate(date, hhmm) {
    var dt = new Date(date + "T00:00:00");
    dt.setHours(+hhmm.slice(0, 2), +hhmm.slice(2), 0, 0);
    if (dt.getTime() > Date.now() + 12 * 60 * 60 * 1000)
        dt.setDate(dt.getDate() - 1);
    return dt.toISOString();
}
function validateListed(inputId, validValues, allowSolo) {
    if (allowSolo === void 0) { allowSolo = false; }
    var el = $(inputId);
    var value = upper(el.value);
    el.value = value;
    var warning = document.querySelector("[data-warning-for=\"".concat(inputId, "\"]"));
    if (!value) {
        warning.textContent = "";
        return false;
    }
    var okay = validValues.includes(value) || (allowSolo && value === "SOLO");
    if (okay) {
        warning.textContent = "";
    }
    else {
        var listMap = {
            p1: "names",
            p2: "names",
            glider: "gliders",
            tugReg: "tugAircraft",
            tugPilot: "tugPilots"
        };
        var listKey = listMap[inputId];
        warning.innerHTML = "\u26A0 ".concat(excelXmlEscape(value), " IS NOT ON THE APPROVED LIST. IT MAY STILL BE USED.") +
            (listKey ? " <button type=\"button\" class=\"inline-add-btn\" data-add-master=\"".concat(listKey, "\" data-add-value=\"").concat(excelXmlEscape(value), "\">ADD TO LIST</button>") : "");
    }
    return !okay;
}
function wireValidation() {
    document.querySelectorAll(".uppercase").forEach(function (el) {
        el.addEventListener("input", function () {
            var pos = el.selectionStart;
            el.value = el.value.toUpperCase();
            try {
                el.setSelectionRange(pos, pos);
            }
            catch (_a) { }
        });
        el.addEventListener("blur", function () { return el.value = upper(el.value); });
    });
    $("p1").addEventListener("blur", function () { return validateListed("p1", DATA.names); });
    $("p2").addEventListener("blur", function () { return validateListed("p2", DATA.names, true); });
    $("tugReg").addEventListener("blur", function () { return validateListed("tugReg", DATA.tugAircraft); });
    $("tugPilot").addEventListener("blur", function () { return validateListed("tugPilot", DATA.tugPilots); });
    $("glider").addEventListener("blur", function () { return validateListed("glider", DATA.gliders); });
    ["takeoff", "landing"].forEach(function (id) { return $(id).addEventListener("input", function () {
        $(id).value = $(id).value.replace(/\D/g, "").slice(0, 4);
        $("duration").value = calcDuration($("takeoff").value, $("landing").value);
        $("saveFlightBtn").textContent = $("landing").value ? "SAVE COMPLETED FLIGHT" : "SAVE AS AIRBORNE";
    }); });
}
function setFlyingDayControl(fieldName, value) {
    var ids = { day: "flyingDay", runway: "runway", windDirection: "windDirection", windSpeed: "windSpeed" };
    var control = $(ids[fieldName]);
    if (!control)
        return;
    flyingDayState.suppressEvents = true;
    control.value = value !== null && value !== void 0 ? value : "";
    flyingDayState.displayed[fieldName] = control.value;
    if (fieldName === "runway")
        lastLoadedRunway = control.value;
    setTimeout(function () { flyingDayState.suppressEvents = false; }, 0);
}
function readFlyingDayControl(fieldName) {
    var _a;
    var ids = { day: "flyingDay", runway: "runway", windDirection: "windDirection", windSpeed: "windSpeed" };
    return (((_a = $(ids[fieldName])) === null || _a === void 0 ? void 0 : _a.value) || "").trim();
}
function loadDay() {
    return __awaiter(this, void 0, void 0, function () {
        var date, defaultDay, values, error_1, pending, _i, _a, _b, fieldName, value, _c, _d, fieldName;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    date = $("flyingDate").value;
                    defaultDay = new Date(date + "T12:00:00")
                        .toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase();
                    values = null;
                    if (!(navigator.onLine && (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved))) return [3 /*break*/, 4];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchCloudFlyingDayValues(date)];
                case 2:
                    values = _e.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _e.sent();
                    console.warn("Cloud Flying Day read failed:", error_1);
                    return [3 /*break*/, 4];
                case 4:
                    if (!!values) return [3 /*break*/, 6];
                    return [4 /*yield*/, get("days", date)];
                case 5:
                    values = _e.sent();
                    _e.label = 6;
                case 6:
                    values = {
                        date: date,
                        day: (values === null || values === void 0 ? void 0 : values.day) || defaultDay,
                        runway: (values === null || values === void 0 ? void 0 : values.runway) || DATA.runways[0] || "",
                        windDirection: (values === null || values === void 0 ? void 0 : values.windDirection) || "",
                        windSpeed: (values === null || values === void 0 ? void 0 : values.windSpeed) || ""
                    };
                    return [4 /*yield*/, pendingDayFields(date)];
                case 7:
                    pending = _e.sent();
                    for (_i = 0, _a = Object.entries(pending); _i < _a.length; _i++) {
                        _b = _a[_i], fieldName = _b[0], value = _b[1];
                        values[fieldName] = value !== null && value !== void 0 ? value : "";
                    }
                    for (_c = 0, _d = ["day", "runway", "windDirection", "windSpeed"]; _c < _d.length; _c++) {
                        fieldName = _d[_c];
                        setFlyingDayControl(fieldName, values[fieldName]);
                    }
                    return [4 /*yield*/, put("days", __assign(__assign({}, values), { modifiedAt: new Date().toISOString() }))];
                case 8:
                    _e.sent();
                    return [4 /*yield*/, updateDashboard()];
                case 9:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function saveFlyingDayField(fieldName_1) {
    return __awaiter(this, arguments, void 0, function (fieldName, confirmRunwayChange) {
        var date, value, previous, confirmed, local;
        var _a;
        if (confirmRunwayChange === void 0) { confirmRunwayChange = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (flyingDayState.suppressEvents)
                        return [2 /*return*/, false];
                    date = $("flyingDate").value;
                    value = readFlyingDayControl(fieldName);
                    previous = (_a = flyingDayState.displayed[fieldName]) !== null && _a !== void 0 ? _a : "";
                    if (!(fieldName === "runway" && confirmRunwayChange && previous && value !== previous)) return [3 /*break*/, 2];
                    return [4 /*yield*/, askYesNo("CHANGE RUNWAY FROM ".concat(previous, " TO ").concat(value, " FOR ALL DEVICES?"))];
                case 1:
                    confirmed = _b.sent();
                    if (!confirmed) {
                        setFlyingDayControl("runway", previous);
                        return [2 /*return*/, false];
                    }
                    _b.label = 2;
                case 2:
                    if (value === previous && !flyingDayState.pending.has(fieldName))
                        return [2 /*return*/, true];
                    flyingDayState.pending.set(fieldName, value);
                    flyingDayState.displayed[fieldName] = value;
                    return [4 /*yield*/, get("days", date)];
                case 3:
                    local = (_b.sent()) || { date: date };
                    local[fieldName] = value;
                    local.modifiedAt = new Date().toISOString();
                    return [4 /*yield*/, put("days", local)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, queueFlyingDayField(date, fieldName, value, local.modifiedAt)];
                case 5:
                    _b.sent();
                    if (navigator.onLine && (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved))
                        setTimeout(processSyncQueue, 0);
                    return [2 /*return*/, true];
            }
        });
    });
}
function scheduleFlyingDayFieldSave(fieldName) {
    var _this = this;
    if (flyingDayState.suppressEvents)
        return;
    var prior = flyingDayState.timers.get(fieldName);
    if (prior)
        clearTimeout(prior);
    flyingDayState.timers.set(fieldName, setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 2, 3]);
                    return [4 /*yield*/, saveFlyingDayField(fieldName, false)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    flyingDayState.timers.delete(fieldName);
                    return [7 /*endfinally*/];
                case 3: return [2 /*return*/];
            }
        });
    }); }, 500));
}
function openEntry(type) {
    editingFlightId = null;
    currentType = type;
    $("entryTitle").textContent = type === "winch" ? "New Winch Flight" : "New Aerotow Flight";
    $("aerotowOnly").classList.toggle("visible", type === "aerotow");
    $("flightForm").reset();
    $("p2").value = "";
    $("formMessage").textContent = "";
    $("saveFlightBtn").textContent = "SAVE AS AIRBORNE";
    document.querySelectorAll(".warning-text").forEach(function (x) { return x.textContent = ""; });
    showView("entryView");
}
function saveFlight(e) {
    return __awaiter(this, void 0, void 0, function () {
        var takeoff, landing, p2Value, isSolo, warnings, date, existing, sameGliderAirborne, now, status, duration, flight, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    takeoff = $("takeoff").value, landing = $("landing").value;
                    if (!isValidHHMM(takeoff)) {
                        $("formMessage").textContent = "ENTER A VALID FOUR-DIGIT TAKE-OFF TIME.";
                        return [2 /*return*/];
                    }
                    if (landing && !isValidHHMM(landing)) {
                        $("formMessage").textContent = "ENTER A VALID FOUR-DIGIT LANDING TIME OR LEAVE IT BLANK.";
                        return [2 /*return*/];
                    }
                    p2Value = upper($("p2").value);
                    if (!!p2Value) return [3 /*break*/, 2];
                    return [4 /*yield*/, askYesNo("P2 IS BLANK. IS THIS A SOLO FLIGHT?")];
                case 1:
                    isSolo = _a.sent();
                    if (isSolo) {
                        p2Value = "SOLO";
                        $("p2").value = "SOLO";
                    }
                    else {
                        $("p2").focus();
                        $("formMessage").textContent = "ENTER P2 OR SELECT SOLO.";
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    warnings = [];
                    if (validateListed("glider", DATA.gliders))
                        warnings.push("UNLISTED GLIDER");
                    if (validateListed("p1", DATA.names))
                        warnings.push("UNLISTED P1");
                    if (validateListed("p2", DATA.names, true))
                        warnings.push("UNLISTED P2");
                    if (currentType === "aerotow" && validateListed("tugReg", DATA.tugAircraft))
                        warnings.push("UNLISTED TUG AIRCRAFT");
                    if (currentType === "aerotow" && validateListed("tugPilot", DATA.tugPilots))
                        warnings.push("UNLISTED TUG PILOT");
                    date = $("flyingDate").value;
                    return [4 /*yield*/, getFlightsByDate(date)];
                case 3:
                    existing = _a.sent();
                    sameGliderAirborne = existing.find(function (f) {
                        return f.status === "airborne" &&
                            upper(f.glider) === upper($("glider").value) &&
                            f.id !== editingFlightId;
                    });
                    if (sameGliderAirborne && !confirm("".concat(upper($("glider").value), " IS ALREADY SHOWN AS AIRBORNE. SAVE ANOTHER OPEN FLIGHT?")))
                        return [2 /*return*/];
                    now = new Date().toISOString();
                    status = landing ? "completed" : "airborne";
                    duration = landing ? calcDuration(takeoff, landing) : "";
                    if (!editingFlightId) return [3 /*break*/, 5];
                    return [4 /*yield*/, get("flights", editingFlightId)];
                case 4:
                    flight = _a.sent();
                    if (!flight) {
                        $("formMessage").textContent = "THE FLIGHT COULD NOT BE FOUND.";
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    id = "".concat(currentType === "winch" ? "WL" : "AT", "-").concat(date.replaceAll("-", ""), "-").concat(crypto.randomUUID());
                    flight = {
                        id: id,
                        createdAt: now,
                        createdOnDevice: "local"
                    };
                    _a.label = 6;
                case 6:
                    Object.assign(flight, {
                        type: currentType,
                        date: date,
                        status: status,
                        tugReg: upper($("tugReg").value),
                        tugPilot: upper($("tugPilot").value),
                        towHeight: $("towHeight").value.trim(),
                        glider: upper($("glider").value),
                        p1: upper($("p1").value),
                        p2: p2Value,
                        payee: upper($("payee").value),
                        takeoff: takeoff,
                        landing: landing,
                        duration: duration,
                        takeoffAt: hhmmToDate(date, takeoff),
                        landedAt: landing ? hhmmToDate(date, landing) : null,
                        remarks: upper($("remarks").value),
                        aeros: $("aeros").value.trim(),
                        officeUse: upper($("officeUse").value),
                        warnings: warnings,
                        syncStatus: "pending",
                        modifiedAt: now
                    });
                    flight.syncStatus = "pending";
                    flight.pendingModifiedAt = flight.modifiedAt;
                    return [4 /*yield*/, put("flights", flight)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, queueSyncRecord("flight", flight.id, "upsert")];
                case 8:
                    _a.sent();
                    editingFlightId = null;
                    showView("homeView");
                    return [4 /*yield*/, updateDashboard()];
                case 9:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function editFlight(id) {
    return __awaiter(this, void 0, void 0, function () {
        var flight;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get("flights", id)];
                case 1:
                    flight = _a.sent();
                    if (!flight) {
                        alert("THE FLIGHT COULD NOT BE FOUND.");
                        return [2 /*return*/];
                    }
                    editingFlightId = id;
                    currentType = flight.type;
                    $("entryTitle").textContent = "Edit ".concat(flight.type === "winch" ? "Winch" : "Aerotow", " Flight");
                    $("aerotowOnly").classList.toggle("visible", flight.type === "aerotow");
                    $("tugReg").value = flight.tugReg || "";
                    $("tugPilot").value = flight.tugPilot || "";
                    $("towHeight").value = flight.towHeight || "";
                    $("glider").value = flight.glider || "";
                    $("p1").value = flight.p1 || "";
                    $("p2").value = flight.p2 || "";
                    $("payee").value = flight.payee || "";
                    $("takeoff").value = flight.takeoff || "";
                    $("landing").value = flight.landing || "";
                    $("duration").value = flight.duration || "";
                    $("remarks").value = flight.remarks || "";
                    $("aeros").value = flight.aeros || "";
                    $("officeUse").value = flight.officeUse || "";
                    $("formMessage").textContent = "";
                    $("saveFlightBtn").textContent = flight.status === "airborne" ? "SAVE AIRBORNE CHANGES" : "SAVE FLIGHT CHANGES";
                    document.querySelectorAll(".warning-text").forEach(function (x) { return x.textContent = ""; });
                    validateListed("glider", DATA.gliders);
                    validateListed("p1", DATA.names);
                    validateListed("p2", DATA.names, true);
                    if (flight.type === "aerotow") {
                        validateListed("tugReg", DATA.tugAircraft);
                        validateListed("tugPilot", DATA.tugPilots);
                    }
                    showView("entryView");
                    return [2 /*return*/];
            }
        });
    });
}
function hhmmValue(value) {
    var text = String(value || "").replace(/\D/g, "").padStart(4, "0").slice(-4);
    var hours = Number(text.slice(0, 2));
    var minutes = Number(text.slice(2, 4));
    if (!Number.isFinite(hours) || !Number.isFinite(minutes))
        return -1;
    return hours * 60 + minutes;
}
function operationalTimeValue(flight) {
    if (flight.status === "airborne")
        return hhmmValue(flight.takeoff);
    return hhmmValue(flight.landing || flight.takeoff);
}
function updateDashboard() {
    return __awaiter(this, void 0, void 0, function () {
        var flights, completed, airborne;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, getFlightsByDate($("flyingDate").value)];
                case 1:
                    flights = _a.sent();
                    completed = flights.filter(function (f) { return (f.status || "completed") === "completed"; });
                    airborne = flights.filter(function (f) { return f.status === "airborne"; }).sort(function (a, b) { return operationalTimeValue(b) - operationalTimeValue(a); });
                    $("winchCount").textContent = flights.filter(function (f) { return f.type === "winch"; }).length;
                    $("aerotowCount").textContent = flights.filter(function (f) { return f.type === "aerotow"; }).length;
                    $("minutesCount").textContent = completed.reduce(function (a, f) { return a + (+f.duration || 0); }, 0);
                    $("warningCount").textContent = flights.reduce(function (a, f) { var _a; return a + (((_a = f.warnings) === null || _a === void 0 ? void 0 : _a.length) || 0); }, 0);
                    $("airborneCountBadge").textContent = airborne.length;
                    $("airborneList").innerHTML = airborne.length ? airborne.map(function (f) { return "\n    <article class=\"airborne-card\" data-airborne-id=\"".concat(f.id, "\">\n      <h3>").concat(f.glider, " \u00B7 ").concat(f.type.toUpperCase(), "</h3>\n      <p><strong>P1:</strong> ").concat(f.p1, " &nbsp; <strong>P2:</strong> ").concat(f.p2 || "SOLO", "</p>\n      <p>Took off <strong>").concat(f.takeoff, "</strong></p>\n      <p class=\"elapsed\">").concat(elapsedMinutes(f), " MINUTES AIRBORNE</p>\n      <div class=\"airborne-actions\">\n        <button type=\"button\" class=\"land-btn\" data-land-now=\"").concat(f.id, "\">LAND NOW</button>\n        <button type=\"button\" class=\"manual-land-btn\" data-land-manual=\"").concat(f.id, "\">ENTER TIME</button>\n      </div>\n    </article>"); }).join("") : '<p class="muted">No aircraft currently airborne.</p>';
                    return [2 /*return*/];
            }
        });
    });
}
function landFlight(id, landingTime) {
    return __awaiter(this, void 0, void 0, function () {
        var flight;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get("flights", id)];
                case 1:
                    flight = _a.sent();
                    if (!flight || flight.status !== "airborne")
                        return [2 /*return*/];
                    if (!isValidHHMM(landingTime)) {
                        alert("ENTER A VALID FOUR-DIGIT LANDING TIME.");
                        return [2 /*return*/];
                    }
                    flight.landing = landingTime;
                    flight.landedAt = hhmmToDate(flight.date, landingTime);
                    flight.duration = calcDuration(flight.takeoff, landingTime);
                    flight.status = "completed";
                    flight.modifiedAt = new Date().toISOString();
                    flight.syncStatus = "pending";
                    flight.pendingModifiedAt = flight.modifiedAt;
                    flight.syncStatus = "pending";
                    flight.pendingModifiedAt = flight.modifiedAt;
                    return [4 /*yield*/, put("flights", flight)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, queueSyncRecord("flight", id, "upsert")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, updateDashboard()];
                case 4:
                    _a.sent();
                    if (navigator.onLine && (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved)) {
                        setTimeout(function () { return reconcileCloudState("landing saved"); }, 500);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function reviewSortTime(flight) {
    return operationalTimeValue(flight);
}
function reviewFlights() {
    return __awaiter(this, void 0, void 0, function () {
        var date, flights;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    date = $("flyingDate").value;
                    return [4 /*yield*/, getFlightsByDate(date)];
                case 1:
                    flights = _a.sent();
                    flights.sort(function (a, b) {
                        var aAirborne = a.status === "airborne" ? 1 : 0;
                        var bAirborne = b.status === "airborne" ? 1 : 0;
                        if (aAirborne !== bAirborne)
                            return bAirborne - aAirborne;
                        return reviewSortTime(b) - reviewSortTime(a);
                    });
                    $("reviewDate").textContent = new Date(date + "T12:00:00").toLocaleDateString("en-GB");
                    $("flightList").innerHTML = flights.length ? flights.map(function (f, i) {
                        var _a, _b;
                        return "\n    <article class=\"flight-card ".concat(((_a = f.warnings) === null || _a === void 0 ? void 0 : _a.length) ? "warning" : "", "\">\n      <h3>").concat(i + 1, ". ").concat(f.type.toUpperCase(), " \u2014 ").concat(f.glider, "</h3>\n      <p><strong>P1:</strong> ").concat(f.p1, " &nbsp; <strong>P2:</strong> ").concat(f.p2 || "SOLO", "</p>\n      ").concat(f.type === "aerotow" ? "<p><strong>TUG:</strong> ".concat(f.tugReg, " \u2014 ").concat(f.tugPilot, "</p>") : "", "\n      <p><strong>").concat(f.takeoff).concat(f.landing ? "–" + f.landing : " · AIRBORNE", "</strong>").concat(f.status === "airborne" ? " \u00B7 ".concat(elapsedMinutes(f), " MINUTES SO FAR") : " \u00B7 ".concat(f.duration, " MINUTES"), "</p>\n      ").concat(f.remarks ? "<p>".concat(f.remarks, "</p>") : "", "\n      ").concat(((_b = f.warnings) === null || _b === void 0 ? void 0 : _b.length) ? "<span class=\"badge\">".concat(f.warnings.join(" · "), "</span>") : "", "\n      <div class=\"review-actions\">\n        <button type=\"button\" class=\"edit-btn\" data-edit=\"").concat(f.id, "\">EDIT</button>\n        <button type=\"button\" class=\"delete-btn\" data-delete=\"").concat(f.id, "\">DELETE</button>\n      </div>\n    </article>");
                    }).join("") : "<p>No flights recorded for this date.</p>";
                    showView("reviewView");
                    return [2 /*return*/];
            }
        });
    });
}
function excelXmlEscape(value) {
    return String(value !== null && value !== void 0 ? value : "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
function exportRows(flights, type) {
    var sorted = flights
        .filter(function (f) { return f.type === type; })
        .sort(function (a, b) { return hhmmValue(a.takeoff) - hhmmValue(b.takeoff); });
    if (type === "winch") {
        return sorted.map(function (f) { return ({
            DATE: f.date,
            GLIDER: f.glider,
            P1: f.p1,
            P2: f.p2,
            PAYEE: f.payee,
            "TAKE OFF": f.takeoff,
            LANDING: f.landing,
            "TOTAL MINUTES": Number(f.duration) || "",
            REMARKS: f.remarks,
            AEROS: f.aeros,
            "OFFICE USE": f.officeUse,
            STATUS: (f.status || "completed").toUpperCase(),
            WARNINGS: (f.warnings || []).join("; ")
        }); });
    }
    return sorted.map(function (f) { return ({
        DATE: f.date,
        "TUG REG": f.tugReg,
        "TUG PILOT": f.tugPilot,
        HEIGHT: f.towHeight,
        GLIDER: f.glider,
        P1: f.p1,
        P2: f.p2,
        PAYEE: f.payee,
        "TAKE OFF": f.takeoff,
        LANDING: f.landing,
        "TOTAL MINUTES": Number(f.duration) || "",
        REMARKS: f.remarks,
        AEROS: f.aeros,
        "OFFICE USE": f.officeUse,
        STATUS: (f.status || "completed").toUpperCase(),
        WARNINGS: (f.warnings || []).join("; ")
    }); });
}
function exportCsv() {
    return __awaiter(this, void 0, void 0, function () {
        var date, flights, workbook, winchRows, aerotowRows, winchSheet, aerotowSheet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    date = $("flyingDate").value;
                    return [4 /*yield*/, getFlightsByDate(date)];
                case 1:
                    flights = _a.sent();
                    if (!flights.length) {
                        alert("NO FLIGHTS TO EXPORT");
                        return [2 /*return*/];
                    }
                    if (!window.XLSX) {
                        alert("THE EXCEL EXPORT LIBRARY HAS NOT LOADED. CONNECT TO THE INTERNET ONCE AND REOPEN OPERATIONSLOGS.");
                        return [2 /*return*/];
                    }
                    workbook = XLSX.utils.book_new();
                    winchRows = exportRows(flights, "winch");
                    aerotowRows = exportRows(flights, "aerotow");
                    winchSheet = XLSX.utils.json_to_sheet(winchRows.length ? winchRows : [{
                            DATE: "", GLIDER: "", P1: "", P2: "", PAYEE: "", "TAKE OFF": "", LANDING: "",
                            "TOTAL MINUTES": "", REMARKS: "", AEROS: "", "OFFICE USE": "", STATUS: "", WARNINGS: ""
                        }]);
                    aerotowSheet = XLSX.utils.json_to_sheet(aerotowRows.length ? aerotowRows : [{
                            DATE: "", "TUG REG": "", "TUG PILOT": "", HEIGHT: "", GLIDER: "", P1: "", P2: "",
                            PAYEE: "", "TAKE OFF": "", LANDING: "", "TOTAL MINUTES": "", REMARKS: "",
                            AEROS: "", "OFFICE USE": "", STATUS: "", WARNINGS: ""
                        }]);
                    winchSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
                    aerotowSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
                    winchSheet["!cols"] = [12, 12, 24, 24, 14, 11, 11, 14, 28, 10, 14, 12, 24].map(function (wch) { return ({ wch: wch }); });
                    aerotowSheet["!cols"] = [12, 12, 24, 10, 12, 24, 24, 14, 11, 11, 14, 28, 10, 14, 12, 24].map(function (wch) { return ({ wch: wch }); });
                    XLSX.utils.book_append_sheet(workbook, winchSheet, "Winch");
                    XLSX.utils.book_append_sheet(workbook, aerotowSheet, "Aerotow");
                    XLSX.writeFile(workbook, "OperationsLogs_".concat(date, ".xlsx"), { compression: true });
                    return [2 /*return*/];
            }
        });
    });
}
function updateConnection() {
    if (!navigator.onLine) {
        updatePendingCount();
    }
    else if (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) {
        processSyncQueue();
    }
    else if (currentDevice) {
        setSyncStatus("DEVICE WAITING FOR ADMIN APPROVAL", "pending");
    }
    else {
        setSyncStatus("CONNECTING…", "pending");
    }
}
function askYesNo(message) {
    return new Promise(function (resolve) {
        var overlay = $("yesNoDialog");
        var messageEl = $("yesNoDialogMessage");
        var yesBtn = $("yesNoYesBtn");
        var noBtn = $("yesNoNoBtn");
        messageEl.textContent = message;
        overlay.hidden = false;
        yesBtn.focus();
        var finish = function (answer) {
            overlay.hidden = true;
            yesBtn.removeEventListener("click", yes);
            noBtn.removeEventListener("click", no);
            document.removeEventListener("keydown", keyHandler);
            resolve(answer);
        };
        var yes = function () { return finish(true); };
        var no = function () { return finish(false); };
        var keyHandler = function (event) {
            if (event.key === "Escape")
                finish(false);
        };
        yesBtn.addEventListener("click", yes);
        noBtn.addEventListener("click", no);
        document.addEventListener("keydown", keyHandler);
    });
}
function moveFocusWhenChosen(inputId, nextId, allowedValues) {
    if (allowedValues === void 0) { allowedValues = null; }
    var input = $(inputId);
    if (!input)
        return;
    var move = function () {
        var value = upper(input.value);
        if (!value)
            return;
        if (allowedValues && !allowedValues.some(function (item) { return upper(item) === value; }))
            return;
        var next = $(nextId);
        if (next)
            setTimeout(function () { next.focus(); if (typeof next.select === "function")
                next.select(); }, 0);
    };
    input.addEventListener("change", move);
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            move();
        }
    });
}
var ADMIN_LABELS = {
    names: "PILOT",
    gliders: "GLIDER",
    tugAircraft: "TUG AIRCRAFT",
    tugPilots: "TUG PILOT",
    payees: "PAYEE"
};
function openAdministration(listKey) {
    if (listKey === void 0) { listKey = "names"; }
    currentAdminList = listKey;
    $("adminSearch").value = "";
    $("adminNewValue").value = "";
    $("adminMessage").textContent = "";
    document.querySelectorAll(".admin-tab").forEach(function (button) {
        button.classList.toggle("active", button.dataset.adminList === currentAdminList);
    });
    renderAdminList();
    showView("adminView");
}
function renderAdminList() {
    var query = upper($("adminSearch").value);
    var values = cleanMasterValues(DATA[currentAdminList])
        .filter(function (value) { return !query || value.includes(query); });
    $("adminList").innerHTML = values.length ? values.map(function (value) { return "\n    <div class=\"admin-list-row\">\n      <span>".concat(excelXmlEscape(value), "</span>\n      <div class=\"admin-row-actions\">\n        <button type=\"button\" class=\"edit-btn\" data-master-edit=\"").concat(excelXmlEscape(value), "\">EDIT</button>\n        <button type=\"button\" class=\"delete-btn\" data-master-delete=\"").concat(excelXmlEscape(value), "\">DELETE</button>\n      </div>\n    </div>\n  "); }).join("") : '<p class="muted">No matching entries.</p>';
}
function addMasterValue(key, rawValue) {
    return __awaiter(this, void 0, void 0, function () {
        var value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    value = upper(rawValue);
                    if (!value)
                        return [2 /*return*/, false];
                    if (key === "names" && value === "SOLO") {
                        $("adminMessage").textContent = "SOLO IS ALREADY AVAILABLE AS A SPECIAL P2 ENTRY.";
                        return [2 /*return*/, false];
                    }
                    if (DATA[key].includes(value)) {
                        $("adminMessage").textContent = "".concat(value, " IS ALREADY ON THE LIST.");
                        return [2 /*return*/, false];
                    }
                    DATA[key].push(value);
                    return [4 /*yield*/, saveMasterList(key)];
                case 1:
                    _a.sent();
                    $("adminMessage").textContent = "".concat(value, " ADDED.");
                    return [2 /*return*/, true];
            }
        });
    });
}
function editMasterValue(key, oldValue) {
    return __awaiter(this, void 0, void 0, function () {
        var typed, newValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    typed = prompt("EDIT ".concat(ADMIN_LABELS[key], ":"), oldValue);
                    if (typed === null)
                        return [2 /*return*/];
                    newValue = upper(typed);
                    if (!newValue || newValue === oldValue)
                        return [2 /*return*/];
                    if (DATA[key].includes(newValue)) {
                        alert("".concat(newValue, " IS ALREADY ON THE LIST."));
                        return [2 /*return*/];
                    }
                    DATA[key] = DATA[key].map(function (value) { return value === oldValue ? newValue : value; });
                    return [4 /*yield*/, saveMasterList(key)];
                case 1:
                    _a.sent();
                    renderAdminList();
                    return [2 /*return*/];
            }
        });
    });
}
function deleteMasterValue(key, value) {
    return __awaiter(this, void 0, void 0, function () {
        var okay;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, askYesNo("DELETE ".concat(value, " FROM THE ").concat(ADMIN_LABELS[key], " LIST?"))];
                case 1:
                    okay = _a.sent();
                    if (!okay)
                        return [2 /*return*/];
                    DATA[key] = DATA[key].filter(function (item) { return item !== value; });
                    return [4 /*yield*/, saveMasterList(key)];
                case 2:
                    _a.sent();
                    renderAdminList();
                    return [2 /*return*/];
            }
        });
    });
}
document.addEventListener("DOMContentLoaded", function () { return __awaiter(_this, void 0, void 0, function () {
    var error_2, message;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                initialiseLists();
                wireValidation();
                return [4 /*yield*/, openDb()];
            case 1:
                _a.sent();
                return [4 /*yield*/, loadMasterLists()];
            case 2:
                _a.sent();
                return [4 /*yield*/, initializeCloudSync()];
            case 3:
                _a.sent();
                setDate(todayISO());
                return [4 /*yield*/, loadDay()];
            case 4:
                _a.sent();
                updateConnection();
                if (adminAccess && adminUser)
                    $("adminIdentity").textContent = (adminUser.email || "ADMIN").toUpperCase();
                $("flyingDate").addEventListener("change", function (event) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!event.isTrusted || flyingDayState.suppressEvents)
                                    return [2 /*return*/];
                                setDate($("flyingDate").value);
                                return [4 /*yield*/, loadDay()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                $("runway").addEventListener("change", function (event) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!event.isTrusted || flyingDayState.suppressEvents)
                                    return [2 /*return*/];
                                return [4 /*yield*/, saveFlyingDayField("runway", true)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                $("windDirection").addEventListener("input", function (event) {
                    if (!event.isTrusted || flyingDayState.suppressEvents)
                        return;
                    $("windDirection").value = $("windDirection").value.replace(/\D/g, "").slice(0, 3);
                    scheduleFlyingDayFieldSave("windDirection");
                });
                $("windDirection").addEventListener("blur", function () { return __awaiter(_this, void 0, void 0, function () {
                    var timer;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (flyingDayState.suppressEvents)
                                    return [2 /*return*/];
                                timer = flyingDayState.timers.get("windDirection");
                                if (timer)
                                    clearTimeout(timer);
                                flyingDayState.timers.delete("windDirection");
                                return [4 /*yield*/, saveFlyingDayField("windDirection", false)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                $("windSpeed").addEventListener("input", function (event) {
                    if (!event.isTrusted || flyingDayState.suppressEvents)
                        return;
                    $("windSpeed").value = $("windSpeed").value.replace(/\D/g, "").slice(0, 2);
                    scheduleFlyingDayFieldSave("windSpeed");
                });
                $("windSpeed").addEventListener("blur", function () { return __awaiter(_this, void 0, void 0, function () {
                    var timer;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (flyingDayState.suppressEvents)
                                    return [2 /*return*/];
                                timer = flyingDayState.timers.get("windSpeed");
                                if (timer)
                                    clearTimeout(timer);
                                flyingDayState.timers.delete("windSpeed");
                                return [4 /*yield*/, saveFlyingDayField("windSpeed", false)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                $("winchFlightBtn").addEventListener("click", function () { openEntry("winch"); });
                $("aerotowFlightBtn").addEventListener("click", function () { openEntry("aerotow"); });
                $("flightForm").addEventListener("submit", saveFlight);
                moveFocusWhenChosen("p1", "p2", DATA.names);
                moveFocusWhenChosen("p2", "payee", __spreadArray(__spreadArray([], DATA.names, true), ["SOLO"], false));
                moveFocusWhenChosen("payee", "takeoff", DATA.names);
                $("backBtn").addEventListener("click", function () { return showView("homeView"); });
                $("reviewBackBtn").addEventListener("click", function () { return showView("homeView"); });
                $("reviewBtn").addEventListener("click", reviewFlights);
                $("exportBtn").addEventListener("click", exportCsv);
                $("adminBtn").addEventListener("click", requestAdminAccess);
                $("adminBackBtn").addEventListener("click", function () { return showView("homeView"); });
                $("adminLoginBtn").addEventListener("click", adminSignIn);
                $("adminLoginCancelBtn").addEventListener("click", function () { return $("adminLoginDialog").hidden = true; });
                $("adminSignOutBtn").addEventListener("click", adminSignOut);
                $("adminPassword").addEventListener("keydown", function (event) {
                    if (event.key === "Enter")
                        adminSignIn();
                });
                $("adminDeviceList").addEventListener("click", function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var button;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                button = event.target.closest("[data-device-toggle]");
                                if (!button)
                                    return [2 /*return*/];
                                return [4 /*yield*/, toggleDeviceApproval(button.dataset.deviceToggle, button.dataset.deviceApproved === "true")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                $("adminSearch").addEventListener("input", renderAdminList);
                $("adminAddBtn").addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
                    var added;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, addMasterValue(currentAdminList, $("adminNewValue").value)];
                            case 1:
                                added = _a.sent();
                                if (added) {
                                    $("adminNewValue").value = "";
                                    renderAdminList();
                                    $("adminNewValue").focus();
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                $("adminNewValue").addEventListener("keydown", function (event) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            $("adminAddBtn").click();
                        }
                        return [2 /*return*/];
                    });
                }); });
                document.querySelectorAll(".admin-tab").forEach(function (button) {
                    button.addEventListener("click", function () { return openAdministration(button.dataset.adminList); });
                });
                $("adminList").addEventListener("click", function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var editButton, deleteButton;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                editButton = event.target.closest("[data-master-edit]");
                                deleteButton = event.target.closest("[data-master-delete]");
                                if (!editButton) return [3 /*break*/, 2];
                                return [4 /*yield*/, editMasterValue(currentAdminList, editButton.dataset.masterEdit)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                if (!deleteButton) return [3 /*break*/, 4];
                                return [4 /*yield*/, deleteMasterValue(currentAdminList, deleteButton.dataset.masterDelete)];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                document.body.addEventListener("click", function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var button, added;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                button = event.target.closest("[data-add-master]");
                                if (!button)
                                    return [2 /*return*/];
                                if (!!adminAccess) return [3 /*break*/, 2];
                                return [4 /*yield*/, requestAdminAccess()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                            case 2: return [4 /*yield*/, addMasterValue(button.dataset.addMaster, button.dataset.addValue)];
                            case 3:
                                added = _a.sent();
                                if (added) {
                                    button.closest(".warning-text").textContent = "";
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                document.body.addEventListener("click", function (event) {
                    var node = event.target;
                    while (node && node !== document.body) {
                        if (node.id === "winchFlightBtn") {
                            event.preventDefault();
                            openEntry("winch");
                            return;
                        }
                        if (node.id === "aerotowFlightBtn") {
                            event.preventDefault();
                            openEntry("aerotow");
                            return;
                        }
                        node = node.parentNode;
                    }
                });
                $("flightList").addEventListener("click", function (e) { return __awaiter(_this, void 0, void 0, function () {
                    var editButton, deleteButton, id;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                editButton = e.target.closest("[data-edit]");
                                deleteButton = e.target.closest("[data-delete]");
                                if (!editButton) return [3 /*break*/, 2];
                                e.preventDefault();
                                return [4 /*yield*/, editFlight(editButton.dataset.edit)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                            case 2:
                                if (!(deleteButton && confirm("DELETE THIS FLIGHT FROM THIS DEVICE?"))) return [3 /*break*/, 7];
                                e.preventDefault();
                                id = deleteButton.dataset.delete;
                                return [4 /*yield*/, removeFlight(id)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, queueSyncRecord("flight", id, "delete")];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, reviewFlights()];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, updateDashboard()];
                            case 6:
                                _a.sent();
                                _a.label = 7;
                            case 7: return [2 /*return*/];
                        }
                    });
                }); });
                $("airborneList").addEventListener("click", function (e) { return __awaiter(_this, void 0, void 0, function () {
                    var nowId, manualId, value;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                nowId = e.target.dataset.landNow;
                                manualId = e.target.dataset.landManual;
                                if (!nowId) return [3 /*break*/, 2];
                                return [4 /*yield*/, landFlight(nowId, timeHHMM())];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                if (!manualId) return [3 /*break*/, 4];
                                value = prompt("ENTER LANDING TIME AS FOUR DIGITS (HHMM):", timeHHMM());
                                if (!(value !== null)) return [3 /*break*/, 4];
                                return [4 /*yield*/, landFlight(manualId, value.replace(/\D/g, "").slice(0, 4))];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                setInterval(function () {
                    if ($("homeView").classList.contains("active"))
                        updateDashboard();
                }, 60000);
                window.addEventListener("online", updateConnection);
                window.addEventListener("offline", updateConnection);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error(error_2);
                message = document.getElementById("formMessage");
                if (message)
                    message.textContent = "APP STARTUP ERROR: " + error_2.message;
                alert("OPERATIONSLOGS STARTUP ERROR: " + error_2.message);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
