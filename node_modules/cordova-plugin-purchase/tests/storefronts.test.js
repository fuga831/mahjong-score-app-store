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
function makeAdapter(id, getStorefrontImpl) {
    return {
        id: id,
        name: "adapter-".concat(id),
        ready: true,
        products: [],
        receipts: [],
        isSupported: true,
        getStorefront: getStorefrontImpl
    };
}
describe('Internal.Storefronts', function () {
    beforeEach(function () { jest.useFakeTimers(); });
    afterEach(function () { jest.useRealTimers(); });
    describe('refreshWith — happy path', function () {
        test('caches value returned by adapter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, adapter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, 'US'];
                        }); }); });
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        expect(store.getValueFor(CdvPurchase.Platform.TEST)).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('notifies listeners when a value is first cached', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, adapter, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, 'FR'];
                        }); }); });
                        events = [];
                        store.listen(function (s) { return events.push(s); }, 'test');
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        jest.runAllTimers();
                        expect(events).toEqual([{ platform: CdvPurchase.Platform.TEST, countryCode: 'FR' }]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('getValueFor with specified platform and nothing cached returns object with undefined countryCode', function () {
            var store = new CdvPurchase.Internal.Storefronts(makeLogger());
            expect(store.getValueFor(CdvPurchase.Platform.TEST)).toEqual({
                platform: CdvPurchase.Platform.TEST,
                countryCode: undefined
            });
        });
        test('getValueFor without argument returns undefined when nothing cached', function () {
            var store = new CdvPurchase.Internal.Storefronts(makeLogger());
            expect(store.getValueFor()).toBeUndefined();
        });
        test('getValueFor without argument returns first cached entry when something is cached', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, adapter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, 'US'];
                        }); }); });
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        expect(store.getValueFor()).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('change detection', function () {
        test('does not notify listeners when the refreshed value is the same as cached', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, adapter, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, 'US'];
                        }); }); });
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        jest.runAllTimers(); // flush the first event
                        events = [];
                        store.listen(function (s) { return events.push(s); }, 'test-change');
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 2:
                        _a.sent(); // same value — no event
                        jest.runAllTimers();
                        expect(events).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('notifies listeners when the refreshed value is different', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, country, adapter, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        country = 'US';
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, country];
                        }); }); });
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        jest.runAllTimers(); // flush the first event
                        events = [];
                        store.listen(function (s) { return events.push(s); }, 'test-change');
                        country = 'FR';
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 2:
                        _a.sent();
                        jest.runAllTimers();
                        expect(events).toEqual([{ platform: CdvPurchase.Platform.TEST, countryCode: 'FR' }]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('timeout', function () {
        beforeEach(function () { jest.useFakeTimers(); });
        afterEach(function () { jest.useRealTimers(); });
        test('rejects when adapter does not respond within timeoutMs', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, resolveAdapter, adapter, refresh;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return new Promise(function (r) { resolveAdapter = r; }); });
                        refresh = store.refreshWith(adapter, 100);
                        jest.advanceTimersByTime(100);
                        return [4 /*yield*/, expect(refresh).rejects.toThrow(/timeout/)];
                    case 1:
                        _a.sent();
                        // Cleanup
                        resolveAdapter('US');
                        return [4 /*yield*/, Promise.resolve()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, Promise.resolve()];
                    case 3:
                        _a.sent();
                        jest.runAllTimers();
                        return [2 /*return*/];
                }
            });
        }); });
        test('silently updates cache when adapter resolves after timeout', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, events, resolveAdapter, adapter, refresh;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        events = [];
                        store.listen(function (s) { return events.push(s); }, 'timeout-late');
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return new Promise(function (r) { resolveAdapter = r; }); });
                        refresh = store.refreshWith(adapter, 100)["catch"](function () { });
                        jest.advanceTimersByTime(100);
                        return [4 /*yield*/, refresh];
                    case 1:
                        _b.sent();
                        // Still nothing cached at this point.
                        expect((_a = store.getValueFor(CdvPurchase.Platform.TEST)) === null || _a === void 0 ? void 0 : _a.countryCode).toBeUndefined();
                        // Now the underlying fetch finishes. Cache should update silently.
                        resolveAdapter('US');
                        // Flush microtasks so the .then() chain runs
                        return [4 /*yield*/, Promise.resolve()];
                    case 2:
                        // Flush microtasks so the .then() chain runs
                        _b.sent();
                        return [4 /*yield*/, Promise.resolve()];
                    case 3:
                        _b.sent();
                        // Flush the setTimeout(0) from safeCall
                        jest.runAllTimers();
                        expect(store.getValueFor(CdvPurchase.Platform.TEST)).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        expect(events).toEqual([{ platform: CdvPurchase.Platform.TEST, countryCode: 'US' }]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('resolves normally when adapter responds within timeoutMs', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, adapter;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, 'US'];
                        }); }); });
                        return [4 /*yield*/, expect(store.refreshWith(adapter, 100)).resolves.toBeUndefined()];
                    case 1:
                        _b.sent();
                        jest.runAllTimers();
                        expect((_a = store.getValueFor(CdvPurchase.Platform.TEST)) === null || _a === void 0 ? void 0 : _a.countryCode).toBe('US');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('failure modes', function () {
        beforeEach(function () { jest.useFakeTimers(); });
        afterEach(function () { jest.useRealTimers(); });
        test('does not overwrite cached value when adapter returns undefined', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, value, adapter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        value = 'US';
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, value];
                        }); }); });
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        jest.runAllTimers();
                        value = undefined;
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 2:
                        _a.sent();
                        jest.runAllTimers();
                        expect(store.getValueFor(CdvPurchase.Platform.TEST)).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('does not overwrite cached value when adapter throws', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, shouldThrow, adapter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        shouldThrow = false;
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (shouldThrow)
                                    throw new Error('native failure');
                                return [2 /*return*/, 'US'];
                            });
                        }); });
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        jest.runAllTimers();
                        shouldThrow = true;
                        return [4 /*yield*/, expect(store.refreshWith(adapter)).resolves.toBeUndefined()];
                    case 2:
                        _a.sent();
                        expect(store.getValueFor(CdvPurchase.Platform.TEST)).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('does nothing when adapter does not implement getStorefront', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, adapter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        adapter = makeAdapter(CdvPurchase.Platform.TEST);
                        return [4 /*yield*/, expect(store.refreshWith(adapter)).resolves.toBeUndefined()];
                    case 1:
                        _a.sent();
                        expect(store.getValueFor(CdvPurchase.Platform.TEST)).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: undefined
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('listener management', function () {
        beforeEach(function () { jest.useFakeTimers(); });
        afterEach(function () { jest.useRealTimers(); });
        test('off(cb) removes a previously registered listener', function () { return __awaiter(void 0, void 0, void 0, function () {
            var store, country, adapter, events, cb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new CdvPurchase.Internal.Storefronts(makeLogger());
                        country = 'US';
                        adapter = makeAdapter(CdvPurchase.Platform.TEST, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, country];
                        }); }); });
                        events = [];
                        cb = function (s) { return events.push(s); };
                        store.listen(cb, 'off-test');
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 1:
                        _a.sent();
                        jest.runAllTimers();
                        expect(events).toHaveLength(1);
                        store.off(cb);
                        country = 'FR';
                        return [4 /*yield*/, store.refreshWith(adapter)];
                    case 2:
                        _a.sent();
                        jest.runAllTimers();
                        expect(events).toHaveLength(1); // still just the first event
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
