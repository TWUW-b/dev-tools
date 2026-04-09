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
    header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');
}

// OPTIONS リクエスト（プリフライト）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// パス計算（openapi.yaml ルートを env チェック前に処理するため先に算出）
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);
$basePath = dirname($_SERVER['SCRIPT_NAME']);
if ($basePath === '/' || $basePath === '\\') {
    $basePath = '';
}
$relativePath = substr($path, strlen($basePath)) ?: '/';

// GET /openapi.yaml（認証不要、DB 不要）
if ($method === 'GET' && preg_match('#^/openapi\.yaml/?$#', $relativePath)) {
    $yamlPath = __DIR__ . '/openapi.yaml';
    if (!file_exists($yamlPath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'OpenAPI spec not found']);
        exit;
    }
    header_remove('Content-Type');
    header('Content-Type: application/yaml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
    readfile($yamlPath);
    exit;
}

// 依存ファイル読み込み
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/NotesController.php';
require_once __DIR__ . '/TestController.php';
require_once __DIR__ . '/FeedbackController.php';
require_once __DIR__ . '/AttachmentController.php';

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
$uploadDir = $config['upload_dir'] ?? __DIR__ . '/data/attachments';
$feedbackController = new FeedbackController($db, $uploadDir);
$attachmentController = new AttachmentController($db, $uploadDir);

// Feedback 管理者認証
function requireFeedbackAdmin(array $config): void
{
    $adminKey = $config['feedback_admin_key'] ?? null;
    if ($adminKey === null || $adminKey === '') {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Admin key not configured']);
        exit;
    }
    $provided = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
    if (!hash_equals($adminKey, $provided)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }
}

// ルーティング

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

    // GET /notes/{id}/activities
    if ($method === 'GET' && preg_match('#^/notes/(\d+)/activities/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $result = $controller->getActivities($id);
        if (!$result['success']) {
            http_response_code(404);
        }
        echo json_encode($result);
        exit;
    }

    // POST /notes/{id}/activities
    if ($method === 'POST' && preg_match('#^/notes/(\d+)/activities/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $rawInput = file_get_contents('php://input');
        if (strlen($rawInput) > 10240) {
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Request body too large']);
            exit;
        }
        $input = json_decode($rawInput, true) ?? [];
        $result = $controller->addActivity($id, $input);
        http_response_code($result['success'] ? 201 : 400);
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

    // POST /notes/{id}/attachments（multipart/form-data）
    if ($method === 'POST' && preg_match('#^/notes/(\d+)/attachments/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $result = $attachmentController->upload($id);
        http_response_code($result['success'] ? 201 : 400);
        echo json_encode($result);
        exit;
    }

    // GET /notes/{id}/attachments
    if ($method === 'GET' && preg_match('#^/notes/(\d+)/attachments/?$#', $relativePath, $matches)) {
        $id = (int) $matches[1];
        $result = $attachmentController->list($id);
        echo json_encode($result);
        exit;
    }

    // DELETE /notes/{id}/attachments/{aId}
    if ($method === 'DELETE' && preg_match('#^/notes/(\d+)/attachments/(\d+)/?$#', $relativePath, $matches)) {
        $noteId = (int) $matches[1];
        $attachmentId = (int) $matches[2];
        $result = $attachmentController->delete($noteId, $attachmentId);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // GET /attachments/{filename}（バイナリ配信）
    if ($method === 'GET' && preg_match('#^/attachments/([a-f0-9]+\.\w+)/?$#', $relativePath, $matches)) {
        // Content-Type は serve() 内で設定するため、JSON ヘッダーを上書き
        header_remove('Content-Type');
        $attachmentController->serve($matches[1]);
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
        $result = $testController->listCases($_GET);
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

    // GET /export/json
    if ($method === 'GET' && preg_match('#^/export/json/?$#', $relativePath)) {
        $controller->exportJson($env);
        exit;
    }

    // GET /export/sqlite
    if ($method === 'GET' && preg_match('#^/export/sqlite/?$#', $relativePath)) {
        $controller->exportSqlite($dbPath);
        exit;
    }

    // ── Feedback routes ──

    // POST /feedbacks（公開、レート制限あり）
    if ($method === 'POST' && preg_match('#^/feedbacks/?$#', $relativePath)) {
        if (!$feedbackController->checkRateLimit()) {
            http_response_code(429);
            header('Retry-After: 60');
            echo json_encode(['success' => false, 'error' => 'Too many requests']);
            exit;
        }
        $rawInput = file_get_contents('php://input');
        if (strlen($rawInput) > 1048576) {
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Request body too large']);
            exit;
        }
        $input = json_decode($rawInput, true) ?? [];
        $result = $feedbackController->create($input);
        echo json_encode($result);
        exit;
    }

    // GET /feedbacks（管理者）
    if ($method === 'GET' && preg_match('#^/feedbacks/?$#', $relativePath)) {
        requireFeedbackAdmin($config);
        $result = $feedbackController->list($_GET);
        echo json_encode($result);
        exit;
    }

    // GET /feedbacks/export/json（管理者）
    if ($method === 'GET' && preg_match('#^/feedbacks/export/json/?$#', $relativePath)) {
        requireFeedbackAdmin($config);
        $feedbackController->exportJson();
        exit;
    }

    // GET /feedbacks/export/csv（管理者）
    if ($method === 'GET' && preg_match('#^/feedbacks/export/csv/?$#', $relativePath)) {
        requireFeedbackAdmin($config);
        header_remove('Content-Type');
        $feedbackController->exportCsv();
        exit;
    }

    // GET /feedbacks/export/sqlite（管理者）
    if ($method === 'GET' && preg_match('#^/feedbacks/export/sqlite/?$#', $relativePath)) {
        requireFeedbackAdmin($config);
        header_remove('Content-Type');
        $feedbackController->exportSqlite($dbPath);
        exit;
    }

    // GET /feedbacks/{id}（管理者）
    if ($method === 'GET' && preg_match('#^/feedbacks/(\d+)/?$#', $relativePath, $matches)) {
        requireFeedbackAdmin($config);
        $result = $feedbackController->get((int) $matches[1]);
        echo json_encode($result);
        exit;
    }

    // PATCH /feedbacks/{id}/status（管理者）
    if ($method === 'PATCH' && preg_match('#^/feedbacks/(\d+)/status/?$#', $relativePath, $matches)) {
        requireFeedbackAdmin($config);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $result = $feedbackController->updateStatus((int) $matches[1], $input);
        echo json_encode($result);
        exit;
    }

    // POST /feedbacks/{id}/attachments（公開、レート制限あり）
    if ($method === 'POST' && preg_match('#^/feedbacks/(\d+)/attachments/?$#', $relativePath, $matches)) {
        if (!$feedbackController->checkRateLimit()) {
            http_response_code(429);
            header('Retry-After: 60');
            echo json_encode(['success' => false, 'error' => 'Too many requests']);
            exit;
        }
        $result = $feedbackController->uploadAttachment((int) $matches[1]);
        echo json_encode($result);
        exit;
    }

    // GET /feedbacks/{id}/attachments（管理者）
    if ($method === 'GET' && preg_match('#^/feedbacks/(\d+)/attachments/?$#', $relativePath, $matches)) {
        requireFeedbackAdmin($config);
        $result = $feedbackController->listAttachments((int) $matches[1]);
        echo json_encode($result);
        exit;
    }

    // DELETE /feedbacks/{id}/attachments/{aId}（管理者）
    if ($method === 'DELETE' && preg_match('#^/feedbacks/(\d+)/attachments/(\d+)/?$#', $relativePath, $matches)) {
        requireFeedbackAdmin($config);
        $result = $feedbackController->deleteAttachment((int) $matches[1], (int) $matches[2]);
        echo json_encode($result);
        exit;
    }

    // DELETE /feedbacks/{id}（管理者）
    if ($method === 'DELETE' && preg_match('#^/feedbacks/(\d+)/?$#', $relativePath, $matches)) {
        requireFeedbackAdmin($config);
        $result = $feedbackController->delete((int) $matches[1]);
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
