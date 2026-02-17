<?php
/**
 * PHP built-in server router
 * Docker 開発環境でのみ使用（本番 Apache は .htaccess で制御）
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// openapi.yaml → index.php 経由（CORS ヘッダー付与のため）
if (preg_match('#/openapi\.yaml$#', $uri)) {
    require __DIR__ . '/index.php';
    return true;
}

// 実ファイルは直接配信
if ($uri !== '/' && file_exists(__DIR__ . $uri) && is_file(__DIR__ . $uri)) {
    return false;
}

// それ以外 → index.php
require __DIR__ . '/index.php';
return true;
