# Sign in with Apple / Google Sign-In — Apple Developer Portal・Firebaseコンソール側の設定

## なぜ両方必要か(Apple審査ガイドライン4.8)

今回の要件どおり、このアプリはGoogleログインとSign in with Appleの**両方**を提供します。
Appleの審査ガイドライン4.8は「サードパーティのSNS/アカウントでのログインを提供する
アプリは、Sign in with Appleも同等の選択肢として提供しなければならない」という趣旨の
規定で、Googleログインだけを提供するとリジェクトされるリスクがあります。
(X/Twitterログインは今回の要件で明示的に除外されているため未実装。)

アプリはログインを必須にしていない(匿名のまま使い続けられ、ログインは「同卓者を
指定する」等の操作をした時にだけ任意で促される)ため、審査上はさらに安全側の設計です。

## Apple Developer Portal 側の手順

1. https://developer.apple.com/account/resources/identifiers/list で、このアプリの
   App ID (Bundle ID。`capacitor.config.json` の `appId` と同じ値、例:
   `com.example.mahjongscore`) を選択。
2. 「Capabilities」一覧から **Sign in with Apple** にチェックを入れて保存。
   (Xcode側で「+ Capability」から追加すると自動で同期されることもあるが、
   反映されない場合はここで手動でも確認・有効化すること。)
3. Push Notifications capabilityも同じ画面で有効化されているか確認。

## Firebaseコンソール側の手順

1. Firebaseコンソール > Authentication > Sign-in method で **Apple** プロバイダを有効化。
   - ネイティブのSign in with Apple(Capacitorプラグイン経由でiOS上のダイアログを
     直接使う方式)を使う場合、Firebase側の「サービスID」「Apple Team ID」等の
     詳細設定はWeb向けOAuthフロー用のものなので、ネイティブフローのみを使うなら
     最低限「有効化」するだけで動作することが多い(プラグインのREADMEで
     最新の要否を必ず確認すること)。
2. 同じくSign-in methodで **Google** プロバイダも有効化。
   - Google Sign-InはiOS側で `GoogleService-Info.plist` 内のクライアントID・
     `REVERSED_CLIENT_ID` を使う(`Info.plist-additions.xml` 参照)。
3. Authentication > Settings > 匿名アカウントの有効化も確認
   (「一時的にアカウントを作成」= Anonymous authenticationを有効にしておく必要がある。
   今回の要件どおり、初回起動時は必ずこの匿名認証でuidを発行する設計)。

## 動作確認のポイント(実機必須)

- Sign in with AppleはXcodeのシミュレータでも一応動作するが、実際の審査・配信前には
  必ず実機で確認すること。
- 「メールアドレスを非公開」を選択した場合にFirebase側でどのメールアドレスとして
  扱われるか(Appleのプライベートリレーアドレス)は、今回の実装ではメールアドレスを
  一切使っていない(uid・ユーザーネームのみで識別する設計)ため実害はない想定だが、
  念のため実機で一度フローを通して確認することを推奨。
