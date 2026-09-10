"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
require("../www/store");
// Tests for Validator.Internal.getDeviceInfo: device information gathering
// from cordova-plugin-device (window.device) and @capacitor/device
// (window.Capacitor.Plugins.Device).
var defaultPolicyStore = { validator_privacy_policy: undefined }; // analytics, support, fraud
var trackingStore = { validator_privacy_policy: ['analytics', 'support', 'fraud', 'tracking'] };
function setCordovaDevice(device) {
    window.device = device;
}
function setCapacitorDevice(plugin) {
    window.Capacitor = { Plugins: { Device: plugin } };
}
function getDeviceInfo(store) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, CdvPurchase.Validator.Internal.getDeviceInfo(store)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
describe('Validator.Internal.getDeviceInfo', function () {
    afterEach(function () {
        delete window.device;
        delete window.Capacitor;
    });
    test('reports only the plugin version when no device plugin is installed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    info = _a.sent();
                    expect(info.plugin).toBe('cordova-plugin-purchase/' + CdvPurchase.PLUGIN_VERSION);
                    expect(info.model).toBeUndefined();
                    expect(info.platform).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    test('uses cordova-plugin-device data when window.device is present', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCordovaDevice({
                        cordova: '12.0.0',
                        model: 'Pixel 7',
                        platform: 'Android',
                        version: '14',
                        manufacturer: 'Google',
                        isVirtual: true
                    });
                    return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    info = _a.sent();
                    expect(info.cordova).toBe('12.0.0');
                    expect(info.model).toBe('Pixel 7');
                    expect(info.platform).toBe('Android');
                    expect(info.version).toBe('14');
                    expect(info.manufacturer).toBe('Google');
                    expect(info.isVirtual).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    test('falls back to @capacitor/device when window.device is absent', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCapacitorDevice({
                        getInfo: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        model: 'SM-A536B',
                                        operatingSystem: 'android',
                                        osVersion: '14',
                                        manufacturer: 'samsung',
                                        isVirtual: true,
                                        platform: 'android',
                                        webViewVersion: '124.0'
                                    })];
                            });
                        }); },
                        getId: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ identifier: 'cap-device-id' })];
                        }); }); }
                    });
                    return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    info = _a.sent();
                    expect(info.model).toBe('SM-A536B');
                    expect(info.platform).toBe('Android'); // normalized to cordova-plugin-device casing
                    expect(info.version).toBe('14');
                    expect(info.manufacturer).toBe('samsung');
                    expect(info.isVirtual).toBe(true);
                    expect(info.cordova).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    test('normalizes capacitor operatingSystem "ios" to "iOS"', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCapacitorDevice({
                        getInfo: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ model: 'iPhone15,2', operatingSystem: 'ios', osVersion: '17.4' })];
                        }); }); }
                    });
                    return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    info = _a.sent();
                    expect(info.platform).toBe('iOS');
                    expect(info.model).toBe('iPhone15,2');
                    expect(info.version).toBe('17.4');
                    return [2 /*return*/];
            }
        });
    }); });
    test('capacitor device id is used as uuid only with the tracking policy', function () { return __awaiter(void 0, void 0, void 0, function () {
        var noTracking, withTracking;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCapacitorDevice({
                        getInfo: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ model: 'Pixel 7', operatingSystem: 'android' })];
                        }); }); },
                        getId: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ identifier: 'cap-device-id' })];
                        }); }); }
                    });
                    return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    noTracking = _a.sent();
                    expect(noTracking.uuid).toBeUndefined();
                    return [4 /*yield*/, getDeviceInfo(trackingStore)];
                case 2:
                    withTracking = _a.sent();
                    expect(withTracking.uuid).toBe('cap-device-id');
                    return [2 /*return*/];
            }
        });
    }); });
    test('fraud fingerprint is computed from the capacitor device id without tracking policy', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCapacitorDevice({
                        getInfo: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ model: 'Pixel 7', operatingSystem: 'android' })];
                        }); }); },
                        getId: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ identifier: 'cap-device-id' })];
                        }); }); }
                    });
                    return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    info = _a.sent();
                    expect(info.uuid).toBeUndefined();
                    expect(info.fingerprint).toBe(CdvPurchase.Utils.md5('uuid:cap-device-id'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('window.device takes precedence over @capacitor/device', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCordovaDevice({ model: 'CordovaModel', platform: 'Android' });
                    setCapacitorDevice({
                        getInfo: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ model: 'CapacitorModel', operatingSystem: 'android' })];
                        }); }); }
                    });
                    return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    info = _a.sent();
                    expect(info.model).toBe('CordovaModel');
                    return [2 /*return*/];
            }
        });
    }); });
    test('survives a failing @capacitor/device plugin', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCapacitorDevice({
                        getInfo: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            throw new Error('boom');
                        }); }); },
                        getId: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            throw new Error('boom');
                        }); }); }
                    });
                    return [4 /*yield*/, getDeviceInfo(trackingStore)];
                case 1:
                    info = _a.sent();
                    expect(info.plugin).toBe('cordova-plugin-purchase/' + CdvPurchase.PLUGIN_VERSION);
                    expect(info.model).toBeUndefined();
                    expect(info.uuid).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    test('fallback fingerprint combines model and manufacturer', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCordovaDevice({ model: 'Pixel 7', manufacturer: 'Google' });
                    return [4 /*yield*/, getDeviceInfo(defaultPolicyStore)];
                case 1:
                    info = _a.sent();
                    expect(info.fingerprint).toBe(CdvPurchase.Utils.md5('/Pixel 7/Google'));
                    return [2 /*return*/];
            }
        });
    }); });
});
