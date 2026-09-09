# Podfile まわりの注意点

`npx cap add ios` を実行すると `ios/App/Podfile` が自動生成され、
`npx cap sync ios` を実行するたびに `pod install` 相当の処理が自動で走ります
(手動で `pod install` を叩く必要は基本的にありません)。

以下は、`@capacitor-firebase/*` 系プラグイン特有の注意点です
(このサンドボックスでは実際に `pod install` を実行して検証できていません。
エラーが出た場合は各プラグインのGitHub Issueや公式ドキュメントを確認してください)。

## 1. `use_frameworks!` が必要になる場合がある

Firebase iOS SDK(特にSwift実装を含む新しめのモジュール)を使うプラグインは、
`Podfile` に `use_frameworks!` の指定を要求することがあります。
Capacitorの標準テンプレートには含まれていないため、`pod install` でエラーが出た場合は
`ios/App/Podfile` の `target 'App' do` ブロック内に追記してください:

```ruby
platform :ios, '13.0'

target 'App' do
  capacitor_pods
  use_frameworks!   # ← Firebase系プラグインでエラーが出た場合に追加
  # 以下、npx cap sync ios が自動生成する pod 'Capacitor...' 行が並ぶ
end
```

## 2. 最低iOSバージョン

Firebase iOS SDKの比較的新しいバージョンは iOS 13 以上を要求することが多い。
Capacitor 6系の標準テンプレートも既に `platform :ios, '13.0'` 前後になっているはずだが、
`pod install` 時にバージョン不足のエラーが出た場合はここを確認・引き上げること。

## 3. GoogleService-Info.plist の配置

`ios/App/App/` 直下(`Info.plist` と同じ階層)に配置し、Xcodeの
「File > Add Files to "App"」で **Target "App" にチェックを入れて** 追加すること。
Finderでファイルを置くだけではXcodeのビルドに含まれないので注意。

## 4. ビルド時間について

`pod install` はFirebase SDK一式を含むため、初回は数分〜十数分かかることがあります。
CI環境で実行する場合はタイムアウト設定を長めに取ってください。
