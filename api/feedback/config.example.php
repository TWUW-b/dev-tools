<?php
return [
    // SQLiteファイルパス
    'db' => __DIR__ . '/data/feedback.sqlite',

    // CORS許可オリジン
    'allowed_origins' => [
        'http://localhost:5173',
        // 'https://your-domain.com',
    ],

    // 管理者APIキー（必須。デプロイ前に必ず設定すること）
    // 例: bin2hex(random_bytes(32)) で生成
    'admin_key' => 'CHANGE_ME_BEFORE_DEPLOY',
];
