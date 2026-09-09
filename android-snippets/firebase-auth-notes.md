# Android側 Firebase Auth(匿名 / Google / Firestore / Messaging)設定メモ

⚠️ このサンドボックスにはAndroid SDK・Firebase CLIが無く、実際に
`google-services.json` を使ったビルド・実機確認はできていません。
以下はFirebase/Capacitorの公式ドキュメントに基づくメモです。

## Firebaseコンソール側の手順

1. Firebaseプロジェクトを作成(まだ無ければ)。iOS版と同じプロジェクトを共用してよい
   (1つのFirebaseプロジェクトにAndroidアプリ・iOSアプリを両方登録できる。
   Firestore/セキュリティルールもプロジェクト単位で共通なので、これは必須)。
2. 「Androidアプリを追加」でパッケージ名(`capacitor.config.json` の `appId`、
   例: `com.example.mahjongscore`)を登録し、`google-services.json` をダウンロード。
3. Authentication > Sign-in method で **匿名** と **Google** を有効化。
   (X/Twitterは今回の要件で明示的に不要。Appleはこのアプリではプラットフォーム上
   iOS版のみで提供する想定 — Android自体にApple IDログインを実装する法的義務は無く、
   Android版ではGoogleログイン+匿名のみで問題ない設計。)
4. `build-gradle-additions.txt` の手順7にあるとおり、SHA-1/SHA-256
   フィンガープリントをFirebaseコンソールに登録する
   (**これを忘れるとGoogleログインが動かない**、最もハマりやすいポイント)。

## Firebase Cloud Messaging (プッシュ通知)

Android側はAPNsのような追加の鍵登録は不要で、`google-services.json` を正しく配置すれば
FCMは automatically 有効になります。通知チャンネル(`default_channel`)は
`AndroidManifest-additions.xml` のメタデータで指定したIDに合わせて、Capacitorの
PushNotificationsプラグイン初期化時、またはネイティブ側で1回だけ作成しておくのが
Android 8+の作法です(通知が全く表示されない場合はまずチャンネル未作成を疑うこと)。

## Web版との違い・共通点

- `CloudSync.isAvailable()`(`Native.isNativeApp()`を見ている)によって、Android/iOSの
  ネイティブアプリ内でのみFirebase関連のコードが有効化されます。Web版
  (`mahjong-app/`, GitHub Pages配布)は今までどおり完全に無関係・無料のままです。
- Firestoreセキュリティルール(`firebase/firestore.rules`)・Cloud Functions
  (`firebase/functions/`)はAndroid/iOS両プラットフォーム・両ストアアプリで完全に共通です。
  プラットフォームごとに変える必要はありません。
