// functions/index.js
//
// ⚠️ このサンドボックスには Firebase CLI でのログイン・`npm install`(npm
// レジストリへのアクセス不可)・`firebase deploy`/`firebase emulators:start`
// を実行できる環境がありません。以下は
//   - firestore.rules が実際に許可する書き込み形(matchHistoryドキュメントの
//     recordedBy / participantUids フィールド)
//   - mahjong-score.html 側 CloudSync.archiveMatchFanout() が書き込む
//     entry のフィールド構成
// に合わせて実装したコードですが、一度もデプロイ・実地検証していません。
// 本番投入前に必ず `firebase emulators:start` で動作確認し、実機での
// プッシュ通知到達も確認してください。
//
// 役割: users/{uid}/matchHistory/{matchId} に「自分以外の代表入力者からの
// 自動配信」で新しいドキュメントが作成されたら、そのuid本人にプッシュ通知
// を送る。ユーザーの要望どおり、通知本文には点数・金額などの対局内容は
// 一切含めない(ロック画面での覗き見防止)。

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// リージョンは必要に応じて変更してください(例: 'asia-northeast1')。
setGlobalOptions({ region: 'asia-northeast1', maxInstances: 10 });

exports.notifyOnAutoRecordedMatch = onDocumentCreated(
  'users/{uid}/matchHistory/{matchId}',
  async (event) => {
    const { uid } = event.params;
    const snap = event.data;
    if (!snap) return;
    const entry = snap.data();

    // 自分自身で確定保存した記録(recordedByが無い、または自分自身)は対象外。
    // 代表入力者からの自動配信(recordedBy !== uid)の場合のみ通知する。
    if (!entry || !entry.recordedBy || entry.recordedBy === uid) {
      return;
    }

    try {
      // 通知ON/OFF設定(logState.account.notifyOnAutoRecord)を反映。
      // クライアント側(CloudSync.setNotifyOnAutoRecord)が users/{uid}.
      // notifyOnAutoRecord にミラーしているので、ここではそれを参照する。
      const userDoc = await db.doc(`users/${uid}`).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      if (userData && userData.notifyOnAutoRecord === false) {
        return;
      }
      const pushToken = userData && userData.pushToken;
      if (!pushToken) {
        return; // トークン未登録(通知許可が下りていない/未取得)なら何もしない
      }

      // 相手の表示名を取得(無ければ「誰か」でフォールバック)。
      let recorderName = '誰か';
      try {
        const recorderDoc = await db.doc(`users/${entry.recordedBy}`).get();
        if (recorderDoc.exists && recorderDoc.data().username) {
          recorderName = recorderDoc.data().username;
        }
      } catch (e) {
        // 相手のプロフィール取得に失敗しても通知自体は送る
      }

      // 本文には点数・金額・順位など対局の中身を一切含めない。
      const title = '対局記録が追加されました';
      const body = `${recorderName}さんとの対局記録が追加されました`;

      await messaging.send({
        token: pushToken,
        notification: { title, body },
        data: {
          type: 'auto_recorded_match',
          matchId: event.params.matchId,
        },
        apns: {
          payload: {
            aps: {
              // 通知本文はここでも上と同じものを使う(詳細を含めない)。
              alert: { title, body },
              sound: 'default',
            },
          },
        },
        android: {
          priority: 'high',
        },
      });
    } catch (err) {
      // トークン失効などで送信に失敗しても、関数自体はエラーにせずログのみ残す
      // (Firestoreへの書き込み自体は既に成功しているため、通知失敗で
      // ユーザー体験を損なわないようにする)。
      console.error('notifyOnAutoRecordedMatch failed:', err);
    }
  }
);
