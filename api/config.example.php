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

    // Feedback 管理者APIキー（必須。bin2hex(random_bytes(32)) で生成）
    'feedback_admin_key' => 'CHANGE_ME_BEFORE_DEPLOY',

    // Firebase 認証（任意）。設定すると notes/feedback 管理は
    // 「有効な Firebase IDトークン(Authorization: Bearer) OR X-Admin-Key」で許可される。
    // 各アプリの Firebase プロジェクト ID を入れる。null なら X-Admin-Key のみ（後方互換）。
    'firebase_project_id' => null,
    // 公開鍵取得元（通常は既定のまま。テスト/自己ホスト用に差し替え可）:
    // 'firebase_certs_url' => 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
];
