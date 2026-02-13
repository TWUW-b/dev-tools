<?php

declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Config
$config = file_exists(__DIR__ . '/config.php')
    ? require __DIR__ . '/config.php'
    : [
        'db' => __DIR__ . '/data/feedback.sqlite',
        'allowed_origins' => ['http://localhost:5173'],
        'admin_key' => null,
    ];

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $config['allowed_origins'] ?? [], true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');
} elseif ($origin !== '') {
    // Origin不一致時はCORSヘッダなしで即座に拒否
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Origin not allowed']);
    exit;
}

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Request size limit (1MB)
$rawInput = file_get_contents('php://input');
if ($rawInput !== false && strlen($rawInput) > 1048576) {
    http_response_code(413);
    echo json_encode(['success' => false, 'error' => 'Request too large']);
    exit;
}

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/FeedbackController.php';

// Auth helper
function requireAdmin(array $config): void
{
    $adminKey = $config['admin_key'] ?? null;
    if ($adminKey === null || $adminKey === '') {
        error_log('Feedback API: admin_key is not configured. Admin access denied.');
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

// Rate limiting helper (IP-based, SQLite)
function checkRateLimit(PDO $pdo, int $maxRequests = 10, int $windowSeconds = 60): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    $windowStart = $now - $windowSeconds;

    // Cleanup old entries
    $pdo->prepare("DELETE FROM rate_limits WHERE expires_at < ?")->execute([$now]);

    // Count recent requests
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM rate_limits WHERE ip = ? AND created_at > ?");
    $stmt->execute([$ip, $windowStart]);
    $count = (int) $stmt->fetchColumn();

    if ($count >= $maxRequests) {
        http_response_code(429);
        header('Retry-After: ' . $windowSeconds);
        echo json_encode(['success' => false, 'error' => 'Too many requests']);
        exit;
    }

    // Record this request
    $stmt = $pdo->prepare("INSERT INTO rate_limits (ip, created_at, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$ip, $now, $now + $windowSeconds]);
}

// Origin validation for POST (server-side, not relying on CORS alone)
function validateOriginForPost(array $config): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    // Allow requests without Origin header (e.g., same-origin, non-browser clients are blocked by other means)
    if ($origin === '') {
        return;
    }
    if (!in_array($origin, $config['allowed_origins'] ?? [], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Origin not allowed']);
        exit;
    }
}

// Routing
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);

// Strip base path (e.g. /__feedback/api)
// The .htaccess rewrites to index.php, so we parse relative to script location
$basePath = dirname($_SERVER['SCRIPT_NAME']);
$route = substr($path, strlen($basePath));
$route = '/' . ltrim($route, '/');

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = new Database($config['db'] ?? __DIR__ . '/data/feedback.sqlite');
    $controller = new FeedbackController($db->getPdo());

    // POST /feedbacks
    if ($method === 'POST' && $route === '/feedbacks') {
        validateOriginForPost($config);
        checkRateLimit($db->getPdo());
        $data = json_decode($rawInput ?: '{}', true) ?? [];
        $result = $controller->create($data);
        echo json_encode($result);
        exit;
    }

    // GET /feedbacks
    if ($method === 'GET' && $route === '/feedbacks') {
        requireAdmin($config);
        $result = $controller->list($_GET);
        echo json_encode($result);
        exit;
    }

    // GET /feedbacks/:id
    if ($method === 'GET' && preg_match('#^/feedbacks/(\d+)$#', $route, $m)) {
        requireAdmin($config);
        $result = $controller->get((int) $m[1]);
        echo json_encode($result);
        exit;
    }

    // PATCH /feedbacks/:id/status
    if ($method === 'PATCH' && preg_match('#^/feedbacks/(\d+)/status$#', $route, $m)) {
        requireAdmin($config);
        $data = json_decode($rawInput ?: '{}', true) ?? [];
        $result = $controller->updateStatus((int) $m[1], $data);
        echo json_encode($result);
        exit;
    }

    // DELETE /feedbacks/:id
    if ($method === 'DELETE' && preg_match('#^/feedbacks/(\d+)$#', $route, $m)) {
        requireAdmin($config);
        $result = $controller->delete((int) $m[1]);
        echo json_encode($result);
        exit;
    }

    // 404
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Not found']);
} catch (Throwable $e) {
    error_log('Feedback API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}
