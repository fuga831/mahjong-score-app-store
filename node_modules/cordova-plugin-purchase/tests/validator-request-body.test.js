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
// These tests capture the request body that Validator.runValidatorRequest
// sends to ajax. They exercise the obfuscatedUsername wiring without
// touching a real native bridge.
function makeLogger() {
    var noop = function () { };
    return {
        verbosity: CdvPurchase.LogLevel.QUIET,
        error: noop,
        warn: noop,
        info: noop,
        debug: noop,
        child: function () { return makeLogger(); },
        logger: { log: noop }
    };
}
function makeAdapter(platform) {
    var _this = this;
    return {
        id: platform,
        name: "adapter-".concat(platform),
        ready: true,
        products: [],
        receipts: [],
        isSupported: true,
        receiptValidationBody: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        id: 'com.test.product',
                        type: CdvPurchase.ProductType.CONSUMABLE,
                        transaction: { type: 'test', id: 't1' }
                    })];
            });
        }); },
        handleReceiptValidationResponse: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); }
    };
}
function makeReceipt(platform) {
    var _this = this;
    return new CdvPurchase.Receipt(platform, {
        verify: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
        finish: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); }
    });
}
function captureRequestBody(platform, store) {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, verifiedCallbacks, unverifiedCallbacks, controller, capturedBody, originalAjax, validator, i, i;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = makeAdapter(platform);
                    verifiedCallbacks = new CdvPurchase.Internal.Callbacks(makeLogger(), 'verified');
                    unverifiedCallbacks = new CdvPurchase.Internal.Callbacks(makeLogger(), 'unverified');
                    controller = {
                        validator: 'https://example.test/validate',
                        localReceipts: [],
                        adapters: { find: function () { return adapter; } },
                        validator_privacy_policy: undefined,
                        getApplicationUsername: function () { return store.getApplicationUsername(); },
                        obfuscateUsername: function (u, p) { return store.obfuscateUsername(u, p); },
                        verifiedCallbacks: verifiedCallbacks,
                        unverifiedCallbacks: unverifiedCallbacks,
                        finish: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); }
                    };
                    capturedBody = undefined;
                    originalAjax = CdvPurchase.Utils.ajax;
                    CdvPurchase.Utils.ajax = function (_log, opts) {
                        capturedBody = opts.data;
                        // Respond with a minimal valid success payload so the pipeline settles.
                        setTimeout(function () { return opts.success({
                            ok: true,
                            data: { id: 'com.test.product', transaction: { type: 'test' } }
                        }); }, 0);
                        return { done: function () { } };
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 11, 12]);
                    validator = new CdvPurchase.Internal.Validator(controller, makeLogger());
                    validator.add(makeReceipt(platform));
                    validator.run();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < 10)) return [3 /*break*/, 5];
                    return [4 /*yield*/, Promise.resolve()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 50); })];
                case 6:
                    _a.sent();
                    i = 0;
                    _a.label = 7;
                case 7:
                    if (!(i < 10)) return [3 /*break*/, 10];
                    return [4 /*yield*/, Promise.resolve()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/, 7];
                case 10: return [3 /*break*/, 12];
                case 11:
                    CdvPurchase.Utils.ajax = originalAjax;
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/, capturedBody];
            }
        });
    });
}
describe('Validator request body — obfuscatedUsername wiring', function () {
    afterEach(function () {
        CdvPurchase.store.obfuscator = undefined;
        CdvPurchase.store.applicationUsername = undefined;
        CdvPurchase.store._legacyObfuscatorNoticeEmitted = false;
    });
    test('omits obfuscatedUsername when applicationUsername is unset', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    CdvPurchase.store.applicationUsername = undefined;
                    return [4 /*yield*/, captureRequestBody(CdvPurchase.Platform.GOOGLE_PLAY, CdvPurchase.store)];
                case 1:
                    body = _c.sent();
                    expect((_a = body.additionalData) === null || _a === void 0 ? void 0 : _a.applicationUsername).toBeUndefined();
                    expect((_b = body.additionalData) === null || _b === void 0 ? void 0 : _b.obfuscatedUsername).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    test('includes both raw and obfuscated username on GOOGLE_PLAY with legacy obfuscator', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CdvPurchase.store.applicationUsername = 'hello';
                    CdvPurchase.store.obfuscator = 'legacy';
                    return [4 /*yield*/, captureRequestBody(CdvPurchase.Platform.GOOGLE_PLAY, CdvPurchase.store)];
                case 1:
                    body = _a.sent();
                    expect(body.additionalData.applicationUsername).toBe('hello');
                    expect(body.additionalData.obfuscatedUsername).toBe('5d41402abc4b2a76b9719d911017c592');
                    return [2 /*return*/];
            }
        });
    }); });
    test('uuid obfuscator sends UUIDv3 format', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CdvPurchase.store.applicationUsername = 'hello';
                    CdvPurchase.store.obfuscator = 'uuid';
                    return [4 /*yield*/, captureRequestBody(CdvPurchase.Platform.APPLE_APPSTORE, CdvPurchase.store)];
                case 1:
                    body = _a.sent();
                    expect(body.additionalData.applicationUsername).toBe('hello');
                    expect(body.additionalData.obfuscatedUsername).toBe('5d41402a-bc4b-3a76-8971-9d911017c592');
                    return [2 /*return*/];
            }
        });
    }); });
    test('disabled obfuscator sends raw value as obfuscatedUsername', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CdvPurchase.store.applicationUsername = 'hello';
                    CdvPurchase.store.obfuscator = 'disabled';
                    return [4 /*yield*/, captureRequestBody(CdvPurchase.Platform.GOOGLE_PLAY, CdvPurchase.store)];
                case 1:
                    body = _a.sent();
                    expect(body.additionalData.obfuscatedUsername).toBe('hello');
                    return [2 /*return*/];
            }
        });
    }); });
    test('custom obfuscator value reaches the validator body', function () { return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CdvPurchase.store.applicationUsername = 'alice';
                    CdvPurchase.store.obfuscator = function (u, p) { return "cf-".concat(p, "-").concat(u); };
                    return [4 /*yield*/, captureRequestBody(CdvPurchase.Platform.GOOGLE_PLAY, CdvPurchase.store)];
                case 1:
                    body = _a.sent();
                    expect(body.additionalData.obfuscatedUsername).toBe('cf-android-playstore-alice');
                    return [2 /*return*/];
            }
        });
    }); });
});
