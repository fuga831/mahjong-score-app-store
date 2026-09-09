# cordova-plugin-purchase (Fovea) を Capacitor に組み込む際の注意

`mahjong-score.html` 内の `Native.initBilling / restorePurchases / purchasePremium / getPriceLabel` は、
`cordova-plugin-purchase` v13系の API 形状(`store.register` / `store.when().approved/.verified/.productUpdated` /
`product.getOffer().order()`)を前提に書かれています。**このサンドボックスには npm レジストリへの
アクセスも Android SDK も無いため、実際に `npm install` してビルド・実機/Playコンソールのテスト購入で
動作確認することができていません。** 以下は公式ドキュメント(https://purchase.cordova.fovea.cc/)を
参照して書いた「著者の知識に基づく最善の実装」であり、プラグインのバージョンによって細部のAPIが
変わっている可能性があります。ご自身の環境で `npm install` した後、必ず公式ドキュメントと
バージョン差分を確認してください。

## 導入手順の要点

1. `npm install cordova-plugin-purchase @capacitor-community/admob @capacitor/android @capacitor/core --save`
2. `npx cap add android` (このリポジトリの capacitor.config.json / www/ を使う)
3. `npx cap sync android` — package.json の dependencies にある Cordova/Capacitor プラグインを
   自動的に android プロジェクトへ反映します。
4. 商品ID: `mahjong-score.html` 内の `MONETIZATION_CONFIG.billingProductId` (現在
   `'remove_ads_unlock_history'`) と、Google Play Console で作成する
   「アプリ内アイテム(managed product / one-time product)」のプロダクトIDを
   **完全に一致させること**。

## Play Console 側でのライセンスキーについて

Cordova(config.xml方式)では `<preference name="BILLING_KEY" value="..." />` のような形で
Base64ライセンスキーを埋め込む方式が案内されていることがありますが、
cordova-plugin-purchase v13系はGoogle Play Billing Library v5+ (Billing Library 6/7系)を
使う設計に更新されており、**多くの最新バージョンではこの手動でのライセンスキー設定は不要です**
(Play Billing Library が自動的に署名検証を行うため)。バージョンによって扱いが異なるため、
`npm install` 時に入る実際のバージョンの CHANGELOG / README を確認してください。

## テスト時の注意

- Google Play Console で「ライセンステスター」に自分のGoogleアカウントを登録しないと、
  実際の課金は発生させずにテスト購入ができません(内部テストトラック配信 + ライセンステスター登録が必須)。
- アプリ内アイテムは、Play Console上で一度「有効」にしてから最低でも数時間〜半日ほど
  反映待ちが必要な場合があります(即座に反映されないことがある、と公式にも案内されています)。
- テスト中は `MONETIZATION_CONFIG.admobBannerUnitId` / `admobInterstitialUnitId` を
  Google公式のテスト広告ユニットID(例: バナー `ca-app-pub-3940256099942544/6300978111`、
  インタースティシャル `ca-app-pub-3940256099942544/1033173712`)に一時的に差し替えてから
  実機確認し、本番申請の直前に本番の広告ユニットIDへ戻すことを強く推奨します
  (本番IDのままテスト目的で広告を大量表示すると、AdMobアカウントがポリシー違反で
  停止されるリスクがあります)。
