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
];
