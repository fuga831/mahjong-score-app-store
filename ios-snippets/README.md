# ios-snippets — iOS向けCapacitorスキャフォールドの差分メモ

⚠️ このサンドボックスには **Xcode・iOS SDK・CocoaPods・Apple Developerアカウントへの
アクセス** がなく、`npx cap add ios` 自体を実行できません(そもそもnpmレジストリにも
外部通信できません)。このフォルダの中身は「`npx cap add ios` を実行して生成される
`ios/App/` プロジェクトに、あとから手作業で足す差分」を示すメモです。
**実際にXcodeでビルド・実機/シミュレータ確認をしたことは一度もありません。**
Capacitor/Firebaseの公式ドキュメントと必ず突き合わせてから進めてください。

## セットアップ手順(お手元のMac + Xcodeで)

```bash
# 1. このフォルダ(mahjong-capacitor/)をお手元のMacにコピーし、
npm install

# 2. iOSプロジェクトを生成(初回のみ)
npx cap add ios

# 3. Firebaseコンソールで「iOSアプリを追加」し、GoogleService-Info.plist をダウンロード。
#    ios/App/App/ 直下(Info.plistと同じ階層)に配置する。
#    (Xcodeで ios/App/App.xcworkspace を開き、File > Add Files to "App" で追加し、
#     必ず Target "App" にチェックが入っていることを確認)

# 4. Info.plist-additions.xml / entitlements-additions.md / AppDelegate-additions.swift
#    の内容を、生成された ios/App/App/ 以下の対応ファイルに手作業でマージ

# 5. www/ の内容をネイティブプロジェクトへ同期
npx cap sync ios

# 6. Xcodeで開く
npx cap open ios
```

その後、`apple-sign-in-notes.md` を読んでApple Developer Portal / Firebaseコンソール側の
Sign in with Apple設定を、`Podfile-notes.md` を読んでCocoaPods関連の注意点を確認してください。

## このフォルダの構成

| ファイル | 内容 |
|---|---|
| `Info.plist-additions.xml` | プッシュ通知のバックグラウンドモード、Google Sign-InのURL Scheme(`GoogleService-Info.plist`内の`REVERSED_CLIENT_ID`)、AdMobのアプリID・ATT(トラッキング許諾)文言など、`Info.plist`に足す項目 |
| `entitlements-additions.md` | Xcodeの「Signing & Capabilities」で追加すべきCapability(Sign in with Apple / Push Notifications / Background Modes)と、`App.entitlements`に追記される内容 |
| `AppDelegate-additions.swift` | プッシュ通知のデバイストークンをFirebase Messagingに渡すための`AppDelegate.swift`への追記 |
| `Podfile-notes.md` | `@capacitor-firebase/*`系プラグインが要求するCocoaPods関連の注意点(`use_frameworks!`など) |
| `apple-sign-in-notes.md` | Apple Developer Portal・Firebaseコンソール側でSign in with Appleを有効化する手順、審査ガイドライン4.8対応の確認事項 |

## Android版との関係

アプリ本体のロジック(`www/index.html`)はAndroid版・iOS版で完全に同一の1ファイルです。
`CloudSync`(マルチプレイヤー機能)・`Native`(広告/課金)ともに、プラットフォーム固有の
分岐は一切持たず、すべて`window.Capacitor.Plugins`経由でネイティブプラグインを呼び出す
設計になっているため、iOS固有の追加作業はこのフォルダの「ネイティブプロジェクト側の
設定」だけで完結します(JS側の追加実装は不要)。
