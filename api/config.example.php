<?php
/**
 * Debug Notes API - Configuration
 *
 * このファイルをコピーして config.php を作成し、環境に合わせて編集してください。
 * config.php は .gitignore で除外されています。
 */

return [
    // SQLite ファイルのパス（環境ごとに分離）
    'db' => [
        'dev'  => __DIR__ . '/data/debug-dev.sqlite',
        'test' => __DIR__ . '/data/debug-test.sqlite',
    ],

    // CORS 許可オリジン
    'allowed_origins' => [
        'http://localhost:5173',  // Vite 開発サーバー
        'http://localhost:3000',
        // 本番環境のドメインを追加
        // 'https://dev.example.com',
        // 'https://test.example.com',
    ],

    // API キー（Phase1 では未使用）
    'api_key' => null,

    // 全範囲の管理キー（bin2hex(random_bytes(32)) で生成）。
    // ⚠️ dev / test 環境専用。本番では空文字にし、人は firebase_project_id による Firebase ログイン、
    //    機械は下の admin_keys（範囲付きの鍵）で認証する。
    //    この鍵 1 本で notes / feedback / release-notes / test-cases / export がすべて開くため。
    'feedback_admin_key' => 'CHANGE_ME_BEFORE_DEPLOY',

    // 範囲付きの管理キー（任意・v1.7.0+）。X-Admin-Key で送る。鍵ごとに通る範囲を限る。
    //   notes         … /notes*、/export/json（notes の書き出し）
    //   test-cases    … /test-cases*、/test-runs*（failNote を付けると notes も起票される）
    //   feedbacks     … /feedbacks の管理系（json / csv の書き出しを含む）
    //   release-notes … /release-notes の管理系（号の作成・メディアの投入・公開）
    //   manual        … /manual の管理系（マニュアル画像）
    //   '*'           … 全範囲（feedback_admin_key と同じ）
    // DB ファイル丸ごとの書き出し（/export/sqlite・/feedbacks/export/sqlite）は全範囲の鍵か Firebase ログインだけ。
    // 範囲外を叩くと 403。知らない範囲名を含む鍵は丸ごと無効になる（書き間違いで広く開かないように）。
    // 値はコードに書かず、サーバーの環境変数から読む。ブラウザ用の鍵（VITE_DEBUG_ADMIN_KEY）と同じ値にしない。
    // 'admin_keys' => [
    //     ['name' => 'release-notes-pusher', 'key' => getenv('DEVTOOLS_RELEASE_NOTES_KEY') ?: '', 'scopes' => ['release-notes']],
    // ],

    // リリースノートのメディア保存先（任意）。既定は api/data/release-notes。
    // 画像に加えて動画を置くため、notes/feedback の添付とはディレクトリを分けている。
    // 'release_notes_dir' => __DIR__ . '/data/release-notes',

    // リリースノートのメディア上限（任意・バイト。既定 50MB）。
    // 動作の変化は動画でしか示せないため、静止画前提の 5MB では足りない。
    // ここを上げるだけでは足りず、PHP の upload_max_filesize / post_max_size も
    // 同等以上にする必要がある（超えると $_FILES が空で飛んでくる）。
    // 'release_notes_max_upload' => 52428800,

    // リリースノートの各変更に紐付けた報告（feedback / note）を、アプリ内で開く URL（任意）。
    // {id} が報告の ID に置き換わる。社内向け（アプリ内・internal の公開ページ）にだけ出る。
    // 公開ページは API のオリジンで開くため、アプリのオリジンを含む絶対 URL で書く。
    // DebugAdmin（/__admin）は ?note= と ?feedback=、FeedbackAdmin は ?feedback= で該当項目を開く。
    // 'release_notes_source_urls' => [
    //     'feedback' => 'https://app.example.com/__admin?feedback={id}',
    //     'note' => 'https://app.example.com/__admin?note={id}',
    // ],

    // マニュアル画像の保存先（任意）。既定は api/data/manual-media。
    // 'manual_media_dir' => __DIR__ . '/data/manual-media',

    // マニュアル画像の合計容量上限（任意・バイト。既定 500MB）。
    // manual_item_id は実在チェックができない（ホストアプリが持つ ManualItem に
    // DB 上の実体が無いため）。項目単位の30枚上限だけでは、新しい manual_item_id を
    // 名乗って POST するだけで際限なく容量を確保できてしまうため、全 item 横断の
    // 合計サイズにも上限を設けている。GET /manual/items で現在の内訳を確認できる。
    // 'manual_media_max_total_size' => 524288000,

    // Firebase 認証（任意）。設定すると notes/feedback 管理は
    // 「有効な Firebase IDトークン(Authorization: Bearer) OR X-Admin-Key」で許可される。
    // 各アプリの Firebase プロジェクト ID を入れる。null なら X-Admin-Key のみ（後方互換）。
    'firebase_project_id' => null,
    // 公開鍵取得元（通常は既定のまま。テスト/自己ホスト用に差し替え可）:
    // 'firebase_certs_url' => 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
];
