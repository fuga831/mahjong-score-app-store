// このファイルは単体では使えません。
// `npx cap add ios` 後に生成される ios/App/App/AppDelegate.swift に、
// 以下のメソッドを手作業でマージしてください
// (Capacitorの標準テンプレートには既に AppDelegate クラスと空の
// didFinishLaunchingWithOptions 等があるはずなので、そこに追記する形)。
//
// 役割: APNs(Apple Push Notification service)から届いたデバイストークンを
// @capacitor-firebase/messaging プラグイン(内部でFirebase Messaging SDKを使用)に
// 引き渡す。これを行わないと、iOS実機でプッシュ通知のトークンが取得できず
// CloudSync.requestPushPermissionIfNeeded() が pushToken を Firestore に
// 保存できない。

import UIKit
import Capacitor
// FirebaseCore は @capacitor-firebase/authentication or messaging の
// Podspec経由で自動的にリンクされるはずだが、明示的にimportが必要な場合は
// `import FirebaseCore` を追加すること。

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                      didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // FirebaseApp.configure() は @capacitor-firebase/* プラグインが
        // 自動的に呼び出す設計になっているため、通常ここに追記する必要はない。
        // (もしプラグインのREADMEで手動初期化が必要と案内されていた場合のみ、
        //  ここで `FirebaseApp.configure()` を呼ぶこと。)

        // プッシュ通知の許可ダイアログ自体は、JS側(CloudSync.requestPushPermissionIfNeeded)
        // が「同卓者を指定する」操作のタイミングで呼び出す設計になっているため、
        // ここで明示的にリクエストする必要はない。
        application.registerForRemoteNotifications()
        return true
    }

    // MARK: - APNsトークン受信 → Capacitorのプッシュ通知プラグインへ中継

    func application(_ application: UIApplication,
                      didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // CapacitorのPushNotificationsプラグイン(または@capacitor-firebase/messaging内部)が
        // このNotificationCenter通知を購読してAPNsトークンをFirebase Messagingに渡す設計。
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications,
                                         object: deviceToken)
    }

    func application(_ application: UIApplication,
                      didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications,
                                         object: error)
    }

    // フォアグラウンド/バックグラウンドでのプッシュ通知受信も、Capacitor標準の
    // 中継の仕組みに任せる(このアプリ独自のカスタム処理は不要な設計)。
    func application(_ application: UIApplication,
                      didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                      fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        NotificationCenter.default.post(name: .capacitorDidReceiveRemoteNotification,
                                         object: userInfo,
                                         userInfo: [UIApplication.LaunchOptionsKey.remoteNotification: userInfo])
        completionHandler(.newData)
    }

    // MARK: - Google Sign-In / Sign in with Apple のURLコールバック処理

    func application(_ app: UIApplication, open url: URL,
                      options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Google Sign-InはURLスキーム経由でアプリに戻ってくるため、
        // Capacitorの標準ハンドラに委譲する。
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
