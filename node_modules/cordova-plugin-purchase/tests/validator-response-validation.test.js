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
// These tests drive Validator end-to-end through runValidatorRequest with a
// stubbed Utils.ajax. They exercise the isValidatorResponsePayload guard via
// its only caller, so the helper can stay module-private.
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
function runValidator(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var platform, adapter, verifiedCallbacks, unverifiedCallbacks, verified, unverified, controller, originalAjax, validator, receipt, i, i;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    platform = CdvPurchase.Platform.GOOGLE_PLAY;
                    adapter = makeAdapter(platform);
                    verifiedCallbacks = new CdvPurchase.Internal.Callbacks(makeLogger(), 'verified');
                    unverifiedCallbacks = new CdvPurchase.Internal.Callbacks(makeLogger(), 'unverified');
                    verified = [];
                    unverified = [];
                    verifiedCallbacks.push(function (vr) { verified.push(vr); }, 'recorder');
                    unverifiedCallbacks.push(function (uv) { unverified.push(uv); }, 'recorder');
                    controller = {
                        validator: 'https://example.test/validate',
                        localReceipts: [],
                        adapters: { find: function () { return adapter; } },
                        validator_privacy_policy: undefined,
                        getApplicationUsername: function () { return undefined; },
                        obfuscateUsername: function (_applicationUsername, _platform) { return undefined; },
                        verifiedCallbacks: verifiedCallbacks,
                        unverifiedCallbacks: unverifiedCallbacks,
                        finish: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); }
                    };
                    originalAjax = CdvPurchase.Utils.ajax;
                    CdvPurchase.Utils.ajax = function (_log, opts) {
                        setTimeout(function () { return opts.success(payload); }, 0);
                        return { done: function () { } };
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 11, 12]);
                    validator = new CdvPurchase.Internal.Validator(controller, makeLogger());
                    receipt = makeReceipt(platform);
                    validator.add(receipt);
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
                case 12: return [2 /*return*/, { verified: verified, unverified: unverified }];
            }
        });
    });
}
describe('Validator integration — invalid responses trigger BAD_RESPONSE', function () {
    test.each([
        ['ok:true with no data', { ok: true }],
        ['ok:true with data missing id', { ok: true, data: { latest_receipt: true, transaction: {} } }],
        ['ok:true with data missing transaction', { ok: true, data: { id: 'x', latest_receipt: true } }],
        ['ok:true with non-string id', { ok: true, data: { id: 1, latest_receipt: true, transaction: {} } }],
        ['ok:true with non-object transaction', { ok: true, data: { id: 'x', latest_receipt: true, transaction: 'no' } }],
        ['null', null],
        ['undefined', undefined],
        ['string', 'oops'],
        ['object without ok', { data: {} }],
    ])('rejects %s as BAD_RESPONSE', function (_label, payload) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, verified, unverified, p;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, runValidator(payload)];
                case 1:
                    _a = _b.sent(), verified = _a.verified, unverified = _a.unverified;
                    expect(verified).toHaveLength(0);
                    expect(unverified).toHaveLength(1);
                    p = unverified[0].payload;
                    expect(p.ok).toBe(false);
                    expect(p.code).toBe(CdvPurchase.ErrorCode.BAD_RESPONSE);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Validator integration — valid success payloads', function () {
    test('well-formed success payload triggers verifiedCallbacks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, _a, verified, unverified;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    payload = {
                        ok: true,
                        data: {
                            id: 'com.test.product',
                            latest_receipt: true,
                            transaction: { type: 'android-playstore', purchaseToken: 'token' }
                        }
                    };
                    return [4 /*yield*/, runValidator(payload)];
                case 1:
                    _a = _b.sent(), verified = _a.verified, unverified = _a.unverified;
                    expect(unverified).toHaveLength(0);
                    expect(verified).toHaveLength(1);
                    expect(verified[0].id).toBe('com.test.product');
                    return [2 /*return*/];
            }
        });
    }); });
    test('success payload with optional collection field triggers verifiedCallbacks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, _a, verified, unverified;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    payload = {
                        ok: true,
                        data: {
                            id: 'com.test.product',
                            latest_receipt: true,
                            transaction: { type: 'test' },
                            collection: [{ id: 'com.test.product', transactionId: 'txn1' }]
                        }
                    };
                    return [4 /*yield*/, runValidator(payload)];
                case 1:
                    _a = _b.sent(), verified = _a.verified, unverified = _a.unverified;
                    expect(unverified).toHaveLength(0);
                    expect(verified).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); });
    // latest_receipt is documented as required in SuccessPayload, but in
    // practice it's only metadata stored on VerifiedReceipt.latestReceipt and
    // never branched on. Older validators may omit it; treat it as optional.
    test('success payload omitting latest_receipt is accepted', function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, _a, verified, unverified;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    payload = {
                        ok: true,
                        data: {
                            id: 'com.test.product',
                            transaction: { type: 'test' }
                        }
                    };
                    return [4 /*yield*/, runValidator(payload)];
                case 1:
                    _a = _b.sent(), verified = _a.verified, unverified = _a.unverified;
                    expect(unverified).toHaveLength(0);
                    expect(verified).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Validator integration — valid error payloads', function () {
    // Pin down that legitimate ok:false responses are NOT coerced to BAD_RESPONSE.
    test('ok:false without data passes through to unverifiedCallbacks with original code', function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, _a, verified, unverified, p;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    payload = {
                        ok: false,
                        code: CdvPurchase.ErrorCode.VERIFICATION_FAILED,
                        message: 'boom'
                    };
                    return [4 /*yield*/, runValidator(payload)];
                case 1:
                    _a = _b.sent(), verified = _a.verified, unverified = _a.unverified;
                    expect(verified).toHaveLength(0);
                    expect(unverified).toHaveLength(1);
                    p = unverified[0].payload;
                    expect(p.ok).toBe(false);
                    expect(p.code).toBe(CdvPurchase.ErrorCode.VERIFICATION_FAILED);
                    return [2 /*return*/];
            }
        });
    }); });
});
