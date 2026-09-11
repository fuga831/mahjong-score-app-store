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

## トラブルシューティング(初回ビルドで実際に発生した問題)

実際にこのプロジェクトの初回ビルドを通す過程で遭遇したエラーと解決策を、
発生したエラーメッセージ・症状ごとにまとめています。同じ症状に当たった場合は
まずここを確認してください。

### `No matching profiles found for bundle identifier "..." and distribution type "app_store"`

App Store Connect APIキーを「App Manager」ロールで発行していたことが原因でした。
「App Manager」では、証明書・プロビジョニングプロファイルの自動生成に必要な
権限が不足しています。「管理者(Admin)」ロールでキーを発行し直したところ、
このエラーは解消しました。

**教訓:** 自動署名(`app-store-connect fetch-signing-files --create` /
declarative `ios_signing`)に使うApp Store Connect APIキーは、必ず
**管理者(Admin)ロール**で発行すること。ロールはキーの発行後に変更できないため、
「App Manager」などで発行してしまった場合は、Team settings側の連携ごと
作り直すのではなく、新しいAPIキーを管理者ロールで発行し直し、
Codemagicの連携(準備4)を更新してください。

### `Cannot save Signing Certificates without certificate private key`

Admin権限のキーに直した後も、`codemagic.yaml` を宣言的な `ios_signing`
ブロックのまま使っている限りはこのエラーが解消しませんでした。

対応として、`ios_signing` ブロックを削除し、以下の明示的なスクリプト
ステップに置き換えました(現在の `codemagic.yaml` の構成):

1. `keychain initialize`(ビルド専用キーチェーンの初期化)
2. `app-store-connect fetch-signing-files "$BUNDLE_ID" --type IOS_APP_STORE --create`
3. `keychain add-certificates`
4. `xcode-project use-profiles`

これでエラーメッセージ自体は具体的になりましたが、それでも同じ
`Cannot save Signing Certificates without certificate private key` は
解消しませんでした。最終的な原因は、**証明書の秘密鍵をCodemagic側が
あらかじめ持っていなかったこと**でした。`--create` で証明書を新規作成する
場合、Appleは発行後に秘密鍵をダウンロードさせてくれない仕様のため、
CLIが事前にこの秘密鍵を持っていないと、証明書自体は作成できても
保存できずに失敗します。

**解決策:** 手元の環境(Mac/Xcodeが無くても、Windows上のNode.js/Git同梱の
ものでも可)で、証明書用のRSA秘密鍵を生成します。

```bash
ssh-keygen -t rsa -b 2048 -m PEM -f ./ios_distribution_private_key -q -N ""
```

生成された `ios_distribution_private_key`(`-----BEGIN RSA PRIVATE KEY-----`
〜 `-----END RSA PRIVATE KEY-----` を含む複数行のPEM形式)を、そのまま
Codemagicの環境変数のWeb入力欄に貼り付けると改行が失われて
`app-store-connect: error: argument --certificate-key: Not a valid
certificate private key` という別のエラーになることがあったため、
実際には一度base64エンコードして1行の文字列にしてから登録しています。

```bash
base64 -i ios_distribution_private_key | tr -d '\n'
```

この出力を、Codemagicの環境変数設定画面で変数名
`CERTIFICATE_PRIVATE_KEY_BASE64`、**Secure** にチェック、専用の
変数グループ(`ios_signing`)を指定して登録しました。`codemagic.yaml`
の「Fetch signing files from App Store Connect」ステップ内で、この
変数をビルド時にbase64デコードして `CERTIFICATE_PRIVATE_KEY` という
環境変数にセットし直しており、`app-store-connect` CLIはこの
`CERTIFICATE_PRIVATE_KEY` を自動的に読み込みます。

**教訓:** Mac/Xcodeが無い環境で証明書を新規作成する場合、Codemagic側に
秘密鍵の生成・保管を委ねる設定(環境変数経由)が必要になるケースがある。
この変数が実際にスクリプト内でどう参照されるか(変数名の対応関係、
base64エンコードの要否など)は、思い込みで進めずに `codemagic.yaml` の
該当ステップのコマンド内容を都度見て確認すること。

### Bundle IDの一致漏れ

開発の過程で、Bundle ID (`io.github.fuga831.mahjongscore`) を
下記の最低6箇所すべてで一致させる必要がありました。

1. `capacitor.config.json` の `appId`
2. `ios/App/App.xcodeproj/project.pbxproj` の `PRODUCT_BUNDLE_IDENTIFIER`
3. Firebaseの `GoogleService-Info.plist`
4. Apple Developer PortalのApp ID
5. App Store Connectのアプリレコード
6. `codemagic.yaml` の `vars.BUNDLE_ID`(旧: `ios_signing.bundle_identifier`)

実際に `codemagic.yaml` 側だけ古い `com.example.mahjongscore` のまま
残っていたことがあり、これが署名エラー(上記「No matching profiles」)の
一因になっていました。

**教訓:** Bundle IDを変更した際は、上記6箇所すべてを横断的に確認する
チェックリストとして扱うこと。1箇所だけ直し忘れると、他が正しくても
署名関連のエラーとして表面化する。

### Codemagicの連携(integration)名が一致しない

`codemagic.yaml` の `integrations.app_store_connect` に指定する値
(現在は `jan score`)は、Codemagicの「Team settings > Integrations >
Developer Portal」で実際に登録した連携の名前と**完全一致**している
必要があります。連携名は登録後に変更できないため、名前を変えたい場合は
連携を作り直すか、`codemagic.yaml` 側をその名前に合わせてください。

### `APP_STORE_APPLE_ID` がプレースホルダのまま

`APP_STORE_APPLE_ID` はBundle IDとは別の値で、App Store Connectで
アプリレコードを作成した後に発行される10桁程度の数字(例:
`6810488211`)です。「アプリ情報」ページで確認できます。プレースホルダ
(`0000000000`)のまま放置されていたことがあったので、`codemagic.yaml`
を編集する際は必ず実際の値に置き換えてください。

### GitHubへのアップロードでフォルダ構造が壊れる(Codemagic自体とは無関係)

ブラウザのドラッグ&ドロップ(Add file > Upload files)で複数フォルダ・
ファイルをまとめてアップロードすると、フォルダ構造が保持されず全て
直下に平坦化されてしまい、同名ファイルの重複も発生しました。

**解決策:** GitHub Desktopをインストールし、空リポジトリをローカルに
クローンした上で、Windowsのエクスプローラーで直接フォルダごとコピー
してからコミット・pushする方法に切り替えたところ、フォルダ構造が
正しく保持されました。

**教訓:** 複数階層のフォルダを含むプロジェクトをGitHubに初回pushする際は、
Web UIのドラッグ&ドロップではなくGitHub Desktop(またはgitコマンド)を
使うこと。

### 補足: Mac無しでのiOSビルドは技術的に成立する

`npx cap add ios`(iOSプロジェクトの雛形生成)はNode.jsのみで動作し、
Xcode/Macを必要としません。実機ビルド・署名・TestFlightアップロードは
CodemagicのようなクラウドCIサービスに委任することで、Mac/iPhoneを
一切所有せずに完結できます。実際に上記のトラブルシューティングを経て、
初回ビルドが成功しTestFlightへのアップロードまで確認できました。
