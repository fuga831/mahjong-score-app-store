# CLAUDE.md

## 1. 最重要行動ルール

- 指示されていないファイルを広範囲に探索（Grep/Viewでの全文検索・全ディレクトリ走査など）しないこと。
- 明示的に指定されたファイル・関数のみをピンポイントで編集し、無関係なリファクタリングや既存コードの改変は一切行わないこと。
- 変更前に、編集対象のファイルパスと変更概要を1行で宣言してから作業に入ること。

## 2. プロジェクト構成の概要

- 本体は単一ファイルの静的Webアプリ `www/index.html`（HTML/CSS/JS全部入り、フレームワーク不使用）。点数計算・得点記録・マルチプレイヤー機能（`CloudSync`オブジェクト）を含む唯一のエントリーポイント。
- `firebase/` — Firestoreセキュリティルール（`firestore.rules`）・インデックス定義・Cloud Functions（`functions/`）。
- `ios/` / `android-snippets/` — CapacitorによるiOS/Androidネイティブラッパー関連ファイル。
- `docs/` — セットアップ手順・仕様メモ等のドキュメント。
- ルート直下の `package.json` はCapacitorの同期コマンド管理のみで、アプリ本体のビルドパイプラインは持たない。

## 3. 主要コマンド

- ローカル起動: `www/index.html` を直接ブラウザで開く、または `python3 -m http.server` 等の静的サーバーで配信（ビルドステップ不要）。
- Capacitor同期: `npm run sync`（`sync:ios` / `sync:android` で個別プラットフォームのみ）。
- テスト・リント: 自動テスト／リントの設定（`package.json`の`test`/`lint`スクリプト、`.eslintrc`等）は**存在しない**。変更後の検証は、`node -e "new Function(...)"`等による構文チェックと、Playwright等を使った手動確認で代替すること。
