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

    // Feedback 管理者APIキー（bin2hex(random_bytes(32)) で生成）。
    // ⚠️ dev / test 環境専用。本番では空文字にし、firebase_project_id による Firebase ログインだけで認証する。
    //    この鍵 1 本で notes / feedback / release-notes / test-cases / export がすべて開くため。
    'feedback_admin_key' => 'CHANGE_ME_BEFORE_DEPLOY',

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
