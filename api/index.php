<?php
/**
 * Debug Notes API - Router
 */

declare(strict_types=1);

// エラー表示（本番では無効化）
error_reporting(E_ALL);
ini_set('display_errors', '0');

// 設定読み込み
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'config.php not found']);
    exit;
}

$config = require $configPath;

// CORS 処理
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $config['allowed_origins'] ?? [], true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// OPTIONS リクエスト（プリフライト）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// 依存ファイル読み込み
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/NotesController.php';
require_once __DIR__ . '/TestController.php';

// 環境パラメータ取得
$env = $_GET['env'] ?? 'dev';
if (!in_array($env, ['dev', 'test'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid env parameter']);
    exit;
}

// DB パス取得
$dbPath = $config['db'][$env] ?? null;
if (!$dbPath) {
    http_response_code(500);
    error_log("DB path not configured for env: $env");
    echo json_encode(['success' => false, 'error' => 'Server configuration error']);
    exit;
}

// データベース接続
try {
    $db = new Database($dbPath);
} catch (Exception $e) {
    http_response_code(500);
    error_log('Database connection failed: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// コントローラ初期化
$controller = new NotesController($db);
$testController = new TestController($db, $controller);

// ルーティング
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// パスからベース部分を除去（/__debug/api/notes → /notes）
$basePath = dirname($_SERVER['SCRIPT_NAME']);
if ($basePath === '/' || $basePath === '\\') {
    $basePath = '';
}
$relativePath = substr($path, strlen($basePath)) ?: '/';

try {
    // GET /notes
    if ($method === 'GET' && preg_match('#^/notes/?$#', $relativePath)) {
        $result = $controller->index([
            'status' => $_GET['status'] ?? '',
            'q' => $_GET['q'] ?? '',
            'includeDeleted' => ($_GET['includeDeleted'] ?? '0') === '1',
        ]);
        echo json_encode($result);
        exit;
    }

    // POST /notes
    if ($method === 'POST' && preg_match('#^/notes/?$#', $relativePath)) {
        $rawInput = file_get_contents('php://input');
        if (strlen($rawInput) > 1048576) { // 1MB
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Request body too large']);
            exit;
        }
        $input = json_decode($rawInput, true) ?? [];
        $result = $controller->create($input);
        http_response_code($result['success'] ? 201 : 400);
        echo json_encode($result);
        exit;
    }

    // PATCH /notes/{id}/severity
    if ($method === 'PATCH' && preg_match('#^/notes/(\d+)/severity/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $result = $controller->updateSeverity($id, $input);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // PATCH /notes/{id}/status
    if ($method === 'PATCH' && preg_match('#^/notes/(\d+)/status/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $result = $controller->updateStatus($id, $input);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // GET /notes/{id}
    if ($method === 'GET' && preg_match('#^/notes/(\d+)/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $result = $controller->show($id);
        if (!$result['success']) {
            http_response_code(404);
        }
        echo json_encode($result);
        exit;
    }

    // DELETE /notes/{id}
    if ($method === 'DELETE' && preg_match('#^/notes/(\d+)/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $result = $controller->delete($id);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // POST /test-cases/import
    if ($method === 'POST' && preg_match('#^/test-cases/import/?$#', $relativePath)) {
        $rawInput = file_get_contents('php://input');
        if (strlen($rawInput) > 1048576) {
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Request body too large']);
            exit;
        }
        $input = json_decode($rawInput, true) ?? [];
        $result = $testController->importCases($input);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // GET /test-cases/tree
    if ($method === 'GET' && preg_match('#^/test-cases/tree/?$#', $relativePath)) {
        $result = $testController->tree($env);
        echo json_encode($result);
        exit;
    }

    // DELETE /test-cases
    if ($method === 'DELETE' && preg_match('#^/test-cases/?$#', $relativePath)) {
        $rawInput = file_get_contents('php://input');
        if (strlen($rawInput) > 10240) {
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Request body too large']);
            exit;
        }
        $input = json_decode($rawInput, true) ?? [];
        $result = $testController->deleteCases($input);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // GET /test-cases
    if ($method === 'GET' && preg_match('#^/test-cases/?$#', $relativePath)) {
        $result = $testController->listCases();
        echo json_encode($result);
        exit;
    }

    // POST /test-runs
    if ($method === 'POST' && preg_match('#^/test-runs/?$#', $relativePath)) {
        $rawInput = file_get_contents('php://input');
        if (strlen($rawInput) > 1048576) {
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Request body too large']);
            exit;
        }
        $input = json_decode($rawInput, true) ?? [];
        $result = $testController->submitRuns($env, $input);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // 404
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Not found']);

} catch (Exception $e) {
    http_response_code(500);
    error_log('Unhandled error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}
