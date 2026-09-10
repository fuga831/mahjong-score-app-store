"use strict";
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
exports.__esModule = true;
require("../www/store");
var _a = CdvPurchase.AppleAppStore.Internal, collectEligibilityRequests = _a.collectEligibilityRequests, mergeNativeEligibility = _a.mergeNativeEligibility, DiscountEligibilities = _a.DiscountEligibilities;
/**
 * These tests exercise the pure helpers used by the Apple AppStore adapter's
 * `loadEligibility`. They cover the fix for #1694 — under StoreKit 2 the app
 * store receipt is always empty, so the adapter previously returned a blanket
 * "eligible" answer for every Introductory request. The native plugin now
 * surfaces `isEligibleForIntroOffer` on each product, and the adapter seeds
 * those into the eligibility response.
 */
describe('AppleAppStore eligibility (#1694)', function () {
    function product(over) {
        if (over === void 0) { over = {}; }
        return __assign({ id: 'sub.monthly', title: 'Monthly subscription', description: 'A monthly subscription', price: '$4.99', priceMicros: 4990000, currency: 'USD', countryCode: 'US', billingPeriod: 1, billingPeriodUnit: 'Month', introPrice: '$0.00', introPriceMicros: 0, introPricePeriod: 1, introPricePeriodUnit: 'Week', introPricePaymentMode: 'FreeTrial' }, over);
    }
    describe('collectEligibilityRequests', function () {
        test('adds the synthetic "intro" request when discounts is empty and introPrice is set', function () {
            var _a = collectEligibilityRequests([product()]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            expect(requests).toEqual([{
                    productId: 'sub.monthly',
                    discountId: 'intro',
                    discountType: 'Introductory'
                }]);
            expect(nativeAnswers).toEqual([undefined]);
        });
        test('passes native introPriceEligible=false through as the native answer', function () {
            var nativeAnswers = collectEligibilityRequests([product({ introPriceEligible: false })]).nativeAnswers;
            expect(nativeAnswers).toEqual([false]);
        });
        test('passes native introPriceEligible=true through as the native answer', function () {
            var nativeAnswers = collectEligibilityRequests([product({ introPriceEligible: true })]).nativeAnswers;
            expect(nativeAnswers).toEqual([true]);
        });
        test('only surfaces native answers for Introductory entries, never Subscription', function () {
            var p = product({
                introPriceEligible: false,
                discounts: [
                    { id: 'promo1', type: 'Subscription',
                        price: '$2.99', priceMicros: 2990000,
                        period: 1, periodUnit: 'Month',
                        paymentMode: 'PayAsYouGo' },
                ]
            });
            var _a = collectEligibilityRequests([p]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            expect(requests.length).toBe(1);
            expect(requests[0].discountType).toBe('Subscription');
            // Subscription offers must NOT inherit the intro-offer answer.
            expect(nativeAnswers).toEqual([undefined]);
        });
        test('produces no requests for a product without introPrice and without discounts', function () {
            var p = product({ introPrice: undefined, introPriceMicros: undefined });
            var _a = collectEligibilityRequests([p]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            expect(requests).toEqual([]);
            expect(nativeAnswers).toEqual([]);
        });
    });
    describe('mergeNativeEligibility', function () {
        test('native answer overrides determiner response', function () {
            var merged = mergeNativeEligibility([true, true], [false, undefined]);
            expect(merged).toEqual([false, true]);
        });
        test('all native = full override', function () {
            var merged = mergeNativeEligibility([true, true], [false, false]);
            expect(merged).toEqual([false, false]);
        });
        test('no native = determiner response passes through unchanged', function () {
            var merged = mergeNativeEligibility([true, false], [undefined, undefined]);
            expect(merged).toEqual([true, false]);
        });
    });
    describe('DiscountEligibilities — end-to-end shape', function () {
        test('SK2 + introPriceEligible=false → isEligible returns false', function () {
            var _a = collectEligibilityRequests([
                product({ introPriceEligible: false }),
            ]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            // All answers are native → fast path: hand nativeAnswers straight to the class.
            var elig = new DiscountEligibilities(requests, nativeAnswers);
            expect(elig.isEligible('sub.monthly', 'Introductory', 'intro')).toBe(false);
        });
        test('SK2 + introPriceEligible=true → isEligible returns true', function () {
            var _a = collectEligibilityRequests([
                product({ introPriceEligible: true }),
            ]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            var elig = new DiscountEligibilities(requests, nativeAnswers);
            expect(elig.isEligible('sub.monthly', 'Introductory', 'intro')).toBe(true);
        });
        test('Old native (no introPriceEligible field) → falls back to determiner=true', function () {
            var _a = collectEligibilityRequests([product()]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            // Determiner would default to true for Introductory in the "no receipt" branch.
            var determinerDefault = requests.map(function (r) { return r.discountType === 'Introductory'; });
            var merged = mergeNativeEligibility(determinerDefault, nativeAnswers);
            var elig = new DiscountEligibilities(requests, merged);
            expect(elig.isEligible('sub.monthly', 'Introductory', 'intro')).toBe(true);
        });
        test('SK1 regression: determiner says [false] and no native answer → false', function () {
            var _a = collectEligibilityRequests([product()]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            var determinerResponse = [false];
            var merged = mergeNativeEligibility(determinerResponse, nativeAnswers);
            var elig = new DiscountEligibilities(requests, merged);
            expect(elig.isEligible('sub.monthly', 'Introductory', 'intro')).toBe(false);
        });
        test('Native wins when native and determiner disagree (SK2 authoritative)', function () {
            // Determiner returns true (wrongly) because receipt is empty under SK2.
            // Native correctly says the user already redeemed the intro → ineligible.
            var _a = collectEligibilityRequests([
                product({ introPriceEligible: false }),
            ]), requests = _a.requests, nativeAnswers = _a.nativeAnswers;
            var determinerResponse = [true]; // incorrect SK2 receipt-based default
            var merged = mergeNativeEligibility(determinerResponse, nativeAnswers);
            var elig = new DiscountEligibilities(requests, merged);
            expect(elig.isEligible('sub.monthly', 'Introductory', 'intro')).toBe(false);
        });
    });
});
