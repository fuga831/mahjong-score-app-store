# Associated Domains(Universal Links)の設定

「ゲストプレイヤーへの結果受け取りリンク」機能(`https://fuga831.github.io/mahjong-score-app-store/claim?token=...`
をアプリが直接開けるようにする)のための設定。`ios/App/App/App.entitlements` には
既に以下が追記済みです:

```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:fuga831.github.io</string>
</array>
```

`npx cap add ios` で `ios/` を作り直した場合は、上記をXcodeの「Signing & Capabilities」→
「+ Capability」→「Associated Domains」から追加し直すか、`App.entitlements` に手動で
マージしてください。

## これだけでは動かない: Apple Developer Portal側の対応が別途必要

Capabilityをアプリ側(entitlements)に書くだけでは不十分です。以下がすべて揃って
初めてUniversal Linksが機能します。

1. **Apple Developer Portal**で、このアプリのApp ID(`io.github.fuga831.mahjongscore`)の
   Capability一覧に「Associated Domains」を有効化しておくこと
   (`codemagic.yaml`の準備2と同じ場所。Sign in with Apple・Push Notificationsと
   並べて有効化する)。

2. **apple-app-site-association(AASA)ファイルを、`fuga831.github.io`ドメインの
   ルート**に配置すること:
   - `https://fuga831.github.io/.well-known/apple-app-site-association`
   - (レガシー互換として `https://fuga831.github.io/apple-app-site-association` も可)

   ⚠️ **このリポジトリの `docs/` フォルダ(`fuga831.github.io/mahjong-score-app-store/`
   というパスで配信される「プロジェクトページ」)には置けません。** Universal Links の
   AASA はドメインの**ルート**からしか読まれない仕様のため、`fuga831.github.io` という
   名前の別リポジトリ(GitHubの「ユーザーページ」)側に配置する必要があります。
   AASAの中身(`paths`)は `/mahjong-score-app-store/claim*` に絞ってあるので、
   ドメインを共有する他のプロジェクトページには影響しません。

   配置するAASAの内容は `docs/apple-app-site-association.json`(このリポジトリに
   参考用として置いてあるもの。実際に配信されるパスではない点に注意)と同じ内容です。
   `appID`/`appIDs` は `<Team ID>.io.github.fuga831.mahjongscore` の形式です。

3. AASAファイルはHTTPS配信・リダイレクト無し・拡張子無しのプレーンJSONである必要が
   あります。GitHub Pagesはこの条件を満たします(Content-Typeがtext/plainでも
   iOSは中身がJSONとして解釈できれば許容します)。

4. 実機での検証には、Apple純正のAASA検証ツール
   (`https://search.developer.apple.com/appsearch-validation-tool/`、または
   `swcutil dl -d fuga831.github.io` をMac上のターミナルで実行)を使ってください。
   このサンドボックスには実機・Xcode・Mac自体が無いため、この設定は一度もXcode/実機で
   検証できていません。

## 動作の仕組み(ネイティブ側の追加コードは不要)

`ios/App/App/AppDelegate.swift` には、`npx cap add ios` が生成する標準の実装が
既に入っており、Universal Links経由の起動(`application(_:continue:restorationHandler:)`)を
`ApplicationDelegateProxy.shared.application(...)` へそのまま中継しています。これは
`@capacitor/app` プラグインが内部で listen している経路そのものなので、
`AppDelegate.swift` 側を追加で書き換える必要はありません。JS側では
`www/index.html` 内で `Capacitor.Plugins.App.addListener('appUrlOpen', ...)` を
登録し、URLの `?token=` を読み取ってアプリ内の受け取り確認モーダルを開きます
(起動処理のコメント参照)。
