# マネタイズ導入ガイド (AdMob広告 ＋ アプリ内課金)

対象: `mahjong-score-app` のCapacitorラップ版(Google Play / App Store 両配信想定)。

このガイドは「アプリのコードは書き終わったが、Google/AdMob側のアカウント設定・
申請・法的対応をこれから行う」人向けの手順書です。コード側の実装
(`www/index.html` 内の `Native` オブジェクト、ペイウォールUIなど)は
既にPlaywrightで動作確認済みですが、**このガイド自体の各手順は
このサンドボックスから実際にGoogle/AdMobの管理画面を操作して確認したものではなく、
一般に公開されている手順に基づく案内です。**細かいUIの位置や項目名は
Google側の仕様変更で変わることがあるため、実際の画面の表示に従ってください。

---

## 1. AdMobアカウント・広告ユニットの準備

1. https://apps.admob.com/ でAdMobアカウントを作成(Googleアカウントでログイン)。
2. 「アプリを追加」から本アプリを登録し、**アプリID**(`ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)を取得。
   → `android-snippets/AndroidManifest-additions.xml` の `APPLICATION_ID` に設定。
3. 広告ユニットを2つ作成:
   - **バナー広告ユニット**(得点記録票タブ下部に常設表示)
   - **インタースティシャル広告ユニット**(対局終了時に1回表示)
   それぞれの広告ユニットID(`ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)を取得。
   → `www/index.html` 内 `MONETIZATION_CONFIG.admobBannerUnitId` /
     `admobInterstitialUnitId` に設定。
4. **本番申請前は必ずテスト広告ユニットIDで動作確認すること**
   (Googleが公式に提供しているテストID。`android-snippets/cordova-plugin-purchase-notes.md`
   にも記載): 本番の広告ユニットIDのまま開発中に何度も広告を表示させると、
   無効なインプレッション/クリックとみなされてAdMobアカウントが停止されるリスクがあります。

---

## 2. Google Play Console でのアプリ内アイテム(課金商品)の作成

1. https://play.google.com/console/ でデベロッパーアカウントを準備(初回登録は$25の一回払いが必要)。
2. アプリを作成し、内部テストトラックにまずは配信できる状態にする
   (課金のテストには、少なくとも一度「内部テスト」または「クローズドテスト」に
   アップロードしている必要があります)。
3. 「収益化」→「商品」→「アプリ内アイテム」から、
   **管理対象商品(managed product / 非消費型)**を1つ作成:
   - プロダクトID: `remove_ads_unlock_history`
     (`www/index.html` の `MONETIZATION_CONFIG.billingProductId` と**完全一致**させること。
     変える場合は両方直すこと)
   - 価格: ¥400 (ユーザーの要望通り、広告削除＋記録し放題をこの1商品にまとめています)
   - 商品名・説明: 「広告削除＋記録し放題」等、ストア掲載時と一貫した文言にする。
4. 「設定」→「ライセンステスト」で、自分(および動作確認する人)のGoogleアカウントを
   **ライセンステスター**として登録する。これをしないと、実際に決済が発生してしまいます。
5. 商品を「有効」にした後、反映まで数時間かかることがあるので、
   すぐにテストできなくても慌てないこと。

この節はAndroid(Google Play)向けです。iOS側のApp Store Connectでの商品作成・
StoreKitローカルテスト・Sandboxテスターでの実機テストは「8. App Store Connect
でのアプリ内課金(iOS)とStoreKitローカルテストの準備」を参照してください。

---

## 3. プライバシーポリシーの用意(AdMob利用の開示)

Google Playは、広告SDK(AdMob)を利用するアプリに対して
**プライバシーポリシーへのAdMobによるデータ収集の開示**を必須としています。
最低限、以下を含むプライバシーポリシーページ(Web上のURLが必要)を用意してください:

- 本アプリがGoogle AdMobを使用して広告を配信していること
- AdMobが広告配信のために広告ID(Advertising ID)等のデバイス識別子を
  収集する場合があること、およびGoogleのプライバシーポリシー
  (https://policies.google.com/privacy)へのリンク
- 課金機能(Google Play Billing)を通じて購入情報がGoogleによって処理されること
- 本アプリ自体は対局の点数記録をすべて端末内(localStorage)に保存しており、
  Googleへの広告/課金処理以外の目的でユーザーの個人情報や対局データを
  外部サーバーに送信していないこと(該当する場合。実装上、現状の
  `mahjong-score.html` は完全にローカル完結型なので、この一文は事実に即しています)

プライバシーポリシーは、GitHub Pagesの静的ページとして
(既にホスティング環境をお持ちなので)`mahjong-app/` と同じリポジトリに
`privacy-policy.html` 等として置き、そのURLをPlay Console の
「アプリのコンテンツ」→「プライバシーポリシー」欄に登録するのが簡単です。

---

## 4. データセーフティ(Data Safety)フォームでの広告ID申告

Play Consoleの「アプリのコンテンツ」→「データセーフティ」フォームで、
以下を正直に申告してください(AdMobを組み込む以上、多くの場合ここは
「収集している」側の回答になります):

- 収集するデータの種類: 「デバイスまたはその他の識別子」に
  **広告ID(Advertising ID)** が該当します → 「収集する」を選択。
- 目的: 「広告またはマーケティング」を選択。
- 第三者との共有: AdMob(Google)と共有する旨を選択。
- それ以外の個人情報(氏名・メール・位置情報など)は、
  本アプリの現在の実装では収集していないはずなので「収集していない」で問題ありません
  (対局記録のプレイヤー名は端末内保存のみで、外部送信していないため)。

このフォームの回答は、AdMob SDKやcordova-plugin-purchaseが実際に何を収集するかの
一次情報(それぞれの公式ドキュメント)を確認した上で、最終的にはアプリ提供者(あなた)の
責任で正確に申告する必要があります。このガイドは出発点であり、法的な確約ではありません。

---

## 5. 年齢制限・対象年齢の確認

- Play Consoleの「アプリのコンテンツ」→「対象年齢層」で、
  本アプリを「子供向け」として登録**しない**ことを確認してください
  (麻雀点数計算アプリなので通常は該当しませんが、念のため申請時に
  誤って子供向けカテゴリにチェックしないよう確認、とのご要望に対応)。
- 「ファミリー向けポリシー」の対象にすると、AdMobの一部機能
  (パーソナライズ広告など)に追加の制約がかかるため、
  子供向けを意図していないなら対象外のままにしておくのが無難です。
- コンテンツレーティング questionnaire (IARC) は、賭博的要素・暴力表現等の
  設問に正直に回答してください(点数計算アプリ自体に該当する項目はほぼ無いはずです)。

---

## 6. UI上の誤タップ防止(バナー広告と操作ボタンの間隔)

ご要望にあった「バナー広告と『対局を終了する』/『半荘を記録』ボタンの間に
十分な間隔を空け、誤タップを防ぐ」対応について、実装済みの内容:

- `www/index.html` のCSSで、バナー表示中は `body.ad-banner-active` クラスが付与され、
  `.stage` の `padding-bottom` を広告バナー分(約120px相当)確保しています。
- ボトムナビ自体も `.bottom-nav.with-ad-banner` でバナーの高さ分(50px)上に押し上げています。
- これにより、バナー広告の直上に操作ボタンが密着しない設計になっています。
  実機でバナーの実寸を確認した上で、必要に応じて `padding-bottom` の数値
  (現在 `calc(120px + env(safe-area-inset-bottom, 0px))`)を調整してください。

---

## 7. 申請前の最終チェックリスト

- [ ] `MONETIZATION_CONFIG` の広告ユニットID・課金商品IDをすべて本番用に差し替えた
- [ ] テスト広告ID → 本番広告IDに戻した(逆に忘れると審査に通っても収益が発生しません)
- [ ] プライバシーポリシーURLをPlay Consoleに登録した
- [ ] データセーフティフォームで広告ID収集を申告した
- [ ] 対象年齢層で「子供向け」になっていないことを確認した
- [ ] ライセンステスターアカウントで実際に「¥400で広告削除」ボタンからテスト購入が完了し、
      アプリ内で `isPremium` が `true` になり広告が消えることを実機で確認した
- [ ] アプリを一度アンインストール→再インストールし、「購入を復元」ボタン
      (または起動時の自動復元)で購入状態が正しく戻ることを確認した
      (これはローカルストレージが失われた場合の復元導線として、ユーザー要望の
      「起動のたびにPlay Billingへ再照会する」設計の要です)
- [ ] オフライン状態で起動しても、広告初期化・購入照会が失敗するだけでクラッシュせず、
      通常の点数計算・記録機能が問題なく使えることを確認した
      (`Native` オブジェクトの全メソッドが `try/catch` で失敗を握りつぶす設計になっています)

---

## 8. App Store Connect でのアプリ内課金(iOS)とStoreKitローカルテストの準備

`www/index.html` の `Native.initBilling()` は、実行中のOS(`Capacitor.getPlatform()`)に
応じて `store.Platform.APPLE_APPSTORE` / `store.Platform.GOOGLE_PLAY` を自動的に
切り替えて登録します(修正前はGoogle Play決め打ちで、iOSでは課金が一切初期化
されていませんでした)。iOS側で実際に動かすには、以下の準備が必要です。

⚠️ 例によってこのサンドボックスには実際のXcode・App Store Connectへの
アクセス環境が無く、この節の手順・以下で追加したStoreKit Configuration File・
スキーム設定は、公式ドキュメントに基づいて書いたものであり実機検証していません。

### 8-1. App Store Connect側の商品作成

1. https://appstoreconnect.apple.com/ で本アプリのアプリレコードを開き、
   「機能」→「App内課金」から**非消耗型(Non-Consumable)**の商品を1つ作成:
   - プロダクトID: `remove_ads_unlock_history`
     (Android側・`www/index.html` の `MONETIZATION_CONFIG.billingProductId` と
     **完全一致**させること)
   - 価格: ¥400に最も近い価格ティアを選択(Appleは価格をティアから選ぶ方式のため、
     Androidのように任意の金額を直接指定することはできません)
   - 表示名・説明: 「広告削除＋記録し放題」等、Android側と一貫した文言にする
2. **In-App Purchase機能を使うには、事前に「契約/税金/口座情報」
   (Agreements, Tax, and Banking)で「有料App」契約に同意し、銀行口座・
   税務情報を入力しておく必要があります。** これが未完了だと、商品を作成しても
   ステータスが進まないことがあります。
3. 商品のステータスが「送信準備完了(Ready to Submit)」になっていることを確認する
   (実際の審査提出はアプリ本体の審査提出時にまとめて行われます)。

### 8-2. In-App Purchase capabilityについて(portal側の追加設定は不要)

`ios/App/App.xcodeproj/project.pbxproj` に `com.apple.InAppPurchase` の
capabilityエントリを追加済みで、Xcodeで開くと「Signing & Capabilities」タブに
表示されます。ただしIn-App PurchaseはSign in with AppleやPush Notificationsと
異なり、**Apple Developer Portal側でApp IDに対して個別に有効化する操作は
不要**です(StoreKitはどのApp IDでも標準で利用できます)。このcapability
エントリは、Xcode上で正しく表示されるようにするための対応です。

### 8-3. Xcodeでのローカル動作確認(StoreKit Configuration File)

App Store Connect側の審査完了・商品の反映を待たずに購入フロー自体をテスト
できるよう、`ios/App/App/Configuration.storekit` を追加し、共有スキーム
`ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` の実行(Run)設定
でこのファイルを使うよう設定しました(`remove_ads_unlock_history` を
¥400相当の非消耗型として登録済み)。

⚠️ スキームXML内の `StoreKitConfigurationFileReference` のファイル参照
(相対パス指定)は実機のXcodeで検証できていません。**Xcodeでプロジェクトを
開いたらまず、「Product > Scheme > Edit Scheme > Run > Options」タブを開き、
「StoreKit Configuration」に `Configuration.storekit` が選択されているか
確認してください。選択されていなければ、プルダウンから手動で選び直して
ください**(ファイル自体はプロジェクトに追加済みなので、選択肢には出てくる
はずです)。

手順:
1. `ios/App/App.xcworkspace` をXcodeで開く(`.xcodeproj` ではなく
   `.xcworkspace` の方)。
2. 上記の「StoreKit Configuration」設定を確認・選択。
3. シミュレータまたは実機を選んでビルド・実行(Run)する。
4. アプリの「課金する」ボタン等から購入フローを開始すると、実際の決済無しで
   Xcode上に購入確認シートが表示され、承認すると `approved` → `verify()` →
   `finish()` のイベントが流れてアプリ内で `isPremium` が `true` になることを
   確認できる。
5. Xcodeの「Debug > StoreKit > Manage Transactions」から、テスト購入の削除・
   返金シミュレーションも行える(「購入を復元」ボタンのテストにも使える)。

これはあくまでXcode内で完結するローカルシミュレーションで、App Store
Connectへの接続や実際のApple ID・Sandboxテスターアカウントは不要です。

### 8-4. Sandboxテスターアカウントでの実機テスト(App Store Connect連携)

ローカルのStoreKit Configuration Fileでのテストとは別に、実際にApp Store
Connectと通信する経路(TestFlight配信後や、審査提出前の実機確認)を試す場合は
Sandboxテスターアカウントが必要です。

1. App Store Connectの「ユーザーとアクセス」→「Sandboxテスター」から、
   実際には使われていないメールアドレスでテスター用Apple IDを作成する
   (実在するApple IDを使い回すことはできません)。
2. 実機(またはシミュレータ)の「設定」→「App Store」→一番下の
   「SANDBOX ACCOUNT」欄で、このSandboxテスターアカウントにサインインする
   (通常使っているApple IDからサインアウトする必要はない。iOS 17以降は
   この専用欄からサインインできる)。
3. Xcodeのスキームの「StoreKit Configuration」を**「None」に戻してから**
   ビルド・実行する(ローカルの`.storekit`ファイルを使ったままだと、
   実際のApp Store Connectには問い合わせに行かないため)。
4. アプリ内で購入操作を行うと、Sandbox環境の決済シートが表示される
   (「[Environment: Sandbox]」といった表示が出る)。Sandboxテスターの
   Apple IDでのサインインを求められたら、8-1で作成したSandboxテスターの
   認証情報を入力する。
5. 決済が完了すると`approved`イベントが発火し、これまで通り`isPremium`が
   `true`になることを確認する。
6. 商品が「送信準備完了」になっていない(8-1が未完了)と、Sandbox環境でも
   購入フローが正しく動作しないことがあるので、先に8-1を終わらせておくこと。

### 8-5. iOS版の申請前チェックリスト

- [ ] App Store Connectで `remove_ads_unlock_history` の非消耗型商品を作成し、
      「送信準備完了」になっている
- [ ] 「契約/税金/口座情報」で有料App契約・銀行口座・税務情報の登録を完了した
- [ ] Sandboxテスターアカウントを作成し、実機の「SANDBOX ACCOUNT」欄でサイン
      インして、実際に購入テスト(承認→`isPremium`が`true`になる)ができた
- [ ] 「購入を復元」がiOS実機でも正しく動作する(Sandboxアカウントでの
      再インストール後に購入状態が復元される)ことを確認した
- [ ] Xcodeでプロジェクトを開き、「Signing & Capabilities」に
      In-App Purchaseが表示されていることを確認した

---

## 参考: 各設定値の一覧(再掲)

`www/index.html` 内で一元管理している設定(検索キーワード: `MONETIZATION_CONFIG`):

```js
const FREE_MATCH_LIMIT = 3; // 無料で保存できる対局数の上限

const MONETIZATION_CONFIG = {
  admobAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
  admobBannerUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/BANNERID',
  admobInterstitialUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIALID',
  billingProductId: 'remove_ads_unlock_history',
  fallbackPriceLabel: '¥400', // Billing APIから価格取得できない場合の表示フォールバック
};
```
