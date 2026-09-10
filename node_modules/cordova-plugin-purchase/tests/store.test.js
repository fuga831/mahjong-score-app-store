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
describe('CDVPurchase', function () {
    test('should be defined', function () {
        expect(window).toBeDefined();
        expect(window.CdvPurchase).toBeDefined();
    });
    describe('Store', function () {
        test('should be defined', function () {
            expect(CdvPurchase.store).toBeDefined();
        });
    });
    describe('Test Platform', function () {
        describe('registerTestProduct', function () {
            // Clear custom test products before each test
            beforeEach(function () {
                // Reset the customTestProducts object
                Object.keys(CdvPurchase.Test.customTestProducts).forEach(function (key) {
                    delete CdvPurchase.Test.customTestProducts[key];
                });
            });
            test('should register a consumable product with minimal config', function () {
                var _a, _b, _c, _d;
                var productId = 'test-minimal-consumable';
                var product = CdvPurchase.Test.registerTestProduct({
                    id: productId,
                    type: CdvPurchase.ProductType.CONSUMABLE,
                    platform: CdvPurchase.Platform.TEST
                });
                // Verify the product was registered
                expect(CdvPurchase.Test.customTestProducts[productId]).toBeDefined();
                expect(product.id).toBe(productId);
                expect(product.type).toBe(CdvPurchase.ProductType.CONSUMABLE);
                // Verify metadata was created with default values
                expect(product.customMetadata).toBeDefined();
                expect((_a = product.customMetadata) === null || _a === void 0 ? void 0 : _a.title).toBe("Test ".concat(CdvPurchase.ProductType.CONSUMABLE));
                expect((_b = product.customMetadata) === null || _b === void 0 ? void 0 : _b.description).toBe("A test ".concat(CdvPurchase.ProductType.CONSUMABLE, " product"));
                expect((_c = product.customMetadata) === null || _c === void 0 ? void 0 : _c.offerId).toBe("".concat(productId, "-offer1"));
                expect((_d = product.customMetadata) === null || _d === void 0 ? void 0 : _d.pricing).toBeDefined();
            });
            test('should register a product with custom metadata', function () {
                var _a, _b, _c;
                var productId = 'test-custom-metadata';
                var customTitle = 'My Custom Product';
                var customDesc = 'This is a custom product description';
                var customPrice = '$5.99';
                var customCurrency = 'EUR';
                var customPriceMicros = 5990000;
                var product = CdvPurchase.Test.registerTestProduct({
                    id: productId,
                    type: CdvPurchase.ProductType.NON_CONSUMABLE,
                    platform: CdvPurchase.Platform.TEST,
                    title: customTitle,
                    description: customDesc,
                    pricing: {
                        price: customPrice,
                        currency: customCurrency,
                        priceMicros: customPriceMicros
                    }
                });
                // Verify custom metadata was set correctly
                expect((_a = product.customMetadata) === null || _a === void 0 ? void 0 : _a.title).toBe(customTitle);
                expect((_b = product.customMetadata) === null || _b === void 0 ? void 0 : _b.description).toBe(customDesc);
                expect((_c = product.customMetadata) === null || _c === void 0 ? void 0 : _c.pricing).toEqual({
                    price: customPrice,
                    currency: customCurrency,
                    priceMicros: customPriceMicros
                });
            });
            test('should register a subscription with custom pricing phases', function () {
                var _a, _b;
                var productId = 'test-subscription-phases';
                var pricingPhases = [
                    {
                        price: '$0.00',
                        currency: 'USD',
                        priceMicros: 0,
                        paymentMode: CdvPurchase.PaymentMode.FREE_TRIAL,
                        recurrenceMode: CdvPurchase.RecurrenceMode.FINITE_RECURRING,
                        billingCycles: 1,
                        billingPeriod: 'P1W'
                    },
                    {
                        price: '$9.99',
                        currency: 'USD',
                        priceMicros: 9990000,
                        paymentMode: CdvPurchase.PaymentMode.PAY_AS_YOU_GO,
                        recurrenceMode: CdvPurchase.RecurrenceMode.INFINITE_RECURRING,
                        billingPeriod: 'P1M'
                    }
                ];
                var product = CdvPurchase.Test.registerTestProduct({
                    id: productId,
                    type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
                    platform: CdvPurchase.Platform.TEST,
                    pricing: pricingPhases
                });
                // Verify pricing phases were set correctly
                expect(Array.isArray((_a = product.customMetadata) === null || _a === void 0 ? void 0 : _a.pricing)).toBe(true);
                expect((_b = product.customMetadata) === null || _b === void 0 ? void 0 : _b.pricing).toEqual(pricingPhases);
            });
            test('should throw error when required fields are missing', function () {
                // Missing ID
                expect(function () {
                    CdvPurchase.Test.registerTestProduct({
                        id: '',
                        type: CdvPurchase.ProductType.CONSUMABLE,
                        platform: CdvPurchase.Platform.TEST
                    });
                }).toThrow('Product ID is required');
                // Missing type
                expect(function () {
                    CdvPurchase.Test.registerTestProduct({
                        id: 'test-product',
                        platform: CdvPurchase.Platform.TEST,
                        type: undefined
                    });
                }).toThrow('Product type is required');
            });
            test('should verify TestProductMetadata structure', function () {
                var productId = 'test-metadata-structure';
                var product = CdvPurchase.Test.registerTestProduct({
                    id: productId,
                    type: CdvPurchase.ProductType.CONSUMABLE,
                    platform: CdvPurchase.Platform.TEST
                });
                // Check the structure of the TestProductMetadata interface
                var metadata = product.customMetadata;
                expect(metadata).toBeDefined();
                // Verify the required properties exist
                expect(metadata).toHaveProperty('title');
                expect(metadata).toHaveProperty('description');
                expect(metadata).toHaveProperty('offerId');
                expect(metadata).toHaveProperty('pricing');
                // Verify the types of the properties
                expect(typeof (metadata === null || metadata === void 0 ? void 0 : metadata.title)).toBe('string');
                expect(typeof (metadata === null || metadata === void 0 ? void 0 : metadata.description)).toBe('string');
                expect(typeof (metadata === null || metadata === void 0 ? void 0 : metadata.offerId)).toBe('string');
                // Pricing can be either an object or an array
                var pricing = metadata === null || metadata === void 0 ? void 0 : metadata.pricing;
                expect(pricing).toBeDefined();
                if (Array.isArray(pricing)) {
                    // If it's an array of PricingPhase objects
                    expect(pricing.length).toBeGreaterThan(0);
                }
                else {
                    // If it's a simple pricing object
                    expect(pricing).toHaveProperty('price');
                    expect(pricing).toHaveProperty('currency');
                    expect(pricing).toHaveProperty('priceMicros');
                }
            });
        });
    });
    describe('Integration Tests', function () {
        // Reset the store before each test
        beforeEach(function () {
            // Reset any initialized adapters
            if (CdvPurchase.store.getAdapter(CdvPurchase.Platform.TEST)) {
                // @ts-ignore - accessing private property for testing
                CdvPurchase.store.adapters = new CdvPurchase.Internal.Adapters();
                // @ts-ignore - reset the initialized flag
                CdvPurchase.store.initializedHasBeenCalled = false;
            }
            // @ts-ignore - reset the storefront cache so storefrontUpdated fires on every init
            CdvPurchase.store._storefronts = new CdvPurchase.Internal.Storefronts(CdvPurchase.store.log.child('Storefronts'));
        });
        test('should register and load custom test products using store.register', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productId, customTitle, customDesc, customPrice, customCurrency, customPriceMicros, errors, product, offer, pricingPhase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productId = 'custom-test-product';
                        customTitle = 'My Store Custom Product';
                        customDesc = 'A product registered through store.register';
                        customPrice = '$3.99';
                        customCurrency = 'USD';
                        customPriceMicros = 3990000;
                        // Register the custom test product using the public API
                        CdvPurchase.store.register({
                            id: productId,
                            type: CdvPurchase.ProductType.CONSUMABLE,
                            platform: CdvPurchase.Platform.TEST,
                            title: customTitle,
                            description: customDesc,
                            pricing: {
                                price: customPrice,
                                currency: customCurrency,
                                priceMicros: customPriceMicros
                            }
                        });
                        return [4 /*yield*/, CdvPurchase.store.initialize([CdvPurchase.Platform.TEST])];
                    case 1:
                        errors = _a.sent();
                        expect(errors.length).toBe(0);
                        // Wait for the store to be ready
                        return [4 /*yield*/, new Promise(function (resolve) {
                                CdvPurchase.store.ready(function () { return resolve(); });
                            })];
                    case 2:
                        // Wait for the store to be ready
                        _a.sent();
                        product = CdvPurchase.store.get(productId, CdvPurchase.Platform.TEST);
                        // Verify the product is available and has the correct properties
                        expect(product).toBeDefined();
                        expect(product === null || product === void 0 ? void 0 : product.id).toBe(productId);
                        expect(product === null || product === void 0 ? void 0 : product.type).toBe(CdvPurchase.ProductType.CONSUMABLE);
                        expect(product === null || product === void 0 ? void 0 : product.title).toBe(customTitle);
                        expect(product === null || product === void 0 ? void 0 : product.description).toBe(customDesc);
                        // Verify the product has offers
                        expect(product === null || product === void 0 ? void 0 : product.offers.length).toBeGreaterThan(0);
                        offer = product === null || product === void 0 ? void 0 : product.offers[0];
                        expect(offer).toBeDefined();
                        expect(offer === null || offer === void 0 ? void 0 : offer.pricingPhases.length).toBeGreaterThan(0);
                        pricingPhase = offer === null || offer === void 0 ? void 0 : offer.pricingPhases[0];
                        expect(pricingPhase).toBeDefined();
                        expect(pricingPhase === null || pricingPhase === void 0 ? void 0 : pricingPhase.price).toBe(customPrice);
                        expect(pricingPhase === null || pricingPhase === void 0 ? void 0 : pricingPhase.priceMicros).toBe(customPriceMicros);
                        expect(pricingPhase === null || pricingPhase === void 0 ? void 0 : pricingPhase.currency).toBe(customCurrency);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should register and load a subscription with custom pricing phases', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productId, pricingPhases, errors, product, offer, trialPhase, regularPhase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productId = 'custom-test-subscription';
                        pricingPhases = [
                            {
                                price: '$0.00',
                                currency: 'USD',
                                priceMicros: 0,
                                paymentMode: CdvPurchase.PaymentMode.FREE_TRIAL,
                                recurrenceMode: CdvPurchase.RecurrenceMode.FINITE_RECURRING,
                                billingCycles: 1,
                                billingPeriod: 'P1W'
                            },
                            {
                                price: '$7.99',
                                currency: 'USD',
                                priceMicros: 7990000,
                                paymentMode: CdvPurchase.PaymentMode.PAY_AS_YOU_GO,
                                recurrenceMode: CdvPurchase.RecurrenceMode.INFINITE_RECURRING,
                                billingPeriod: 'P1M'
                            }
                        ];
                        // Register the subscription using the public API
                        CdvPurchase.store.register({
                            id: productId,
                            type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
                            platform: CdvPurchase.Platform.TEST,
                            title: 'Custom Subscription',
                            description: 'A subscription with trial period',
                            pricing: pricingPhases
                        });
                        return [4 /*yield*/, CdvPurchase.store.initialize([CdvPurchase.Platform.TEST])];
                    case 1:
                        errors = _a.sent();
                        expect(errors.length).toBe(0);
                        // Wait for the store to be ready
                        return [4 /*yield*/, new Promise(function (resolve) {
                                CdvPurchase.store.ready(function () { return resolve(); });
                            })];
                    case 2:
                        // Wait for the store to be ready
                        _a.sent();
                        product = CdvPurchase.store.get(productId, CdvPurchase.Platform.TEST);
                        // Verify the product is available
                        expect(product).toBeDefined();
                        expect(product === null || product === void 0 ? void 0 : product.id).toBe(productId);
                        expect(product === null || product === void 0 ? void 0 : product.type).toBe(CdvPurchase.ProductType.PAID_SUBSCRIPTION);
                        // Verify the product has offers
                        expect(product === null || product === void 0 ? void 0 : product.offers.length).toBeGreaterThan(0);
                        offer = product === null || product === void 0 ? void 0 : product.offers[0];
                        expect(offer === null || offer === void 0 ? void 0 : offer.pricingPhases.length).toBe(2);
                        trialPhase = offer === null || offer === void 0 ? void 0 : offer.pricingPhases[0];
                        expect(trialPhase === null || trialPhase === void 0 ? void 0 : trialPhase.price).toBe('$0.00');
                        expect(trialPhase === null || trialPhase === void 0 ? void 0 : trialPhase.priceMicros).toBe(0);
                        expect(trialPhase === null || trialPhase === void 0 ? void 0 : trialPhase.paymentMode).toBe(CdvPurchase.PaymentMode.FREE_TRIAL);
                        expect(trialPhase === null || trialPhase === void 0 ? void 0 : trialPhase.recurrenceMode).toBe(CdvPurchase.RecurrenceMode.FINITE_RECURRING);
                        expect(trialPhase === null || trialPhase === void 0 ? void 0 : trialPhase.billingCycles).toBe(1);
                        expect(trialPhase === null || trialPhase === void 0 ? void 0 : trialPhase.billingPeriod).toBe('P1W');
                        regularPhase = offer === null || offer === void 0 ? void 0 : offer.pricingPhases[1];
                        expect(regularPhase === null || regularPhase === void 0 ? void 0 : regularPhase.price).toBe('$7.99');
                        expect(regularPhase === null || regularPhase === void 0 ? void 0 : regularPhase.priceMicros).toBe(7990000);
                        expect(regularPhase === null || regularPhase === void 0 ? void 0 : regularPhase.paymentMode).toBe(CdvPurchase.PaymentMode.PAY_AS_YOU_GO);
                        expect(regularPhase === null || regularPhase === void 0 ? void 0 : regularPhase.recurrenceMode).toBe(CdvPurchase.RecurrenceMode.INFINITE_RECURRING);
                        expect(regularPhase === null || regularPhase === void 0 ? void 0 : regularPhase.billingPeriod).toBe('P1M');
                        return [2 /*return*/];
                }
            });
        }); });
        test('fires storefrontUpdated when the Test adapter is initialized', function () { return __awaiter(void 0, void 0, void 0, function () {
            var events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        events = [];
                        CdvPurchase.store.when().storefrontUpdated(function (s) { return events.push(s); }, 'integration-test');
                        CdvPurchase.store.register({
                            id: 'storefront-event-product',
                            type: CdvPurchase.ProductType.CONSUMABLE,
                            platform: CdvPurchase.Platform.TEST
                        });
                        return [4 /*yield*/, CdvPurchase.store.initialize([CdvPurchase.Platform.TEST])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                CdvPurchase.store.ready(function () { return resolve(); });
                            })];
                    case 2:
                        _a.sent();
                        // Flush setTimeout(0) callbacks queued by safeCall during init.
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                    case 3:
                        // Flush setTimeout(0) callbacks queued by safeCall during init.
                        _a.sent();
                        expect(events).toContainEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('should expose a synchronous getStorefront backed by the Test adapter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var errors, storefront, explicit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        CdvPurchase.store.register({
                            id: 'storefront-test-product',
                            type: CdvPurchase.ProductType.CONSUMABLE,
                            platform: CdvPurchase.Platform.TEST
                        });
                        return [4 /*yield*/, CdvPurchase.store.initialize([CdvPurchase.Platform.TEST])];
                    case 1:
                        errors = _a.sent();
                        expect(errors.length).toBe(0);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                CdvPurchase.store.ready(function () { return resolve(); });
                            })];
                    case 2:
                        _a.sent();
                        storefront = CdvPurchase.store.getStorefront();
                        expect(storefront).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        explicit = CdvPurchase.store.getStorefront(CdvPurchase.Platform.TEST);
                        expect(explicit).toEqual({
                            platform: CdvPurchase.Platform.TEST,
                            countryCode: 'US'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
