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
/**
 * Unit tests for Internal.LocalReceipts.canPurchase — covers the fix for
 * issue #1705: canPurchase used to return true for transactions that were
 * approved-but-not-finished (and for transactions stuck in Google Play's
 * PENDING state), allowing users to start a second purchase while the
 * previous one was still in flight.
 */
describe('Internal.LocalReceipts.canPurchase (#1705)', function () {
    var LocalReceipts = CdvPurchase.Internal.LocalReceipts;
    var PLATFORM = CdvPurchase.Platform.TEST;
    var PRODUCT_ID = 'consumable.coins';
    function makeReceipt(tx) {
        var transaction = __assign({ products: [{ id: PRODUCT_ID }], platform: PLATFORM }, tx);
        return {
            platform: PLATFORM,
            transactions: [transaction]
        };
    }
    it('returns true when no receipt exists for the product', function () {
        expect(LocalReceipts.canPurchase([], { id: PRODUCT_ID, platform: PLATFORM })).toBe(true);
    });
    it('returns true after a consumable has been consumed (finished)', function () {
        var receipts = [makeReceipt({ isConsumed: true })];
        expect(LocalReceipts.canPurchase(receipts, { id: PRODUCT_ID, platform: PLATFORM })).toBe(true);
    });
    it('returns false when a transaction is approved but not finished', function () {
        var receipts = [makeReceipt({ isConsumed: false })];
        expect(LocalReceipts.canPurchase(receipts, { id: PRODUCT_ID, platform: PLATFORM })).toBe(false);
    });
    it('returns false when a Google Play transaction is still pending payment', function () {
        var receipts = [makeReceipt({ isPending: true })];
        expect(LocalReceipts.canPurchase(receipts, { id: PRODUCT_ID, platform: PLATFORM })).toBe(false);
    });
    it('returns false when a subscription is still active', function () {
        var future = new Date(Date.now() + 24 * 60 * 60 * 1000);
        var receipts = [makeReceipt({ expirationDate: future })];
        expect(LocalReceipts.canPurchase(receipts, { id: PRODUCT_ID, platform: PLATFORM })).toBe(false);
    });
    it('returns true when a subscription has expired', function () {
        var past = new Date(Date.now() - 24 * 60 * 60 * 1000);
        var receipts = [makeReceipt({ expirationDate: past })];
        expect(LocalReceipts.canPurchase(receipts, { id: PRODUCT_ID, platform: PLATFORM })).toBe(true);
    });
    it('returns false when no product is provided', function () {
        expect(LocalReceipts.canPurchase([], undefined)).toBe(false);
    });
});
