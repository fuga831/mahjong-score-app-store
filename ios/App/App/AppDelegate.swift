import UIKit
import Capacitor
import FirebaseAuth

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 未捕捉のNSExceptionが原因で起動直後にクラッシュする問題の調査用。
        // NSExceptionはSwiftのdo-catchでは捕捉できない(Swift Errorとは別物)ため、
        // ここで例外のname/reason/callStackSymbolsをNSLogに残し、次のクラッシュ時に
        // デバイスのコンソールログ(Xcode > Window > Devices and Simulators、または
        // Console.app)から実際の例外理由を確認できるようにする。abort()自体は
        // 防げないので、これはロギングのみの目的。
        NSSetUncaughtExceptionHandler { exception in
            NSLog("[UncaughtException] name=%@ reason=%@ userInfo=%@\nStack:\n%@",
                  exception.name.rawValue,
                  exception.reason ?? "(no reason)",
                  String(describing: exception.userInfo ?? [:]),
                  exception.callStackSymbols.joined(separator: "\n"))
        }
        NSLog("[AppLifecycle] didFinishLaunchingWithOptions: start")
        // Override point for customization after application launch.
        application.registerForRemoteNotifications()
        NSLog("[AppLifecycle] didFinishLaunchingWithOptions: end")
        return true
    }

    // MARK: - APNsトークン受信 → Capacitorのプッシュ通知プラグインへ中継

    func application(_ application: UIApplication,
                      didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications,
                                         object: deviceToken)
    }

    func application(_ application: UIApplication,
                      didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications,
                                         object: error)
    }

    func application(_ application: UIApplication,
                      didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                      fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        // `.capacitorDidReceiveRemoteNotification` はCapacitor本体には存在しない
        // (実在するのは capacitorDidRegisterForRemoteNotifications と
        // capacitorDidFailToRegisterForRemoteNotifications のみ)。
        // @capacitor-firebase/messaging公式ドキュメントの実装に合わせ、
        // 生の文字列名の通知として中継する(completionHandlerはプラグイン側が
        // 呼び出すため、ここでは呼ばない)。
        NotificationCenter.default.post(name: Notification.Name("didReceiveRemoteNotification"),
                                         object: completionHandler,
                                         userInfo: userInfo)
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // @capacitor-firebase/messagingを@capacitor-firebase/authenticationと
        // 併用する場合に公式READMEが要求している対応(Google/Appleサインインの
        // コールバックURLをFirebase Authに先に処理させる)。これが無いと、
        // サインインのコールバックURLがCapacitorのURLハンドラに渡ってしまい、
        // サインインが正しく完了しない。
        if Auth.auth().canHandle(url) {
            return true
        }
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
