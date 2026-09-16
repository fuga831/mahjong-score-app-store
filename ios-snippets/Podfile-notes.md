# Podfile まわりの注意点

`npx cap add ios` を実行すると `ios/App/Podfile` が自動生成され、
`npx cap sync ios` を実行するたびに `pod install` 相当の処理が自動で走ります
(手動で `pod install` を叩く必要は基本的にありません)。

以下は、`@capacitor-firebase/*` 系プラグイン特有の注意点です。

⚠️ このサンドボックスにはCocoaPods自体(`gem install cocoapods`)は入っており、
`pod deintegrate`・`Pod::Podfile.from_file`によるPodfileの構文検証・
`xcodeproj` gemによる`project.pbxproj`の読み込み検証は実際に実行できます。
ただし依存関係解決(`pod install`)は、CocoaPodsのCDNベースのtrunkリポジトリ
(`cdn.jsdelivr.net`)への通信がこの環境のネットワークポリシーでブロックされて
おり実行できません(`pod install`は`CDN: trunk Repo update failed`で失敗します。
実機・Codemagic等の通常のネットワーク環境では問題なく動作するはずです)。
エラーが出た場合は各プラグインのGitHub Issueや公式ドキュメントを確認してください。

## 0. User Script Sandboxing(Xcode 15以降)でアーカイブビルドが失敗する場合

Codemagicでのアーカイブビルドが、具体的なエラー行のないまま
`Failed to archive App.xcworkspace`(exit code 65)で失敗し、ログに
「Create Symlinks to Header Folders」等のPodスクリプトフェーズの警告が
並ぶ場合、Xcode 15以降の「User Script Sandboxing」がPodのスクリプト
フェーズのファイルアクセスをブロックしていることが原因であることが多い。
`Podfile`の`post_install`フックで全Podターゲットに対して
`ENABLE_USER_SCRIPT_SANDBOXING = 'NO'`を設定済み(下記参照)。あわせて
`ios/App/App.xcodeproj`側(Appターゲット・プロジェクトの両方、Debug/Release
各設定)にも同じ設定を明示的に追加済み。設定を変更した後は、CI側の
`pod install`ステップ(`codemagic.yaml`の「Install CocoaPods dependencies」)
で自動的にPodsが再生成される(このリポジトリは`Pods/`・`Podfile.lock`を
コミットしていないため、CIの実行は常にクリーンな`pod install`になり、
事前の`pod deintegrate`は本質的に不要)。

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
