# mahjong-score-app — Capacitorラップ版 スキャフォールド

このフォルダは、`mahjong-score.html`(点数計算＋得点記録票)を
**AdMob広告＋アプリ内課金＋マルチプレイヤー(フレンド・卓・成績共有)機能つきの
iOS/Androidアプリ**(iOS App Store配信優先)として配布するための
Capacitorプロジェクトの雛形です。

## ⚠️ 重要: このサンドボックスでできたこと／できなかったこと

作業環境(このClaudeが動いているサンドボックス)には、

- **npmレジストリ(registry.npmjs.org)への外部通信が組織のネットワーク許可設定でブロックされている**
  (`npm install` や `npx cap add android`/`npx cap add ios` がそもそも実行できない)
- **Android SDK・Xcode/iOS SDKが入っていない**(`sdkmanager`/`xcodebuild` 無し)
- **Firebase CLIでのログイン・実プロジェクトへのデプロイ・エミュレータでの検証もできない**

という制約があり、**実際に `npm install` → `npx cap add android`/`ios` →
Android Studio/Xcodeでビルド、Firebaseへのデプロイ、という一連の作業をこの場で
実行・検証することができませんでした。**

そのため、このフォルダの中身は次の2種類に分かれます:

| 検証状況 | 内容 |
|---|---|
| ✅ **完全に実装・Playwrightで自動テスト済み** | `www/index.html` 内のアプリ本体ロジック — 広告表示/非表示の切り替え、3対局までの無料枠、ペイウォールの表示条件、購入成功時の自動保存、購入復元ボタン、既存の無料Web版が一切影響を受けないこと、**および今回追加のマルチプレイヤー機能(ユーザーネーム設定、フレンド検索・追加・解除、同卓者指定、対局中のリアルタイム同期、対局終了時の自動配信ファンアウト、通知バナー、無料枠の個別カウント)** — は、`window.Capacitor` とHTTPベースの疑似Firestoreサーバーをモックした、2つの独立したブラウザコンテキスト(≒2台の端末)によるヘッドレスブラウザテストで動作確認済みです。 |
| ⚠️ **手書きの雛形・未検証**(ご自身の環境でビルド・デプロイ・実機確認が必要) | `package.json`, `capacitor.config.json`, `android-snippets/`・`ios-snippets/` 以下のネイティブ設定の追記メモ、`firebase/`(セキュリティルール・Cloud Functions)、`codemagic.yaml`(iOSの自動ビルド・署名・TestFlight配信)。これらは各公式ドキュメントに基づいて書いていますが、実際にコンパイル・デプロイ・実機確認はできていません。バージョンによって細部が変わる可能性があるので、必ず公式ドキュメントと突き合わせてください。 |

## セットアップ手順(お手元のPC・インターネット接続環境で)

```bash
# 1. このフォルダをお手元のPCにコピーし、その中で:
npm install

# 2. Androidプロジェクトを生成(初回のみ)
npx cap add android
# iOSも配信するなら(Macが必要):
npx cap add ios

# 3. AndroidManifest.xml / build.gradle に android-snippets/ の内容を、
#    Info.plist / entitlements / AppDelegate.swift に ios-snippets/ の内容を反映

# 4. www/ の内容をネイティブプロジェクトへ同期
npx cap sync

# 5. Android Studio / Xcodeで開いてビルド
npx cap open android
npx cap open ios
```

その後、`android-snippets/cordova-plugin-purchase-notes.md` を読んで、
Google Play Console側の商品ID登録・ライセンステスター登録を行ってください。
マルチプレイヤー機能(Firebase Auth/Firestore/Cloud Functions/プッシュ通知)の
セットアップは `MULTIPLAYER_SETUP.md` にまとめてあります。

iOSのビルド・署名・TestFlightへのアップロードをCodemagicで自動化したい場合は、
`codemagic.yaml` と `CODEMAGIC_SETUP.md` を参照してください
(Apple Developer Portal・App Store Connect側の一度きりの準備作業がいくつか
必要です)。

広告ユニットID・課金商品IDの差し替え箇所は、**`www/index.html` 内の
`MONETIZATION_CONFIG` オブジェクト1箇所にまとめてあります**(検索してすぐ見つかります):

```js
const MONETIZATION_CONFIG = {
  admobAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
  admobBannerUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/BANNERID',
  admobInterstitialUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIALID',
  billingProductId: 'remove_ads_unlock_history',
  fallbackPriceLabel: '¥400',
};
```

ここを本番のIDに差し替えたら、`www/index.html` を上書きして `npx cap sync android` を
再実行してください。

## Web版(GitHub Pages / 友人配布用PWA)との関係

`www/index.html` は `mahjong-app/index.html`(無料・広告なしのWeb/PWA配布版)と
**中身のアプリロジックは完全に同一**です。`Native.isNativeApp()` が
`window.Capacitor.isNativePlatform()` を見て「今Capacitorアプリの中で動いているか」を
判定しており、これが `false`(=普通のブラウザ/PWA)の場合は広告・課金・3対局制限の
コードは自動的にすべて無効化されます。そのためWeb版に何か手を加える必要は一切なく、
**Web版は今まで通りずっと無料・無制限のままです**(ご要望の「ストアアプリのみに適用」を
この1つの分岐で実現しています)。

今後 `mahjong-score.html`(元ファイル)に機能追加・修正をした場合は、
その最新版を `mahjong-app/index.html`(Web版)と `mahjong-capacitor/www/index.html`
(アプリ版)の両方に反映するのを忘れないようにしてください。
