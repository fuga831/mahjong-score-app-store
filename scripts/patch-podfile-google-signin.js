#!/usr/bin/env node
//
// `npx cap sync ios` は ios/App/Podfile 内の `capacitor_pods` defブロックを
// 毎回まるごと自動生成し直す(@capacitor/cli/dist/ios/update.jsのupdatePodfile()が
// `pod '<name>', :path => '<path>'` という素の形で書き直す)ため、
// CapacitorFirebaseAuthenticationプラグインのGoogleサブスペック指定
// (`CapacitorFirebaseAuthentication/Google`)を直接Podfileに書いても
// cap syncのたびに消えてしまう。
//
// このスクリプトは、cap sync直後にPodfileを開いて
// `pod 'CapacitorFirebaseAuthentication', :path => '...'` を
// `pod 'CapacitorFirebaseAuthentication/Google', :path => '...'` に書き換える。
// Googleサブスペックにはpodspec側で `GoogleSignIn` への実際のpod依存と
// 必要なOTHER_SWIFT_FLAGS(-DRGCFA_INCLUDE_GOOGLE)の両方が定義されているため、
// これだけでGoogleSignInモジュールが正しく解決されるようになる
// (詳細はios/App/Podfileのコメント参照)。

const fs = require('fs');
const path = require('path');

const podfilePath = path.join(__dirname, '..', 'ios', 'App', 'Podfile');

if (!fs.existsSync(podfilePath)) {
  // まだ `npx cap add ios` を実行していない環境では何もしない。
  process.exit(0);
}

const before = fs.readFileSync(podfilePath, 'utf8');
const after = before.replace(
  /pod 'CapacitorFirebaseAuthentication', :path/,
  "pod 'CapacitorFirebaseAuthentication/Google', :path"
);

if (after !== before) {
  fs.writeFileSync(podfilePath, after);
  console.log('[patch-podfile-google-signin] Podfile: CapacitorFirebaseAuthentication を /Google サブスペックに書き換えました');
} else if (!before.includes("CapacitorFirebaseAuthentication/Google")) {
  // ここに到達するのは、cap syncが生成したPodfileの中に
  // `pod 'CapacitorFirebaseAuthentication', :path => '...'` という
  // 想定した形の行が全く見つからなかった場合。
  // 単なる警告のままだと、GoogleSignInモジュールが解決できない
  // ビルドがそのままCIを通過してしまう(過去に実際に発生した)ため、
  // ビルドを確実に失敗させて気付けるようにする。
  console.error('[patch-podfile-google-signin] エラー: Podfile内に "pod \'CapacitorFirebaseAuthentication\', :path" 形式の行が見つかりませんでした。cap syncの出力形式が変わっていないか、プラグイン自体がPodfileから消えていないか確認してください。');
  process.exit(1);
}
