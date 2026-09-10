"use strict";
exports.__esModule = true;
require("../www/store");
describe('Store.obfuscateUsername', function () {
    afterEach(function () {
        CdvPurchase.store.obfuscator = undefined;
        CdvPurchase.store._legacyObfuscatorNoticeEmitted = false;
    });
    test('default (legacy) + GOOGLE_PLAY returns raw MD5 hash', function () {
        CdvPurchase.store.obfuscator = undefined;
        var result = CdvPurchase.store.obfuscateUsername('hello', CdvPurchase.Platform.GOOGLE_PLAY);
        // MD5 of "hello" is 5d41402abc4b2a76b9719d911017c592 (32 hex chars, no dashes)
        expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
        expect(result).toHaveLength(32);
    });
    test('default (legacy) + APPLE_APPSTORE returns UUIDv3 format', function () {
        CdvPurchase.store.obfuscator = undefined;
        var result = CdvPurchase.store.obfuscateUsername('hello', CdvPurchase.Platform.APPLE_APPSTORE);
        expect(result).toBe('5d41402a-bc4b-3a76-8971-9d911017c592');
        expect(result).toHaveLength(36);
    });
    test('legacy + GOOGLE_PLAY returns raw MD5 hash', function () {
        CdvPurchase.store.obfuscator = 'legacy';
        var result = CdvPurchase.store.obfuscateUsername('hello', CdvPurchase.Platform.GOOGLE_PLAY);
        expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    test('legacy + APPLE_APPSTORE returns UUIDv3 format', function () {
        CdvPurchase.store.obfuscator = 'legacy';
        var result = CdvPurchase.store.obfuscateUsername('hello', CdvPurchase.Platform.APPLE_APPSTORE);
        expect(result).toBe('5d41402a-bc4b-3a76-8971-9d911017c592');
    });
    test('uuid + any platform returns UUIDv3 format', function () {
        CdvPurchase.store.obfuscator = 'uuid';
        var google = CdvPurchase.store.obfuscateUsername('hello', CdvPurchase.Platform.GOOGLE_PLAY);
        var apple = CdvPurchase.store.obfuscateUsername('hello', CdvPurchase.Platform.APPLE_APPSTORE);
        expect(google).toBe('5d41402a-bc4b-3a76-8971-9d911017c592');
        expect(apple).toBe('5d41402a-bc4b-3a76-8971-9d911017c592');
    });
    test('disabled + any platform returns raw value', function () {
        CdvPurchase.store.obfuscator = 'disabled';
        expect(CdvPurchase.store.obfuscateUsername('user123', CdvPurchase.Platform.GOOGLE_PLAY)).toBe('user123');
        expect(CdvPurchase.store.obfuscateUsername('user123', CdvPurchase.Platform.APPLE_APPSTORE)).toBe('user123');
    });
    test('custom function receives username and platform', function () {
        CdvPurchase.store.obfuscator = function (username, platform) {
            return "custom-".concat(platform, "-").concat(username);
        };
        expect(CdvPurchase.store.obfuscateUsername('alice', CdvPurchase.Platform.GOOGLE_PLAY)).toBe('custom-android-playstore-alice');
    });
    test('returns undefined for empty input', function () {
        CdvPurchase.store.obfuscator = 'legacy';
        expect(CdvPurchase.store.obfuscateUsername('', CdvPurchase.Platform.GOOGLE_PLAY)).toBeUndefined();
    });
    test('returns undefined for undefined obfuscator input', function () {
        CdvPurchase.store.obfuscator = 'legacy';
        expect(CdvPurchase.store.obfuscateUsername(undefined, CdvPurchase.Platform.GOOGLE_PLAY)).toBeUndefined();
    });
    test('legacy is deterministic', function () {
        CdvPurchase.store.obfuscator = 'legacy';
        expect(CdvPurchase.store.obfuscateUsername('user1', CdvPurchase.Platform.GOOGLE_PLAY))
            .toBe(CdvPurchase.store.obfuscateUsername('user1', CdvPurchase.Platform.GOOGLE_PLAY));
    });
    test('legacy emits info notice once', function () {
        var previousVerbosity = CdvPurchase.store.verbosity;
        CdvPurchase.store.verbosity = CdvPurchase.LogLevel.INFO;
        var logSpy = jest.spyOn(CdvPurchase.Logger.console, 'log').mockImplementation(function () { });
        CdvPurchase.store.obfuscator = 'legacy';
        CdvPurchase.store.obfuscateUsername('test1', CdvPurchase.Platform.GOOGLE_PLAY);
        CdvPurchase.store.obfuscateUsername('test2', CdvPurchase.Platform.GOOGLE_PLAY);
        var noticeCalls = logSpy.mock.calls.filter(function (args) {
            return args.some(function (a) { return typeof a === 'string' && a.includes('store.obfuscator defaults to "legacy"'); });
        });
        expect(noticeCalls).toHaveLength(1);
        logSpy.mockRestore();
        CdvPurchase.store.verbosity = previousVerbosity;
    });
});
