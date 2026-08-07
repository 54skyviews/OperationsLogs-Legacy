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
var _this = this;
var operatorSupabase = null;
var adminSupabase = null;
var operatorUser = null;
var currentDevice = null;
var adminUser = null;
var adminAccess = false;
var realtimeChannel = null;
var syncBusy = false;
var reconciliationTimer = null;
var lastCloudPullAt = 0;
var approvalWatcher = null;
var lastSyncError = "";
var lastVerification = null;
var CLOUD = window.OPERATIONSLOGS_SUPABASE;
function cloudAvailable() {
    return Boolean(window.supabase && (CLOUD === null || CLOUD === void 0 ? void 0 : CLOUD.url) && (CLOUD === null || CLOUD === void 0 ? void 0 : CLOUD.publishableKey));
}
function makeCloudClients() {
    if (!cloudAvailable())
        return false;
    operatorSupabase = window.supabase.createClient(CLOUD.url, CLOUD.publishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            storageKey: "operationslogs-operator-auth"
        }
    });
    adminSupabase = window.supabase.createClient(CLOUD.url, CLOUD.publishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            storageKey: "operationslogs-admin-auth"
        }
    });
    return true;
}
function setSyncStatus(text, kind) {
    if (kind === void 0) { kind = "offline"; }
    var badge = document.getElementById("statusBadge");
    if (!badge)
        return;
    badge.textContent = text;
    badge.className = "status ".concat(kind);
}
function localDeviceName() {
    return localStorage.getItem("operationslogs-device-name") || "";
}
function askDeviceName() {
    return __awaiter(this, void 0, void 0, function () {
        var name, typed;
        return __generator(this, function (_a) {
            name = localDeviceName();
            while (!name) {
                typed = prompt("NAME THIS DEVICE, FOR EXAMPLE:\nLAUNCH POINT IPAD\nOFFICE COMPUTER\nTUG TABLET", "");
                if (typed === null)
                    return [2 /*return*/, ""];
                name = upper(typed);
            }
            localStorage.setItem("operationslogs-device-name", name);
            return [2 /*return*/, name];
        });
    });
}
function ensureOperatorSession() {
    return __awaiter(this, void 0, void 0, function () {
        var sessionData, _a, data, error;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, operatorSupabase.auth.getSession()];
                case 1:
                    sessionData = (_c.sent()).data;
                    if ((_b = sessionData.session) === null || _b === void 0 ? void 0 : _b.user) {
                        operatorUser = sessionData.session.user;
                        return [2 /*return*/, operatorUser];
                    }
                    return [4 /*yield*/, operatorSupabase.auth.signInAnonymously()];
                case 2:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    operatorUser = data.user;
                    return [2 /*return*/, operatorUser];
            }
        });
    });
}
function ensureDeviceRegistration() {
    return __awaiter(this, void 0, void 0, function () {
        var name, _a, existing, selectError, _b, inserted, insertError;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, askDeviceName()];
                case 1:
                    name = _c.sent();
                    if (!name) {
                        setSyncStatus("LOCAL ONLY · DEVICE NOT NAMED", "offline");
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, operatorSupabase
                            .from("devices")
                            .select("*")
                            .eq("auth_user_id", operatorUser.id)
                            .maybeSingle()];
                case 2:
                    _a = _c.sent(), existing = _a.data, selectError = _a.error;
                    if (selectError)
                        throw selectError;
                    if (!existing) return [3 /*break*/, 5];
                    currentDevice = existing;
                    if (!(existing.name !== name)) return [3 /*break*/, 4];
                    return [4 /*yield*/, operatorSupabase
                            .from("devices")
                            .update({ name: name, updated_at: new Date().toISOString() })
                            .eq("id", existing.id)];
                case 3:
                    _c.sent();
                    currentDevice.name = name;
                    _c.label = 4;
                case 4: return [2 /*return*/, currentDevice];
                case 5: return [4 /*yield*/, operatorSupabase
                        .from("devices")
                        .insert({
                        auth_user_id: operatorUser.id,
                        name: name,
                        approved: false,
                        active: true
                    })
                        .select()
                        .single()];
                case 6:
                    _b = _c.sent(), inserted = _b.data, insertError = _b.error;
                    if (insertError)
                        throw insertError;
                    currentDevice = inserted;
                    return [2 /*return*/, currentDevice];
            }
        });
    });
}
function refreshCurrentDeviceStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, wasApproved, isApproved;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!operatorSupabase || !operatorUser)
                        return [2 /*return*/, currentDevice];
                    return [4 /*yield*/, operatorSupabase
                            .from("devices")
                            .select("*")
                            .eq("auth_user_id", operatorUser.id)
                            .maybeSingle()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.warn("Could not refresh device approval:", error);
                        return [2 /*return*/, currentDevice];
                    }
                    if (!data)
                        return [2 /*return*/, currentDevice];
                    wasApproved = Boolean((currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) && (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.active));
                    currentDevice = data;
                    isApproved = Boolean(data.approved && data.active);
                    if (!(isApproved && !wasApproved)) return [3 /*break*/, 4];
                    setSyncStatus("DEVICE APPROVED · STARTING SYNC", "online");
                    return [4 /*yield*/, pullCloudData()];
                case 2:
                    _b.sent();
                    subscribeRealtime();
                    return [4 /*yield*/, processSyncQueue()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    if (!isApproved) {
                        setSyncStatus("DEVICE WAITING FOR ADMIN APPROVAL", "pending");
                    }
                    _b.label = 5;
                case 5: return [2 /*return*/, currentDevice];
            }
        });
    });
}
function startApprovalWatcher() {
    var _this = this;
    if (approvalWatcher)
        clearInterval(approvalWatcher);
    approvalWatcher = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!navigator.onLine || !operatorSupabase || !operatorUser)
                        return [2 /*return*/];
                    return [4 /*yield*/, refreshCurrentDeviceStatus()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, 10000);
    window.addEventListener("focus", refreshCurrentDeviceStatus);
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible")
            refreshCurrentDeviceStatus();
    });
}
function remoteFlightFromLocal(flight) {
    return {
        id: flight.id,
        date: flight.date,
        type: flight.type,
        status: flight.status || "completed",
        tug_reg: flight.tugReg || "",
        tug_pilot: flight.tugPilot || "",
        tow_height: flight.towHeight || "",
        glider: flight.glider || "",
        p1: flight.p1 || "",
        p2: flight.p2 || "",
        payee: flight.payee || "",
        takeoff: flight.takeoff || "",
        landing: flight.landing || "",
        duration: Number(flight.duration) || null,
        takeoff_at: flight.takeoffAt || null,
        landed_at: flight.landedAt || null,
        remarks: flight.remarks || "",
        aeros: flight.aeros || "",
        office_use: flight.officeUse || "",
        warnings: flight.warnings || [],
        created_by_device: flight.createdByDevice || (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.id) || null,
        modified_by_device: (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.id) || null,
        created_at: flight.createdAt || new Date().toISOString(),
        modified_at: flight.modifiedAt || new Date().toISOString()
    };
}
function localFlightFromRemote(row) {
    var _a;
    return {
        id: row.id,
        date: row.date,
        type: row.type,
        status: row.status,
        tugReg: row.tug_reg || "",
        tugPilot: row.tug_pilot || "",
        towHeight: row.tow_height || "",
        glider: row.glider || "",
        p1: row.p1 || "",
        p2: row.p2 || "",
        payee: row.payee || "",
        takeoff: row.takeoff || "",
        landing: row.landing || "",
        duration: (_a = row.duration) !== null && _a !== void 0 ? _a : "",
        takeoffAt: row.takeoff_at,
        landedAt: row.landed_at,
        remarks: row.remarks || "",
        aeros: row.aeros || "",
        officeUse: row.office_use || "",
        warnings: row.warnings || [],
        createdByDevice: row.created_by_device,
        modifiedByDevice: row.modified_by_device,
        createdAt: row.created_at,
        modifiedAt: row.modified_at,
        syncStatus: "synced"
    };
}
function allFromStore(storeName) {
    return new Promise(function (resolve, reject) {
        var req = db.transaction(storeName).objectStore(storeName).getAll();
        req.onsuccess = function () { return resolve(req.result || []); };
        req.onerror = function () { return reject(req.error); };
    });
}
function removeQueueItem(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, remove("syncQueue", id)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var DAY_FIELD_COLUMN_MAP = {
    day: "day",
    runway: "runway",
    windDirection: "wind_direction",
    windSpeed: "wind_speed"
};
function queueFlyingDayField(date, fieldName, value, modifiedAt) {
    return __awaiter(this, void 0, void 0, function () {
        var queueId, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queueId = "day:".concat(date, ":").concat(fieldName);
                    return [4 /*yield*/, get("syncQueue", queueId)];
                case 1:
                    existing = _a.sent();
                    return [4 /*yield*/, put("syncQueue", {
                            id: queueId,
                            recordType: "dayField",
                            recordId: date,
                            fieldName: fieldName,
                            value: value !== null && value !== void 0 ? value : "",
                            modifiedAt: modifiedAt || new Date().toISOString(),
                            queuedAt: new Date().toISOString(),
                            attempts: (existing === null || existing === void 0 ? void 0 : existing.attempts) || 0,
                            version: ((existing === null || existing === void 0 ? void 0 : existing.version) || 0) + 1
                        })];
                case 2:
                    _a.sent();
                    updatePendingCount();
                    if (navigator.onLine)
                        setTimeout(processSyncQueue, 0);
                    return [2 /*return*/];
            }
        });
    });
}
function pendingDayFields(date) {
    return __awaiter(this, void 0, void 0, function () {
        var items, pending, _i, items_1, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, allFromStore("syncQueue")];
                case 1:
                    items = _a.sent();
                    pending = {};
                    for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                        item = items_1[_i];
                        if (item.recordType === "dayField" && item.recordId === date) {
                            pending[item.fieldName] = item.value;
                        }
                    }
                    return [2 /*return*/, pending];
            }
        });
    });
}
function fetchCloudFlyingDayValues(date) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, values, _i, data_1, row;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, operatorSupabase
                        .from("flying_day_values")
                        .select("field_name,value")
                        .eq("date", date)];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    if (!(data === null || data === void 0 ? void 0 : data.length))
                        return [2 /*return*/, null];
                    values = { date: date, day: "", runway: "", windDirection: "", windSpeed: "" };
                    for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                        row = data_1[_i];
                        if (Object.prototype.hasOwnProperty.call(values, row.field_name)) {
                            values[row.field_name] = (_b = row.value) !== null && _b !== void 0 ? _b : "";
                        }
                    }
                    return [2 /*return*/, values];
            }
        });
    });
}
function queueSyncRecord(recordType_1, recordId_1) {
    return __awaiter(this, arguments, void 0, function (recordType, recordId, action) {
        var queueId;
        if (action === void 0) { action = "upsert"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queueId = "".concat(recordType, ":").concat(recordId);
                    return [4 /*yield*/, put("syncQueue", {
                            id: queueId,
                            recordType: recordType,
                            recordId: recordId,
                            action: action,
                            queuedAt: new Date().toISOString(),
                            attempts: 0
                        })];
                case 1:
                    _a.sent();
                    updatePendingCount();
                    if (navigator.onLine)
                        setTimeout(processSyncQueue, 0);
                    return [2 /*return*/];
            }
        });
    });
}
function cleanupLegacyFlyingDayQueue() {
    return __awaiter(this, void 0, void 0, function () {
        var cleanupKey, items, _i, items_2, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cleanupKey = "operationslogs-flying-day-queue-cleanup-v130";
                    if (localStorage.getItem(cleanupKey) === "done")
                        return [2 /*return*/, false];
                    return [4 /*yield*/, allFromStore("syncQueue")];
                case 1:
                    items = _a.sent();
                    _i = 0, items_2 = items;
                    _a.label = 2;
                case 2:
                    if (!(_i < items_2.length)) return [3 /*break*/, 5];
                    item = items_2[_i];
                    if (!(item.recordType === "day" || item.recordType === "dayField")) return [3 /*break*/, 4];
                    return [4 /*yield*/, removeQueueItem(item.id)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    localStorage.setItem(cleanupKey, "done");
                    return [2 /*return*/, true];
            }
        });
    });
}
function updatePendingCount() {
    return __awaiter(this, void 0, void 0, function () {
        var pending, masterWaiting, operationalWaiting;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, allFromStore("syncQueue")];
                case 1:
                    pending = _a.sent();
                    masterWaiting = pending.filter(function (item) { return item.recordType === "master"; }).length;
                    operationalWaiting = pending.length - masterWaiting;
                    if (!navigator.onLine) {
                        setSyncStatus("OFFLINE \u00B7 ".concat(pending.length, " WAITING"), "offline");
                        return [2 /*return*/];
                    }
                    if (!(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) || !(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.active)) {
                        setSyncStatus("DEVICE WAITING FOR ADMIN APPROVAL", "pending");
                        return [2 /*return*/];
                    }
                    if (lastSyncError) {
                        setSyncStatus("SYNC PROBLEM \u00B7 ".concat(lastSyncError), "error");
                        return [2 /*return*/];
                    }
                    if (operationalWaiting > 0) {
                        setSyncStatus("ONLINE \u00B7 ".concat(operationalWaiting, " CHANGES WAITING"), "pending");
                        return [2 /*return*/];
                    }
                    if (masterWaiting > 0 && !adminAccess) {
                        setSyncStatus("ONLINE \u00B7 ".concat(masterWaiting, " ADMIN CHANGE WAITING"), "pending");
                        return [2 /*return*/];
                    }
                    if (pending.length > 0) {
                        setSyncStatus("ONLINE \u00B7 ".concat(pending.length, " WAITING"), "pending");
                        return [2 /*return*/];
                    }
                    setSyncStatus("ONLINE · SYNCED", "online");
                    return [2 /*return*/];
            }
        });
    });
}
function syncFlightQueueItem(item) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, flight, _a, data, error, synced;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(item.action === "delete")) return [3 /*break*/, 2];
                    return [4 /*yield*/, operatorSupabase.from("flights").delete().eq("id", item.recordId)];
                case 1:
                    error_1 = (_b.sent()).error;
                    if (error_1)
                        throw error_1;
                    return [2 /*return*/];
                case 2: return [4 /*yield*/, get("flights", item.recordId)];
                case 3:
                    flight = _b.sent();
                    if (!flight)
                        return [2 /*return*/];
                    return [4 /*yield*/, operatorSupabase
                            .from("flights")
                            .upsert(remoteFlightFromLocal(flight), { onConflict: "id" })
                            .select()
                            .single()];
                case 4:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    synced = data ? localFlightFromRemote(data) : flight;
                    synced.syncStatus = "synced";
                    synced.pendingModifiedAt = null;
                    return [4 /*yield*/, put("flights", synced)];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function syncDayFieldQueueItem(item) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, latest, local;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, operatorSupabase
                        .from("flying_day_values")
                        .upsert({
                        date: item.recordId,
                        field_name: item.fieldName,
                        value: (_b = item.value) !== null && _b !== void 0 ? _b : "",
                        modified_by_device: (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.id) || null,
                        modified_at: item.modifiedAt || new Date().toISOString()
                    }, { onConflict: "date,field_name" })
                        .select()
                        .single()];
                case 1:
                    _a = _e.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [4 /*yield*/, get("syncQueue", item.id)];
                case 2:
                    latest = _e.sent();
                    if (!(!latest || latest.version === item.version)) return [3 /*break*/, 5];
                    if (typeof flyingDayState !== "undefined") {
                        flyingDayState.pending.delete(item.fieldName);
                        flyingDayState.displayed[item.fieldName] = (_c = data.value) !== null && _c !== void 0 ? _c : "";
                    }
                    return [4 /*yield*/, get("days", item.recordId)];
                case 3:
                    local = (_e.sent()) || { date: item.recordId };
                    local[item.fieldName] = (_d = data.value) !== null && _d !== void 0 ? _d : "";
                    local.modifiedAt = data.modified_at;
                    return [4 /*yield*/, put("days", local)];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5: return [2 /*return*/, data];
            }
        });
    });
}
function syncMasterQueueItem(item) {
    return __awaiter(this, void 0, void 0, function () {
        var key, values, deleteError, rows, insertError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!adminAccess)
                        throw new Error("Administrator sign-in required for master-list synchronisation.");
                    key = item.recordId;
                    values = cleanMasterValues(DATA[key]);
                    return [4 /*yield*/, adminSupabase.from("master_lists").delete().eq("list_key", key)];
                case 1:
                    deleteError = (_a.sent()).error;
                    if (deleteError)
                        throw deleteError;
                    if (!values.length) return [3 /*break*/, 3];
                    rows = values.map(function (value) { return ({
                        list_key: key,
                        value: value,
                        active: true,
                        modified_by: (adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null
                    }); });
                    return [4 /*yield*/, adminSupabase.from("master_lists").insert(rows)];
                case 2:
                    insertError = (_a.sent()).error;
                    if (insertError)
                        throw insertError;
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function processSyncQueue() {
    return __awaiter(this, void 0, void 0, function () {
        var items, _i, items_3, item, latest, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(syncBusy || !navigator.onLine || !operatorSupabase)) return [3 /*break*/, 2];
                    return [4 /*yield*/, updatePendingCount()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    if (!(!(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) || !(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.active))) return [3 /*break*/, 4];
                    return [4 /*yield*/, refreshCurrentDeviceStatus()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (!(!(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) || !(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.active))) return [3 /*break*/, 6];
                    return [4 /*yield*/, updatePendingCount()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
                case 6:
                    syncBusy = true;
                    lastSyncError = "";
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, , 30, 32]);
                    return [4 /*yield*/, allFromStore("syncQueue")];
                case 8:
                    items = (_a.sent())
                        .sort(function (a, b) { return String(a.queuedAt).localeCompare(String(b.queuedAt)); });
                    _i = 0, items_3 = items;
                    _a.label = 9;
                case 9:
                    if (!(_i < items_3.length)) return [3 /*break*/, 29];
                    item = items_3[_i];
                    // Administrator list changes must not prevent flights or flying-day records syncing.
                    if (item.recordType === "master" && !adminAccess)
                        return [3 /*break*/, 28];
                    _a.label = 10;
                case 10:
                    _a.trys.push([10, 26, , 28]);
                    if (!(item.recordType === "flight")) return [3 /*break*/, 13];
                    return [4 /*yield*/, syncFlightQueueItem(item)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, removeQueueItem(item.id)];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 25];
                case 13:
                    if (!(item.recordType === "dayField")) return [3 /*break*/, 18];
                    return [4 /*yield*/, syncDayFieldQueueItem(item)];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, get("syncQueue", item.id)];
                case 15:
                    latest = _a.sent();
                    if (!(!latest || latest.version === item.version)) return [3 /*break*/, 17];
                    return [4 /*yield*/, removeQueueItem(item.id)];
                case 16:
                    _a.sent();
                    _a.label = 17;
                case 17: return [3 /*break*/, 25];
                case 18:
                    if (!(item.recordType === "day")) return [3 /*break*/, 20];
                    // Legacy whole-day records can contain stale blank fields. Never replay them.
                    return [4 /*yield*/, removeQueueItem(item.id)];
                case 19:
                    // Legacy whole-day records can contain stale blank fields. Never replay them.
                    _a.sent();
                    return [3 /*break*/, 25];
                case 20:
                    if (!(item.recordType === "master")) return [3 /*break*/, 23];
                    return [4 /*yield*/, syncMasterQueueItem(item)];
                case 21:
                    _a.sent();
                    return [4 /*yield*/, removeQueueItem(item.id)];
                case 22:
                    _a.sent();
                    return [3 /*break*/, 25];
                case 23: 
                // Remove obsolete queue entries created by pre-1.2 versions.
                return [4 /*yield*/, removeQueueItem(item.id)];
                case 24:
                    // Remove obsolete queue entries created by pre-1.2 versions.
                    _a.sent();
                    return [3 /*break*/, 28];
                case 25: return [3 /*break*/, 28];
                case 26:
                    error_2 = _a.sent();
                    item.attempts = (item.attempts || 0) + 1;
                    item.lastError = error_2.message;
                    return [4 /*yield*/, put("syncQueue", item)];
                case 27:
                    _a.sent();
                    lastSyncError = String(error_2.message || "UNKNOWN ERROR").toUpperCase().slice(0, 45);
                    console.error("Sync item failed:", item, error_2);
                    return [3 /*break*/, 28];
                case 28:
                    _i++;
                    return [3 /*break*/, 9];
                case 29: return [3 /*break*/, 32];
                case 30:
                    syncBusy = false;
                    return [4 /*yield*/, updatePendingCount()];
                case 31:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 32: return [2 /*return*/];
            }
        });
    });
}
function applyRemoteFlight(row) {
    return __awaiter(this, void 0, void 0, function () {
        var local, pendingQueueItem, localPending, remoteTime, localTime, remoteMatchesLocal, synced;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get("flights", row.id)];
                case 1:
                    local = _a.sent();
                    return [4 /*yield*/, get("syncQueue", "flight:".concat(row.id))];
                case 2:
                    pendingQueueItem = _a.sent();
                    localPending = (local === null || local === void 0 ? void 0 : local.syncStatus) === "pending" || Boolean(pendingQueueItem);
                    if (!localPending) return [3 /*break*/, 7];
                    remoteTime = new Date(row.modified_at || 0).getTime();
                    localTime = new Date((local === null || local === void 0 ? void 0 : local.pendingModifiedAt) || (local === null || local === void 0 ? void 0 : local.modifiedAt) || 0).getTime();
                    remoteMatchesLocal = row.status === (local === null || local === void 0 ? void 0 : local.status) &&
                        (row.landing || "") === ((local === null || local === void 0 ? void 0 : local.landing) || "") &&
                        Number(row.duration || 0) === Number((local === null || local === void 0 ? void 0 : local.duration) || 0);
                    if (!(remoteMatchesLocal && remoteTime >= localTime)) return [3 /*break*/, 6];
                    synced = localFlightFromRemote(row);
                    synced.syncStatus = "synced";
                    synced.pendingModifiedAt = null;
                    return [4 /*yield*/, put("flights", synced)];
                case 3:
                    _a.sent();
                    if (!pendingQueueItem) return [3 /*break*/, 5];
                    return [4 /*yield*/, removeQueueItem(pendingQueueItem.id)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
                case 6:
                    if ((local === null || local === void 0 ? void 0 : local.status) === "completed" && row.status === "airborne") {
                        return [2 /*return*/];
                    }
                    if (remoteTime <= localTime || !remoteMatchesLocal) {
                        return [2 /*return*/];
                    }
                    _a.label = 7;
                case 7: return [4 /*yield*/, put("flights", localFlightFromRemote(row))];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function reconcileFlightsForDate(date) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, cloudRows, cloudIds, _i, cloudRows_1, row, localRows, _b, localRows_1, local, pending, repairedLocal, cloudById, mismatches, _c, repairedLocal_1, local, remote, pending;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, operatorSupabase
                        .from("flights")
                        .select("*")
                        .eq("date", date)];
                case 1:
                    _a = _d.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    cloudRows = data || [];
                    cloudIds = new Set(cloudRows.map(function (row) { return row.id; }));
                    _i = 0, cloudRows_1 = cloudRows;
                    _d.label = 2;
                case 2:
                    if (!(_i < cloudRows_1.length)) return [3 /*break*/, 5];
                    row = cloudRows_1[_i];
                    return [4 /*yield*/, applyRemoteFlight(row)];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, getFlightsByDate(date)];
                case 6:
                    localRows = _d.sent();
                    _b = 0, localRows_1 = localRows;
                    _d.label = 7;
                case 7:
                    if (!(_b < localRows_1.length)) return [3 /*break*/, 11];
                    local = localRows_1[_b];
                    return [4 /*yield*/, get("syncQueue", "flight:".concat(local.id))];
                case 8:
                    pending = _d.sent();
                    if (!(!cloudIds.has(local.id) && !pending && local.syncStatus !== "pending")) return [3 /*break*/, 10];
                    return [4 /*yield*/, removeFlight(local.id)];
                case 9:
                    _d.sent();
                    _d.label = 10;
                case 10:
                    _b++;
                    return [3 /*break*/, 7];
                case 11: return [4 /*yield*/, getFlightsByDate(date)];
                case 12:
                    repairedLocal = _d.sent();
                    cloudById = new Map(cloudRows.map(function (row) { return [row.id, row]; }));
                    mismatches = 0;
                    _c = 0, repairedLocal_1 = repairedLocal;
                    _d.label = 13;
                case 13:
                    if (!(_c < repairedLocal_1.length)) return [3 /*break*/, 16];
                    local = repairedLocal_1[_c];
                    remote = cloudById.get(local.id);
                    return [4 /*yield*/, get("syncQueue", "flight:".concat(local.id))];
                case 14:
                    pending = _d.sent();
                    if (pending)
                        return [3 /*break*/, 15];
                    if (!remote) {
                        mismatches++;
                        return [3 /*break*/, 15];
                    }
                    if ((local.status || "") !== (remote.status || "") ||
                        (local.takeoff || "") !== (remote.takeoff || "") ||
                        (local.landing || "") !== (remote.landing || ""))
                        mismatches++;
                    _d.label = 15;
                case 15:
                    _c++;
                    return [3 /*break*/, 13];
                case 16:
                    lastVerification = {
                        date: date,
                        cloudCount: cloudRows.length,
                        localCount: repairedLocal.length,
                        cloudAirborne: cloudRows.filter(function (r) { return r.status === "airborne"; }).length,
                        localAirborne: repairedLocal.filter(function (r) { return r.status === "airborne"; }).length,
                        mismatches: mismatches,
                        checkedAt: new Date()
                    };
                    updateSyncVerificationDisplay();
                    return [2 /*return*/, lastVerification];
            }
        });
    });
}
function updateSyncVerificationDisplay() {
    var el = document.getElementById("syncVerificationText");
    if (!el)
        return;
    if (!lastVerification) {
        el.textContent = "Waiting for full check…";
        return;
    }
    var v = lastVerification;
    var ok = v.cloudCount === v.localCount && v.cloudAirborne === v.localAirborne && v.mismatches === 0;
    var time = v.checkedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    el.innerHTML = "<strong>".concat(ok ? "ONLINE · VERIFIED" : "DATA MISMATCH", "</strong><br>") +
        "Cloud ".concat(v.cloudCount, " flights \u00B7 Device ").concat(v.localCount, " flights \u00B7 ") +
        "Airborne ".concat(v.localAirborne, "<br>Last full check ").concat(time);
    el.className = "sync-verification-text ".concat(ok ? "verified" : "mismatch");
}
function pullFlights() {
    return __awaiter(this, void 0, void 0, function () {
        var cutoff, cutoffDate, _a, data, error, _i, _b, row;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - 31);
                    cutoffDate = cutoff.toISOString().slice(0, 10);
                    return [4 /*yield*/, operatorSupabase
                            .from("flights")
                            .select("*")
                            .gte("date", cutoffDate)];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    _i = 0, _b = data || [];
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 5];
                    row = _b[_i];
                    return [4 /*yield*/, applyRemoteFlight(row)];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function readFlyingDayValueRows() {
    return __awaiter(this, void 0, void 0, function () {
        var cutoff, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - 31);
                    return [4 /*yield*/, operatorSupabase
                            .from("flying_day_values")
                            .select("*")
                            .gte("date", cutoff.toISOString().slice(0, 10))];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data || []];
            }
        });
    });
}
function forcePullFlyingDays() {
    return __awaiter(this, void 0, void 0, function () {
        var rows, grouped, _i, rows_1, row, _a, _b, _c, date, fields, local, _d, _e, fieldName;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, readFlyingDayValueRows()];
                case 1:
                    rows = _g.sent();
                    grouped = {};
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        if (!grouped[row.date])
                            grouped[row.date] = {};
                        grouped[row.date][row.field_name] = row;
                    }
                    _a = 0, _b = Object.entries(grouped);
                    _g.label = 2;
                case 2:
                    if (!(_a < _b.length)) return [3 /*break*/, 6];
                    _c = _b[_a], date = _c[0], fields = _c[1];
                    return [4 /*yield*/, get("days", date)];
                case 3:
                    local = (_g.sent()) || {
                        date: date,
                        day: new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase(),
                        runway: "",
                        windDirection: "",
                        windSpeed: ""
                    };
                    for (_d = 0, _e = ["day", "runway", "windDirection", "windSpeed"]; _d < _e.length; _d++) {
                        fieldName = _e[_d];
                        if (fields[fieldName])
                            local[fieldName] = (_f = fields[fieldName].value) !== null && _f !== void 0 ? _f : "";
                    }
                    local.modifiedAt = new Date().toISOString();
                    return [4 /*yield*/, put("days", local)];
                case 4:
                    _g.sent();
                    _g.label = 5;
                case 5:
                    _a++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function pullFlyingDays() {
    return __awaiter(this, void 0, void 0, function () {
        var rows, grouped, _i, rows_2, row, _a, _b, _c, date, fields, local, pending, _d, _e, fieldName;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, readFlyingDayValueRows()];
                case 1:
                    rows = _g.sent();
                    grouped = {};
                    for (_i = 0, rows_2 = rows; _i < rows_2.length; _i++) {
                        row = rows_2[_i];
                        if (!grouped[row.date])
                            grouped[row.date] = {};
                        grouped[row.date][row.field_name] = row;
                    }
                    _a = 0, _b = Object.entries(grouped);
                    _g.label = 2;
                case 2:
                    if (!(_a < _b.length)) return [3 /*break*/, 7];
                    _c = _b[_a], date = _c[0], fields = _c[1];
                    return [4 /*yield*/, get("days", date)];
                case 3:
                    local = (_g.sent()) || {
                        date: date,
                        day: new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase(),
                        runway: "",
                        windDirection: "",
                        windSpeed: ""
                    };
                    return [4 /*yield*/, pendingDayFields(date)];
                case 4:
                    pending = _g.sent();
                    for (_d = 0, _e = ["day", "runway", "windDirection", "windSpeed"]; _d < _e.length; _d++) {
                        fieldName = _e[_d];
                        if (fields[fieldName] &&
                            !Object.prototype.hasOwnProperty.call(pending, fieldName)) {
                            local[fieldName] = (_f = fields[fieldName].value) !== null && _f !== void 0 ? _f : "";
                        }
                    }
                    local.modifiedAt = new Date().toISOString();
                    return [4 /*yield*/, put("days", local)];
                case 5:
                    _g.sent();
                    _g.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function fetchLegacyMasterListsDirect() {
    return operatorSupabase.auth.getSession().then(function (sessionResult) {
        var session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
        if (!session || !session.access_token) {
            throw new Error("MASTER LIST READ: NO ACTIVE SESSION");
        }

        var config = window.OPERATIONSLOGS_SUPABASE || {};
        var url = String(config.url || "").replace(/\/+$/, "") +
            "/rest/v1/master_lists?select=list_key%2Cvalue&active=eq.true";

        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();

            try {
                request.open("GET", url, true);
            } catch (error) {
                reject(new Error("MASTER LIST REQUEST OPEN FAILED: " + String(error)));
                return;
            }

            try {
                request.setRequestHeader("apikey", config.publishableKey || "");
                request.setRequestHeader("Authorization", "Bearer " + session.access_token);
                request.setRequestHeader("Accept", "application/json");
                request.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
                request.setRequestHeader("Pragma", "no-cache");
            } catch (headerError) {
                // Older Safari may reject an optional header; authentication headers above
                // are attempted first and the request can still proceed.
            }

            request.timeout = 20000;

            request.onreadystatechange = function () {
                if (request.readyState !== 4) return;

                if (request.status >= 200 && request.status < 300) {
                    try {
                        resolve(request.responseText ? JSON.parse(request.responseText) : []);
                    } catch (parseError) {
                        reject(new Error("MASTER LIST RESPONSE COULD NOT BE READ"));
                    }
                    return;
                }

                reject(new Error(
                    "MASTER LIST HTTP " + request.status + ": " +
                    String(request.responseText || "").slice(0, 160)
                ));
            };

            request.onerror = function () {
                reject(new Error("MASTER LIST NETWORK ERROR"));
            };

            request.ontimeout = function () {
                reject(new Error("MASTER LIST REQUEST TIMED OUT"));
            };

            try {
                request.send(null);
            } catch (sendError) {
                reject(new Error("MASTER LIST REQUEST FAILED: " + String(sendError)));
            }
        });
    });
}

function pullMasterLists() {
    return __awaiter(this, arguments, void 0, function (client) {
        var data, grouped, i, key, r, row, saved;
        if (client === void 0) { client = operatorSupabase; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Administrators may still use the normal client path. Operators on
                    // iOS 10 use a direct authenticated REST read for maximum compatibility.
                    if (!(client !== operatorSupabase)) return [3 /*break*/, 2];
                    return [4 /*yield*/, client
                            .from("master_lists")
                            .select("list_key,value")
                            .eq("active", true)];
                case 1:
                    saved = _a.sent();
                    if (saved.error) throw saved.error;
                    data = saved.data || [];
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, fetchLegacyMasterListsDirect()];
                case 3:
                    data = _a.sent();
                    _a.label = 4;
                case 4:
                    grouped = {};
                    for (i = 0; i < MASTER_LIST_KEYS.length; i++) {
                        grouped[MASTER_LIST_KEYS[i]] = [];
                    }

                    for (r = 0; r < (data || []).length; r++) {
                        row = data[r];
                        if (row && grouped[row.list_key]) {
                            grouped[row.list_key].push(row.value);
                        }
                    }

                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < MASTER_LIST_KEYS.length)) return [3 /*break*/, 8];
                    key = MASTER_LIST_KEYS[i];

                    // Never erase a working local list because the cloud list is empty.
                    if (!grouped[key] || !grouped[key].length) return [3 /*break*/, 7];

                    DATA[key] = cleanMasterValues(grouped[key]);
                    return [4 /*yield*/, put("masterLists", {
                            key: key,
                            values: DATA[key],
                            modifiedAt: new Date().toISOString()
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8:
                    // Crucial on the Legacy build: refresh the actual HTML datalists
                    // immediately after the cloud values have been saved.
                    refreshMasterDatalists();

                    if (document.getElementById("adminView") &&
                        document.getElementById("adminView").classList.contains("active")) {
                        renderAdminList();
                    }

                    return [2 /*return*/];
            }
        });
    });
}

function pullCloudData() {
    return __awaiter(this, void 0, void 0, function () {
        var selectedDate;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) || !navigator.onLine)
                        return [2 /*return*/];
                    return [4 /*yield*/, Promise.all([pullFlights(), pullFlyingDays(), pullMasterLists()])];
                case 1:
                    _c.sent();
                    selectedDate = (_a = document.getElementById("flyingDate")) === null || _a === void 0 ? void 0 : _a.value;
                    if (!selectedDate) return [3 /*break*/, 3];
                    return [4 /*yield*/, reconcileFlightsForDate(selectedDate)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    lastCloudPullAt = Date.now();
                    return [4 /*yield*/, updateDashboard()];
                case 4:
                    _c.sent();
                    if (!((_b = document.getElementById("reviewView")) === null || _b === void 0 ? void 0 : _b.classList.contains("active"))) return [3 /*break*/, 6];
                    return [4 /*yield*/, reviewFlights()];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function reconcileCloudState() {
    return __awaiter(this, arguments, void 0, function (reason) {
        var verified, error_3;
        if (reason === void 0) { reason = "periodic"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) || !navigator.onLine || syncBusy)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, processSyncQueue()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, pullCloudData()];
                case 3:
                    _a.sent();
                    verified = lastVerification &&
                        lastVerification.cloudCount === lastVerification.localCount &&
                        lastVerification.cloudAirborne === lastVerification.localAirborne &&
                        lastVerification.mismatches === 0;
                    setSyncStatus(verified ? "ONLINE · VERIFIED" : "ONLINE · CHECKING", verified ? "online" : "pending");
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error("Cloud reconciliation failed (".concat(reason, "):"), error_3);
                    setSyncStatus("SYNC PROBLEM · RETRYING", "error");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function startCloudReconciliation() {
    if (reconciliationTimer)
        clearInterval(reconciliationTimer);
    reconciliationTimer = setInterval(function () { return reconcileCloudState("scheduled"); }, 30000);
}
function restartRealtimeSubscription() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!operatorSupabase || !(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved))
                        return [2 /*return*/];
                    if (!realtimeChannel) return [3 /*break*/, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, operatorSupabase.removeChannel(realtimeChannel)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    realtimeChannel = null;
                    _b.label = 5;
                case 5:
                    subscribeRealtime();
                    return [2 /*return*/];
            }
        });
    });
}
function subscribeRealtime() {
    var _this = this;
    if (!(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved) || realtimeChannel)
        return;
    realtimeChannel = operatorSupabase
        .channel("operationslogs-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "flights" }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(payload.eventType === "DELETE")) return [3 /*break*/, 2];
                    return [4 /*yield*/, remove("flights", payload.old.id)];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, applyRemoteFlight(payload.new)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [4 /*yield*/, updateDashboard()];
                case 5:
                    _b.sent();
                    if (!((_a = document.getElementById("reviewView")) === null || _a === void 0 ? void 0 : _a.classList.contains("active"))) return [3 /*break*/, 7];
                    return [4 /*yield*/, reviewFlights()];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); })
        .on("postgres_changes", { event: "*", schema: "public", table: "master_lists" }, function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pullMasterLists()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); })
        .on("postgres_changes", { event: "*", schema: "public", table: "flying_day_values" }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
        var row, pending, local;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(payload.eventType !== "DELETE" && payload.new)) return [3 /*break*/, 5];
                    row = payload.new;
                    return [4 /*yield*/, pendingDayFields(row.date)];
                case 1:
                    pending = _d.sent();
                    if (!!Object.prototype.hasOwnProperty.call(pending, row.field_name)) return [3 /*break*/, 4];
                    return [4 /*yield*/, get("days", row.date)];
                case 2:
                    local = (_d.sent()) || {
                        date: row.date,
                        day: new Date(row.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase(),
                        runway: "",
                        windDirection: "",
                        windSpeed: ""
                    };
                    local[row.field_name] = (_a = row.value) !== null && _a !== void 0 ? _a : "";
                    local.modifiedAt = row.modified_at;
                    return [4 /*yield*/, put("days", local)];
                case 3:
                    _d.sent();
                    if (((_b = document.getElementById("flyingDate")) === null || _b === void 0 ? void 0 : _b.value) === row.date &&
                        typeof setFlyingDayControl === "function") {
                        setFlyingDayControl(row.field_name, (_c = row.value) !== null && _c !== void 0 ? _c : "");
                    }
                    _d.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, pullFlyingDays()];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "devices" }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(((_a = payload.new) === null || _a === void 0 ? void 0 : _a.auth_user_id) === (operatorUser === null || operatorUser === void 0 ? void 0 : operatorUser.id))) return [3 /*break*/, 2];
                    return [4 /*yield*/, refreshCurrentDeviceStatus()];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); })
        .subscribe(function (status) {
        if (status === "SUBSCRIBED") {
            setSyncStatus("ONLINE · SYNCED", "online");
        }
        else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
            setSyncStatus("REALTIME INTERRUPTED · RECONNECTING", "pending");
            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, restartRealtimeSubscription()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, reconcileCloudState("realtime reconnect")];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }, 3000);
        }
    });
}
function initializeCloudSync() {
    return __awaiter(this, void 0, void 0, function () {
        var flyingDayQueueWasCleaned, adminSession, adminRow, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!makeCloudClients()) {
                        setSyncStatus("LOCAL ONLY · CLOUD LIBRARY MISSING", "error");
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 14, , 15]);
                    setSyncStatus("CONNECTING…", "pending");
                    return [4 /*yield*/, ensureOperatorSession()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, ensureDeviceRegistration()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, cleanupLegacyFlyingDayQueue()];
                case 4:
                    flyingDayQueueWasCleaned = _b.sent();
                    startApprovalWatcher();
                    return [4 /*yield*/, refreshCurrentDeviceStatus()];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, adminSupabase.auth.getSession()];
                case 6:
                    adminSession = (_b.sent()).data;
                    if (!((_a = adminSession.session) === null || _a === void 0 ? void 0 : _a.user)) return [3 /*break*/, 8];
                    adminUser = adminSession.session.user;
                    return [4 /*yield*/, adminSupabase
                            .from("admin_users")
                            .select("user_id")
                            .eq("user_id", adminUser.id)
                            .maybeSingle()];
                case 7:
                    adminRow = (_b.sent()).data;
                    adminAccess = Boolean(adminRow);
                    _b.label = 8;
                case 8:
                    if (!(currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved)) {
                        setSyncStatus("DEVICE WAITING FOR ADMIN APPROVAL", "pending");
                        return [2 /*return*/];
                    }
                    if (!flyingDayQueueWasCleaned) return [3 /*break*/, 10];
                    return [4 /*yield*/, forcePullFlyingDays()];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [4 /*yield*/, pullCloudData()];
                case 11:
                    _b.sent();
                    // Legacy-only safeguard: populate operator lists once more after the
                    // initial cloud pull so old Safari definitely has live datalist options.
                    return [4 /*yield*/, pullMasterLists()];
                case 12:
                    _b.sent();
                    return [4 /*yield*/, processSyncQueue()];
                case 13:
                    _b.sent();
                    subscribeRealtime();
                    startCloudReconciliation();
                    setSyncStatus("ONLINE · SYNCED", "online");
                    return [3 /*break*/, 15];
                case 14:
                    error_4 = _b.sent();
                    console.error("Cloud startup failed:", error_4);
                    setSyncStatus(navigator.onLine ? "CLOUD SETUP REQUIRED" : "OFFLINE · LOCAL SAVE", "error");
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
function requestAdminAccess() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(adminAccess && adminUser)) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadAdminDevices()];
                case 1:
                    _a.sent();
                    openAdministration("names");
                    return [2 /*return*/];
                case 2:
                    document.getElementById("adminLoginMessage").textContent = "";
                    document.getElementById("adminLoginDialog").hidden = false;
                    document.getElementById("adminEmail").focus();
                    return [2 /*return*/];
            }
        });
    });
}
function adminSignIn() {
    return __awaiter(this, void 0, void 0, function () {
        var email, password, message, _a, data, error, user, _b, row, roleError;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    email = document.getElementById("adminEmail").value.trim();
                    password = document.getElementById("adminPassword").value;
                    message = document.getElementById("adminLoginMessage");
                    message.textContent = "SIGNING IN…";
                    return [4 /*yield*/, adminSupabase.auth.signInWithPassword({ email: email, password: password })];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        message.textContent = error.message.toUpperCase();
                        return [2 /*return*/];
                    }
                    user = data.user;
                    return [4 /*yield*/, adminSupabase
                            .from("admin_users")
                            .select("user_id")
                            .eq("user_id", user.id)
                            .maybeSingle()];
                case 2:
                    _b = _c.sent(), row = _b.data, roleError = _b.error;
                    if (!(roleError || !row)) return [3 /*break*/, 4];
                    return [4 /*yield*/, adminSupabase.auth.signOut()];
                case 3:
                    _c.sent();
                    message.textContent = "THIS ACCOUNT IS NOT AN OPERATIONSLOGS ADMINISTRATOR.";
                    return [2 /*return*/];
                case 4:
                    adminUser = user;
                    adminAccess = true;
                    document.getElementById("adminLoginDialog").hidden = true;
                    document.getElementById("adminPassword").value = "";
                    document.getElementById("adminIdentity").textContent = email.toUpperCase();
                    return [4 /*yield*/, pullMasterLists(adminSupabase)];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, loadAdminDevices()];
                case 6:
                    _c.sent();
                    openAdministration("names");
                    return [2 /*return*/];
            }
        });
    });
}
function adminSignOut() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, adminSupabase.auth.signOut()];
                case 1:
                    _a.sent();
                    adminUser = null;
                    adminAccess = false;
                    document.getElementById("adminIdentity").textContent = "NOT SIGNED IN";
                    showView("homeView");
                    return [2 /*return*/];
            }
        });
    });
}
function loadAdminDevices() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, container;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!adminAccess)
                        return [2 /*return*/];
                    return [4 /*yield*/, adminSupabase
                            .from("devices")
                            .select("*")
                            .order("name")];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    container = document.getElementById("adminDeviceList");
                    if (error) {
                        container.innerHTML = "<p class=\"form-message\">".concat(excelXmlEscape(error.message), "</p>");
                        return [2 /*return*/];
                    }
                    container.innerHTML = (data || []).map(function (device) { return "\n    <div class=\"admin-list-row\">\n      <span>\n        ".concat(excelXmlEscape(device.name), "\n        <small>").concat(device.approved ? "APPROVED" : "WAITING APPROVAL", "</small>\n      </span>\n      <div class=\"admin-row-actions\">\n        <button type=\"button\" class=\"").concat(device.approved ? "delete-btn" : "edit-btn", "\"\n          data-device-toggle=\"").concat(device.id, "\" data-device-approved=\"").concat(device.approved, "\">\n          ").concat(device.approved ? "DISABLE" : "APPROVE", "\n        </button>\n      </div>\n    </div>\n  "); }).join("") || '<p class="muted">No registered devices.</p>';
                    return [2 /*return*/];
            }
        });
    });
}
function toggleDeviceApproval(id, currentlyApproved) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!adminAccess)
                        return [2 /*return*/];
                    return [4 /*yield*/, adminSupabase
                            .from("devices")
                            .update({
                            approved: !currentlyApproved,
                            active: !currentlyApproved,
                            approved_by: adminUser.id,
                            approved_at: !currentlyApproved ? new Date().toISOString() : null,
                            updated_at: new Date().toISOString()
                        })
                            .eq("id", id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        alert(error.message);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, loadAdminDevices()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, refreshCurrentDeviceStatus()];
                case 3:
                    _a.sent();
                    if (!((currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.id) === id)) return [3 /*break*/, 6];
                    currentDevice.approved = !currentlyApproved;
                    if (!currentDevice.approved) return [3 /*break*/, 6];
                    return [4 /*yield*/, pullCloudData()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, processSyncQueue()];
                case 5:
                    _a.sent();
                    subscribeRealtime();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function syncMasterList(key) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queueSyncRecord("master", key, "replace")];
                case 1:
                    _a.sent();
                    if (!(adminAccess && (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.approved))) return [3 /*break*/, 3];
                    return [4 /*yield*/, processSyncQueue()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible")
        reconcileCloudState("visibility");
});
window.addEventListener("focus", function () { return reconcileCloudState("focus"); });
window.addEventListener("online", function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, restartRealtimeSubscription()];
            case 1:
                _a.sent();
                return [4 /*yield*/, reconcileCloudState("online")];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
