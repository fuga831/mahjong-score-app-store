# Codemagic導入ガイド(iOS自動ビルド・署名・TestFlight配信)

`codemagic.yaml` を実際に動かすために、Codemagic・Apple Developer Portal・
App Store Connect側でやっておく必要がある、一度きりの手作業をまとめたものです。
`codemagic.yaml` 側のコメントにも同じ内容を書いていますが、こちらはチェックリスト
形式でまとめています。

⚠️ このサンドボックスにはCodemagic/Apple Developer Portal/App Store Connectへの
アクセス環境がなく、以下の手順を実際に画面操作して検証したことはありません。
Codemagic公式ドキュメント(2026年9月時点)に基づく案内です。細部の画面名称等は
変更される可能性があるため、実際の画面表示に従ってください。

## 1. `ios/` ディレクトリをリポジトリにコミットする

Codemagicは `npx cap add ios` を代わりに実行してくれません。お手元のMacで:

```bash
npm install
npx cap add ios
```

を実行し、`ios-snippets/` 以下の差分(`Info.plist-additions.xml` /
`entitlements-additions.md` / `AppDelegate-additions.swift`)を生成された
`ios/App/App/` 以下に反映したうえで、`ios/` フォルダ一式をコミット・pushして
ください。`codemagic.yaml` はこの `ios/` が既に存在する前提で動きます。

## 2. Apple Developer PortalでCapabilityを先に有効化する

`ios-snippets/entitlements-additions.md` の手順どおり、このアプリのApp ID
(Bundle ID)に対して **Sign in with Apple** と **Push Notifications** の
2つのCapabilityを、Apple Developer Portal(またはXcodeの「+ Capability」)で
先に有効化しておいてください。Codemagicの自動署名は「有効化済みのCapabilityを
含むプロファイル」を取得・生成するだけなので、これが済んでいないと、
ビルドしたアプリでSign in with Apple・プッシュ通知が動きません。

## 3. App Store ConnectにこのアプリのApp レコードを作成する

TestFlightへのアップロード先として、App Store Connect上にこのアプリの
レコードを作成してください(Bundle IDは手順1・2と同じもの)。作成すると
数字のApple ID(例: 1234567890)が払い出されるので、`codemagic.yaml` の
`APP_STORE_APPLE_ID` をこの値に書き換えてください。

## 4. App Store Connect APIキーを発行し、CodemagicのTeam integrationに登録する

1. App Store Connect > ユーザーとアクセス > 統合 > App Store Connect API で、
   新しいAPIキーを発行(ロールは「App Manager」以上を推奨)。Issuer ID・Key ID・
   ダウンロードした `.p8` 秘密鍵の3点をメモ・保管してください
   (`.p8` は一度しかダウンロードできません)。
2. Codemagicのダッシュボード > Team settings > Integrations > Developer
   Portal で、上記3点を登録して連携を作成し、名前を付けます
   (`codemagic.yaml` は `jan score` という名前で登録済みの連携を
   想定しているので、別名にした場合は `integrations.app_store_connect`
   の値を合わせて書き換えてください)。

この連携1つで、「証明書・プロビジョニングプロファイルの自動取得・生成
(署名)」と「TestFlightへの自動アップロード」の両方が行えるようになります
(APIキーを2箇所に別々に登録する必要はありません)。

## 5. Bundle ID

`capacitor.config.json` の `appId`・`ios/App/App.xcodeproj/project.pbxproj` の
`PRODUCT_BUNDLE_IDENTIFIER`・`codemagic.yaml` の `ios_signing.bundle_identifier`
はいずれも `io.github.fuga831.mahjongscore` に統一済みです。手順2・3で
Apple Developer Portal / App Store Connectに登録するApp IDも、この値と
一致させてください。

## 6. (推奨・任意) GoogleService-Info.plist を暗号化環境変数で渡す

Firebaseコンソールからダウンロードした `GoogleService-Info.plist` を
リポジトリに直接コミットしても動作上は問題ありませんが、環境ごとに
切り替えたい場合などのために、Codemagic側で暗号化環境変数として渡す
こともできます:

```bash
base64 -i GoogleService-Info.plist | pbcopy
```

の出力を、Codemagicのプロジェクト設定 > Environment variables で、
変数名 `GOOGLE_SERVICE_INFO_PLIST_BASE64`、**Secure** にチェックを入れて
登録してください。`codemagic.yaml` はこの変数が未設定でも自動的に
このステップをスキップするので、直接コミットする方針でも問題ありません。

## 7. TestFlightのテスターグループ(任意)

App Store Connect側で作成済みのテスターグループへ自動的にビルドを
配信したい場合は、`codemagic.yaml` の `publishing.app_store_connect.beta_groups`
にグループ名を列挙してください。空のままでも、アップロード自体は行われ、
Codemagic連携アカウント(App Manager)からは内部テスターとして見えます。

## 8. 最初のビルドを走らせる

上記がすべて済んだら、`v1.0.0` のようなタグをpushするか
(`codemagic.yaml` は `v*.*.*` パターンのタグpushをトリガーに設定しています)、
Codemagicダッシュボードから「Start new build」で手動実行してください。

初回ビルドは、CocoaPodsのインストールやFirebase SDKのダウンロードを含むため
時間がかかることがあります。失敗した場合は、Codemagicのビルドログを
上から順に確認してください(証明書/プロファイル関連のエラーは、多くの場合
手順1〜5のいずれかが未完了であることが原因です)。
