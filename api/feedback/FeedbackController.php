<?php

declare(strict_types=1);

class FeedbackController
{
    private PDO $pdo;

    private const VALID_KINDS = ['bug', 'question', 'request', 'share', 'other'];
    private const VALID_TARGETS = ['app', 'manual'];
    private const VALID_STATUSES = ['open', 'in_progress', 'closed'];
    private const MAX_MESSAGE_LENGTH = 4000;
    private const MAX_CUSTOM_TAG_LENGTH = 50;
    private const MAX_LOG_ENTRIES = 15;
    private const MAX_LOG_JSON_SIZE = 512000; // 500KB
    private const MAX_PAGE_URL_LENGTH = 2000;
    private const MAX_USER_TYPE_LENGTH = 100;
    private const MAX_APP_VERSION_LENGTH = 50;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function create(array $data): array
    {
        // Validate
        $kind = $data['kind'] ?? null;
        if (!in_array($kind, self::VALID_KINDS, true)) {
            return $this->error('Invalid kind', 400);
        }

        $target = $data['target'] ?? null;
        if ($target !== null && !in_array($target, self::VALID_TARGETS, true)) {
            return $this->error('Invalid target', 400);
        }

        $message = trim($data['message'] ?? '');
        if ($message === '' || mb_strlen($message) > self::MAX_MESSAGE_LENGTH) {
            return $this->error('Message is required (max ' . self::MAX_MESSAGE_LENGTH . ' chars)', 400);
        }

        $customTag = $data['customTag'] ?? null;
        if ($customTag !== null && mb_strlen($customTag) > self::MAX_CUSTOM_TAG_LENGTH) {
            return $this->error('Custom tag too long (max ' . self::MAX_CUSTOM_TAG_LENGTH . ' chars)', 400);
        }

        // pageUrl validation
        $pageUrl = $data['pageUrl'] ?? null;
        if ($pageUrl !== null) {
            if (!is_string($pageUrl) || mb_strlen($pageUrl) > self::MAX_PAGE_URL_LENGTH) {
                return $this->error('pageUrl too long (max ' . self::MAX_PAGE_URL_LENGTH . ' chars)', 400);
            }
            if ($pageUrl !== '' && !preg_match('#^https?://#i', $pageUrl)) {
                return $this->error('pageUrl must be a valid HTTP(S) URL', 400);
            }
        }

        // userType validation
        $userType = $data['userType'] ?? null;
        if ($userType !== null && (!is_string($userType) || mb_strlen($userType) > self::MAX_USER_TYPE_LENGTH)) {
            return $this->error('userType too long (max ' . self::MAX_USER_TYPE_LENGTH . ' chars)', 400);
        }

        // appVersion validation
        $appVersion = $data['appVersion'] ?? null;
        if ($appVersion !== null && (!is_string($appVersion) || mb_strlen($appVersion) > self::MAX_APP_VERSION_LENGTH)) {
            return $this->error('appVersion too long (max ' . self::MAX_APP_VERSION_LENGTH . ' chars)', 400);
        }

        $consoleLogs = $data['consoleLogs'] ?? null;
        if ($consoleLogs !== null) {
            if (!is_array($consoleLogs)) {
                return $this->error('consoleLogs must be an array', 400);
            }
            if (count($consoleLogs) > self::MAX_LOG_ENTRIES) {
                $consoleLogs = array_slice($consoleLogs, -self::MAX_LOG_ENTRIES);
            }
            $consoleJson = json_encode($consoleLogs);
            if ($consoleJson === false) {
                return $this->error('consoleLogs contains invalid data', 400);
            }
            if (strlen($consoleJson) > self::MAX_LOG_JSON_SIZE) {
                return $this->error('consoleLogs JSON too large (max 500KB)', 400);
            }
        }

        $networkLogs = $data['networkLogs'] ?? null;
        if ($networkLogs !== null) {
            if (!is_array($networkLogs)) {
                return $this->error('networkLogs must be an array', 400);
            }
            if (count($networkLogs) > self::MAX_LOG_ENTRIES) {
                $networkLogs = array_slice($networkLogs, -self::MAX_LOG_ENTRIES);
            }
            $networkJson = json_encode($networkLogs);
            if ($networkJson === false) {
                return $this->error('networkLogs contains invalid data', 400);
            }
            if (strlen($networkJson) > self::MAX_LOG_JSON_SIZE) {
                return $this->error('networkLogs JSON too large (max 500KB)', 400);
            }
        }

        $environment = $data['environment'] ?? null;
        $envJson = null;
        if ($environment !== null) {
            $envJson = json_encode($environment);
            if ($envJson === false) {
                return $this->error('environment contains invalid data', 400);
            }
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO feedbacks (kind, target, custom_tag, message, page_url, user_type, environment, app_version, console_log, network_log)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $kind,
            $target,
            $customTag,
            $message,
            $pageUrl,
            $userType,
            $envJson,
            $appVersion,
            $consoleLogs !== null ? json_encode($consoleLogs) : null,
            $networkLogs !== null ? json_encode($networkLogs) : null,
        ]);

        $id = (int) $this->pdo->lastInsertId();
        $row = $this->findById($id);

        http_response_code(201);
        return ['success' => true, 'data' => $this->formatRow($row, false)];
    }

    public function list(array $params): array
    {
        $where = [];
        $binds = [];

        if (!empty($params['status']) && in_array($params['status'], self::VALID_STATUSES, true)) {
            $where[] = 'status = ?';
            $binds[] = $params['status'];
        }
        if (!empty($params['kind']) && in_array($params['kind'], self::VALID_KINDS, true)) {
            $where[] = 'kind = ?';
            $binds[] = $params['kind'];
        }
        if (!empty($params['target']) && in_array($params['target'], self::VALID_TARGETS, true)) {
            $where[] = 'target = ?';
            $binds[] = $params['target'];
        }
        if (!empty($params['custom_tag'])) {
            $where[] = 'custom_tag = ?';
            $binds[] = $params['custom_tag'];
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        // Count
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM feedbacks $whereClause");
        $countStmt->execute($binds);
        $total = (int) $countStmt->fetchColumn();

        // Paginate
        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $stmt = $this->pdo->prepare("SELECT * FROM feedbacks $whereClause ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([...$binds, $limit, $offset]);
        $rows = $stmt->fetchAll();

        // Custom tags list
        $tagsStmt = $this->pdo->query("SELECT DISTINCT custom_tag FROM feedbacks WHERE custom_tag IS NOT NULL AND custom_tag != '' ORDER BY custom_tag");
        $customTags = $tagsStmt->fetchAll(PDO::FETCH_COLUMN);

        return [
            'success' => true,
            'data' => array_map(fn($r) => $this->formatRow($r, false), $rows),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'customTags' => $customTags,
        ];
    }

    public function get(int $id): array
    {
        $row = $this->findById($id);
        if (!$row) {
            return $this->error('Not found', 404);
        }
        return ['success' => true, 'data' => $this->formatRow($row, true)];
    }

    public function updateStatus(int $id, array $data): array
    {
        $status = $data['status'] ?? null;
        if (!in_array($status, self::VALID_STATUSES, true)) {
            return $this->error('Invalid status', 400);
        }

        $row = $this->findById($id);
        if (!$row) {
            return $this->error('Not found', 404);
        }

        $stmt = $this->pdo->prepare("UPDATE feedbacks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$status, $id]);

        // Re-fetch to return actual DB timestamp
        $updated = $this->findById($id);

        return [
            'success' => true,
            'data' => [
                'id' => $id,
                'status' => $status,
                'updatedAt' => $updated['updated_at'],
            ],
        ];
    }

    public function delete(int $id): array
    {
        $row = $this->findById($id);
        if (!$row) {
            return $this->error('Not found', 404);
        }

        $stmt = $this->pdo->prepare("DELETE FROM feedbacks WHERE id = ?");
        $stmt->execute([$id]);

        return ['success' => true];
    }

    private function findById(int $id): array|false
    {
        $stmt = $this->pdo->prepare("SELECT * FROM feedbacks WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    private function formatRow(array $row, bool $full): array
    {
        $result = [
            'id' => (int) $row['id'],
            'kind' => $row['kind'],
            'target' => $row['target'],
            'customTag' => $row['custom_tag'],
            'message' => $row['message'],
            'status' => $row['status'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];

        if ($full) {
            $result['pageUrl'] = $row['page_url'];
            $result['userType'] = $row['user_type'];
            $result['environment'] = $row['environment'] ? json_decode($row['environment'], true) : null;
            $result['appVersion'] = $row['app_version'];
            $result['consoleLogs'] = $row['console_log'] ? json_decode($row['console_log'], true) : null;
            $result['networkLogs'] = $row['network_log'] ? json_decode($row['network_log'], true) : null;
        }

        return $result;
    }

    private function error(string $message, int $code): array
    {
        http_response_code($code);
        return ['success' => false, 'error' => $message];
    }
}
