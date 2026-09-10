"use strict";
exports.__esModule = true;
require("../www/store");
describe('CDVPurchase', function () {
    describe('Iaptic', function () {
        // Check that iaptic correctly parses the ineligible_for_intro_price array from validation response
        describe('appStoreDiscountEligibilityDeterminer', function () {
            var testReceipt = {
                className: 'VerifiedReceipt',
                validationDate: new Date(),
                set: function (receipt, response) { },
                platform: CdvPurchase.Platform.APPLE_APPSTORE,
                id: 'my-receipt',
                finish: function () { return new Promise(function (resolve) { }); },
                raw: {
                    id: '',
                    latest_receipt: true,
                    transaction: {},
                    ineligible_for_intro_price: ['not-eligible']
                },
                collection: [],
                sourceReceipt: {
                    className: 'Receipt',
                    platform: CdvPurchase.Platform.APPLE_APPSTORE,
                    transactions: [],
                    hasTransaction: function (x) { return false; },
                    lastTransaction: function () { return ({}); },
                    finish: function () { return new Promise(function (resolve) { }); },
                    verify: function () { return new Promise(function (resolve) { }); }
                },
                latestReceipt: true,
                nativeTransactions: []
            };
            var appReceipt = {
                appStoreReceipt: '',
                bundleIdentifier: '',
                bundleNumericVersion: 0,
                bundleShortVersion: '',
                bundleSignature: ''
            };
            var iaptic = new CdvPurchase.Iaptic({
                apiKey: '',
                appName: ''
            });
            CdvPurchase.store.validator = iaptic.validator;
            var determiner = iaptic.appStoreDiscountEligibilityDeterminer;
            if (determiner.cacheReceipt) {
                determiner.cacheReceipt(testReceipt);
            }
            // Product with ID 'eligible' is eligible.
            test('eligible to intro period', function (done) {
                determiner(appReceipt, [{
                        productId: 'eligible',
                        discountId: 'intro',
                        discountType: 'Introductory'
                    }], function (response) {
                    expect(response).toEqual([true]);
                    done();
                });
            });
            // Product with ID 'not-eligible' is not eligible.
            test('ineligible to intro period', function (done) {
                determiner(appReceipt, [{
                        productId: 'not-eligible',
                        discountId: 'intro',
                        discountType: 'Introductory'
                    }], function (response) {
                    expect(response).toEqual([false]);
                    done();
                });
            });
        });
    });
    describe('AppleAppStore', function () {
        describe('SKProduct.getOffer()', function () {
            var noOpDecorators = {
                canPurchase: function (product) { return true; },
                finish: function (receipt) { return new Promise(function (resolve) { return resolve(); }); },
                order: function (offer, additionalData) {
                    return new Promise(function (resolve) { return resolve(undefined); });
                },
                owned: function (product) { return false; },
                verify: function (receipt) { return new Promise(function (resolve) { return resolve(); }); }
            };
            var alwaysEligible = {
                isEligible: function () { return true; }
            };
            test('getOffer() returns the default offer when discount offers exist', function () {
                var validProduct = {
                    id: 'com.test.sub',
                    countryCode: 'US',
                    currency: 'USD',
                    description: 'Test subscription',
                    price: '$9.99',
                    priceMicros: 9990000,
                    title: 'Test Sub',
                    billingPeriod: 1,
                    billingPeriodUnit: 'Month',
                    discounts: [{
                            id: 'summer-sale',
                            type: 'Subscription',
                            price: '$4.99',
                            priceMicros: 4990000,
                            period: 1,
                            periodUnit: 'Month',
                            paymentMode: CdvPurchase.PaymentMode.PAY_AS_YOU_GO
                        }]
                };
                var product = new CdvPurchase.AppleAppStore.SKProduct(validProduct, { id: 'com.test.sub', platform: CdvPurchase.Platform.APPLE_APPSTORE, type: CdvPurchase.ProductType.PAID_SUBSCRIPTION }, noOpDecorators, alwaysEligible);
                // getOffer() with no args should return the default offer (id '$'), not the discount offer
                var defaultOffer = product.getOffer();
                expect(defaultOffer).toBeDefined();
                expect(defaultOffer.id).toBe('$');
                // The discount offer should still be accessible by id
                var discountOffer = product.getOffer('summer-sale');
                expect(discountOffer).toBeDefined();
                expect(discountOffer.id).toBe('summer-sale');
                // Default offer should be at index 0 of offers array
                expect(product.offers[0].id).toBe('$');
            });
            test('getOffer() returns default offer when product has no discounts', function () {
                var validProduct = {
                    id: 'com.test.sub2',
                    countryCode: 'US',
                    currency: 'USD',
                    description: 'Test subscription',
                    price: '$9.99',
                    priceMicros: 9990000,
                    title: 'Test Sub 2',
                    billingPeriod: 1,
                    billingPeriodUnit: 'Month'
                };
                var product = new CdvPurchase.AppleAppStore.SKProduct(validProduct, { id: 'com.test.sub2', platform: CdvPurchase.Platform.APPLE_APPSTORE, type: CdvPurchase.ProductType.PAID_SUBSCRIPTION }, noOpDecorators, alwaysEligible);
                var defaultOffer = product.getOffer();
                expect(defaultOffer).toBeDefined();
                expect(defaultOffer.id).toBe('$');
            });
        });
        // Test that the AppStore adapter uses the discountEligibilityDeterminer to remove unavailable discounts
        test('Filter out available products according to the appStoreDiscountEligibilityDeterminer', function (done) {
            var determinerRequests = [];
            var adapter = new CdvPurchase.AppleAppStore.Adapter({
                verbosity: CdvPurchase.LogLevel.WARNING,
                apiDecorators: {
                    canPurchase: function (product) { return true; },
                    finish: function (receipt) { return new Promise(function (resolve) { return resolve(); }); },
                    order: function (offer, additionalData) {
                        return new Promise(function (resolve) { return resolve(undefined); });
                    },
                    owned: function (product) { return false; },
                    verify: function (receipt) { return new Promise(function (resolve) { return resolve(); }); }
                },
                getApplicationUsername: function () { return 'user'; },
                obfuscateUsername: function (username, platform) { return username; },
                listener: {
                    productsUpdated: function (platform, products) { },
                    receiptsUpdated: function (platform, receipts) { },
                    receiptsReady: function (platform) { }
                },
                log: new CdvPurchase.Logger({
                    verbosity: CdvPurchase.LogLevel.WARNING
                }),
                error: function (error) { },
                registeredProducts: new CdvPurchase.Internal.RegisteredProducts(),
                storefronts: new CdvPurchase.Internal.Storefronts(new CdvPurchase.Logger({ verbosity: CdvPurchase.LogLevel.WARNING }))
            }, {
                discountEligibilityDeterminer: Object.assign(function (applicationReceipt, requests, callback) {
                    // console.log('Calling the determiner: ' + JSON.stringify(requests));
                    determinerRequests = requests;
                    callback(requests.map(function (r) { return r.productId === 'eligible'; }));
                }, {
                    cacheReceipt: function () { }
                })
            });
            adapter.bridge.init = function (options, success, error) {
                success();
            };
            adapter.bridge.canMakePayments = function (success, error) {
                success();
            };
            adapter.bridge.load = function (productIds, success, error) {
                success([{
                        id: 'eligible',
                        countryCode: 'US',
                        currency: 'USD',
                        description: 'A product eligible for intro price',
                        price: '$1.99',
                        priceMicros: 1990000,
                        title: 'Eligible',
                        billingPeriod: 1,
                        billingPeriodUnit: 'Month',
                        introPrice: '$0.00',
                        introPriceMicros: 0,
                        introPricePaymentMode: CdvPurchase.PaymentMode.FREE_TRIAL,
                        introPricePeriod: 1,
                        introPricePeriodUnit: 'Month'
                    }, {
                        id: 'not-eligible',
                        countryCode: 'US',
                        currency: 'USD',
                        description: 'A product not eligible for intro price',
                        price: '$1.99',
                        priceMicros: 1990000,
                        title: 'Not Eligible',
                        billingPeriod: 1,
                        billingPeriodUnit: 'Month',
                        introPrice: '$0.00',
                        introPriceMicros: 0,
                        introPricePaymentMode: CdvPurchase.PaymentMode.FREE_TRIAL,
                        introPricePeriod: 1,
                        introPricePeriodUnit: 'Month'
                    }], []);
            };
            adapter.bridge.appStoreReceipt = {
                appStoreReceipt: 'dummy',
                bundleIdentifier: '',
                bundleNumericVersion: 0,
                bundleShortVersion: '',
                bundleSignature: ''
            };
            adapter.initialize().then(function () {
                adapter.loadProducts([{
                        id: 'eligible',
                        platform: CdvPurchase.Platform.APPLE_APPSTORE,
                        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
                    }, {
                        id: 'not-eligible',
                        platform: CdvPurchase.Platform.APPLE_APPSTORE,
                        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
                    }])
                    .then(function (results) {
                    expect(determinerRequests).toEqual([{
                            productId: "eligible",
                            discountId: "intro",
                            discountType: "Introductory"
                        }, {
                            productId: "not-eligible",
                            discountId: "intro",
                            discountType: "Introductory"
                        }]);
                    expect(results.filter(function (p) { return 'id' in p && p.id === 'eligible'; })[0].offers[0].pricingPhases.length).toEqual(2);
                    expect(results.filter(function (p) { return 'id' in p && p.id === 'not-eligible'; })[0].offers[0].pricingPhases.length).toEqual(1);
                    done();
                });
            });
        });
    });
});
