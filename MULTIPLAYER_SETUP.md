# マルチプレイヤー(フレンド・卓・成績共有)導入ガイド

対象: `mahjong-score-app` のCapacitorラップ版(iOS App Store配信を優先、Android/Google Playにも同時配信)。

このガイドは「アプリ側のコード(`CloudSync`まわり)は書き終わったが、Firebase側の
プロジェクト設定・デプロイ・各ストアの審査対応をこれから行う」人向けの手順書です。

**コード側(`www/index.html` 内の `CloudSync`・UI一式)は、疑似Firestoreサーバー+
2つの独立したブラウザコンテキストを使ったPlaywrightの自己接続テストで、
「フレンド検索→同卓者指定→リアルタイム同期→対局終了時のファンアウト配信→
通知バナー表示→matchCountの個別カウント→フレンド解除」までの一連の流れが
動作することを確認済みです。**

一方、以下は **このサンドボックスには Firebase CLIでのログイン・実際の
Firebaseプロジェクトへのデプロイ・エミュレータでの実地検証・Xcode/Android Studioでの
ネイティブビルドができる環境がなく、一度も実地検証していません**:

- `firebase/firestore.rules` / `firebase/firestore.indexes.json` — 本物のFirestore
  エミュレータ/本番環境で評価されたことがない
- `firebase/functions/` — 一度もデプロイ・実行されたことがない
- iOS/Androidそれぞれのネイティブビルド(Sign in with Apple・プッシュ通知の実機動作)

このガイドの手順に従って、必ずご自身の環境で検証してから本番反映してください。

---

## 1. Firebaseプロジェクトの作成

1. https://console.firebase.google.com/ で新規プロジェクトを作成(既存のAdMob用
   Googleアカウントと同じでも別でも構いません)。
2. 「Androidアプリを追加」「iOSアプリを追加」の両方を行い、それぞれ
   `google-services.json` / `GoogleService-Info.plist` をダウンロード
   (配置場所は `android-snippets/firebase-auth-notes.md` /
   `ios-snippets/README.md` を参照)。
3. Firestore Database を作成(本番モードで開始して構いません。ルールは
   `firestore.rules` をデプロイするため、コンソール上で初期ルールを気にする必要はなし)。
4. Cloud Messaging(FCM)は追加設定不要でプロジェクト作成時に有効。

---

## 2. 認証プロバイダの有効化

Firebaseコンソール > Authentication > Sign-in method で、以下を有効化:

- **匿名**(必須。初回起動時に必ずこれでuidを発行する設計)
- **Google**
- **Apple**

Google/Appleそれぞれのプラットフォーム固有の追加設定(SHA証明書登録、
Sign in with Apple capability等)は `android-snippets/firebase-auth-notes.md` と
`ios-snippets/apple-sign-in-notes.md` にまとめてあります。

**X/Twitterログインは今回の要件で明示的に不要と指定されているため実装していません。**
Google + Appleの2つで、Apple審査ガイドライン4.8(サードパーティログインを提供するなら
Sign in with Appleも同等に提供する必要がある)を満たす設計です。

---

## 3. Firestoreセキュリティルール・インデックスのデプロイ

```bash
# firebase/ ディレクトリで(初回のみ)
npm install -g firebase-tools   # または npx firebase-tools
firebase login
firebase use --add   # 作成したFirebaseプロジェクトを選択

# ルール・インデックスをデプロイ
firebase deploy --only firestore:rules,firestore:indexes
```

デプロイ前に、**必ずエミュレータで実地検証してください**:

```bash
firebase emulators:start --only firestore
```

`firestore.rules` は以下の設計をコード化しています(コメントも参照):

- `usernames/{name}`: 先着順取得・「予約なし」方式(ユーザーネーム変更時は旧名を
  即座に解放し、他の人がすぐ使えるようにする — ご要望どおりの仕様)
- `users/{uid}`: 本人のみ書き込み可能。`matchCount`(無料枠カウント)は
  「増える方向にしか動かせない」よう検証し、自分でカウントを巻き戻せないようにしている
- `users/{uid}/matchHistory/{matchId}`: 本人による確定保存に加えて、
  「自分のuidが`rooms/{roomId}`の参加者リストに含まれている場合に限り、
  その卓の代表入力者(hostUid)からの自動配信書き込みを許可する」という、
  ご要望どおりのルールを実装。無料枠(3対局)を超えている場合は
  `isPremium`が立っていない限りサーバー側でも拒否する
- `rooms/{roomId}`: 参加者のみ閲覧可能、更新・削除はホストのみ

`firestore.indexes.json` は、起動時に「自分が参加者になっているactiveな卓を探す」
クエリ(`CloudSync.checkActiveRoomInvite()` — アプリが閉じていた間に誰かに
同卓者として指定されていた場合に、次回起動時に気づくための仕組み)に必要な
複合インデックスを定義しています。

---

## 4. Cloud Functions(自動配信通知)のデプロイ

```bash
cd firebase/functions
npm install
cd ..
firebase deploy --only functions
```

`functions/index.js` は、`users/{uid}/matchHistory/{matchId}` に
**自分以外の代表入力者からの自動配信**でドキュメントが作成された時にだけ、
その人にプッシュ通知を送ります。ご要望どおり、**通知本文には点数・金額などの
対局の中身を一切含めません**(例: 「◯◯さんとの対局記録が追加されました」のみ。
ロック画面での覗き見防止)。通知のON/OFF設定
(`logState.account.notifyOnAutoRecord`、初期値ON)は `users/{uid}.notifyOnAutoRecord`
にミラーされ、Cloud Functions側でもこれを尊重してから送信します。

### APNs認証キーのアップロード(iOSへのプッシュ通知に必須)

1. https://developer.apple.com/account/resources/authkeys/list で
   APNs用のキー(.p8ファイル)を新規作成・ダウンロード(一度しかダウンロードできないので保管注意)。
2. Firebaseコンソール > プロジェクト設定 > Cloud Messaging > Appleアプリの設定 で、
   このキーとTeam ID・Key IDをアップロード。
   これを行わないと、iOS実機でのプッシュ通知配信ができません
   (Android側はgoogle-services.jsonの配置のみで追加のキー登録は不要)。

---

## 5. プライバシーポリシーへの追記(マルチプレイヤー機能分)

`MONETIZATION_SETUP.md` の3で用意したプライバシーポリシーに、以下を追記してください
(このアプリは今回の機能追加で「完全ローカル完結型」ではなくなるため、追記は必須です):

- **収集する情報**: Firebaseを通じて、匿名または連携したGoogle/Appleアカウントに
  紐づく一意のID(uid)、設定したユーザーネーム、フレンド関係、進行中の卓の情報、
  対局記録(得点・チップ精算等)をFirebaseのサーバー(Google Cloud上)に保存すること。
- **同卓者による書き込みの開示**: 一緒に対局した相手が「対局を終了する」操作を行うと、
  その対局記録が自分のアカウントにも自動的に追加される場合があること
  (=自分自身がその都度「保存する」を明示的に押していなくても記録が追加される)。
  この際は必ず通知でお知らせすること(無効化可能)。
- **プッシュ通知**: 対局記録が自動追加された際の通知のために、デバイスのプッシュ通知
  トークンを取得・保存すること。通知の許可は「同卓者を指定する」操作を初めて行う
  タイミングで求められること。
- **アカウントの任意性**: 匿名のままでも基本機能はすべて利用できること、
  Google/Appleログインは「他の端末からのデータ復元」「同卓者の指定」等を行う際に
  任意で選択できるものであり、必須ではないこと。

---

## 6. 申請前の最終チェックリスト

- [ ] Firestoreセキュリティルールをエミュレータで検証してからデプロイした
- [ ] Cloud Functionsをデプロイし、テスト用の2アカウントで実際にプッシュ通知が
      届くことを実機で確認した(iOS実機ではAPNsキーのアップロードが特に重要)
- [ ] Google/Apple両方のログインで、Firebase Authenticationコンソールに
      ユーザーが実際に作成されることを確認した
- [ ] Android版でGoogleログインのSHA証明書フィンガープリント(デバッグ・リリース両方)を
      Firebaseコンソールに登録した
- [ ] iOS版でApple Developer Portal側のSign in with Apple capabilityを有効化した
- [ ] プライバシーポリシーに5節の内容を追記し、URLを両ストアの管理画面に反映した
- [ ] 匿名のまま(ログインなし)でも、卓を立てる・同卓者を指定する・対局を記録する・
      対局を終了するまでの一連の操作が問題なくできることを実機で確認した
      (ログイン画面は「スキップして続ける」で必ず突破できる設計になっています)
- [ ] オフライン状態でアプリを起動しても、CloudSync関連の処理が失敗するだけで
      クラッシュせず、通常の点数計算・ローカルでの記録機能が使えることを確認した
      (`CloudSync`の全メソッドは`try/catch`で失敗を握りつぶす設計になっています)
- [ ] 2台の実機(またはシミュレータ+実機)で、実際に同卓者を指定して対局し、
      片方の端末で「対局を終了する」を押した後、もう片方の端末に記録が届き、
      通知が表示されることを確認した

---

## 参考: データモデルの一覧(再掲)

```
usernames/{normalizedUsername}       -> { uid }
users/{uid}                          -> { username, matchCount, isPremium, pushToken,
                                           notifyOnAutoRecord, ... }
users/{uid}/friends/{friendUid}      -> { uid, username, addedAt }
users/{uid}/matchHistory/{matchId}   -> { ...対局データ, participantUids, recordedBy, roomId }
rooms/{roomId}                       -> { hostUid, participants, participantUids, status,
                                           hanchans, chips, revealActive, revealStep, ... }
```

無料枠(`FREE_MATCH_LIMIT = 3`)・課金判定(`isPremiumUnlocked()`)は
`MONETIZATION_SETUP.md` で導入したものと同じ仕組みを流用しており、
「1回の対局の確定保存が、同卓の複数アカウントの無料枠を同時に消費し得る」という
ご要望どおりの挙動を、`firestore.rules` のmatchHistory作成ルールでサーバー側でも
検証しています(クライアント側のローカル判定はあくまで参加者本人=ホストの状態しか
見えないため、他の参加者の無料枠についてはサーバー側ルールが最終防衛線になります)。
