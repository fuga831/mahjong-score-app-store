# Xcode Capabilities の追加

`npx cap add ios` 後、Xcodeで `ios/App/App.xcworkspace` を開き、
プロジェクトナビゲータで `App` ターゲットを選択 → 「Signing & Capabilities」タブ →
「+ Capability」から、以下の3つを追加してください。

## 1. Sign in with Apple

「+ Capability」→「Sign in with Apple」を追加するだけで、Xcodeが
自動的に `App.entitlements` に以下を追記します(手作業での編集は基本不要):

```xml
<key>com.apple.developer.applesignin</key>
<array>
  <string>Default</string>
</array>
```

Apple Developer Portal側での対応する設定は `apple-sign-in-notes.md` を参照。

## 2. Push Notifications

「+ Capability」→「Push Notifications」を追加。こちらも `App.entitlements` に
自動で以下が追記されます:

```xml
<key>aps-environment</key>
<string>development</string>
```

**重要**: `aps-environment` はXcodeが自動で `development` にします。App Store配信用の
Archiveビルドを作る際、Xcode/Apple側が自動的に `production` へ読み替えるため、通常は
手動変更不要です(明示的に書き換えたい場合のみ、リリースビルド設定で `production` に
すること)。

## 3. Background Modes → Remote notifications

「+ Capability」→「Background Modes」を追加し、一覧から
「Remote notifications」にチェックを入れる
(`Info.plist-additions.xml` の `UIBackgroundModes` と同じ内容が、
Xcodeの操作でも反映されます。plistを直接編集した場合はこの手順は不要)。

## Firebase Cloud Messaging 用の APNs 認証キー

上記3つはXcode/アプリ側の設定。これとは別に、Firebaseコンソール側にも
APNs認証キー(.p8ファイル)のアップロードが必要です。
これは `MULTIPLAYER_SETUP.md` にまとめて記載します(Apple Developer Portalで
「Keys」からAPNs用のキーを新規作成 → Firebaseコンソールの
プロジェクト設定 > Cloud Messaging > Apple アプリの設定 にアップロード)。
