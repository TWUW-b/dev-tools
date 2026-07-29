<?php
/**
 * Debug Notes API - Release Notes Controller（@TWUWB-003）
 *
 * notes / feedbacks が「報告を集める」側なのに対し、こちらは「直したことを利用者に知らせる」側。
 * 直した結果を利用者が知る手段が無いと、報告者から見て改修は起きていないのと同じになる。
 *
 * 3つの読者に対して3つの面を出す:
 *   - クライアント（非ログイン） … publicPage() が返す単独 HTML。URL を送るだけで読める
 *   - アプリの利用者            … feed() の JSON を React コンポーネントが描く
 *   - 開発側                    … 管理系メソッド（X-Admin-Key / Firebase 認証の内側）
 *
 * 実装上の落とし穴は参照実装(Requirement Hub REQUIR-178)で実際に踏んだものを潰してある。
 * いずれも curl では通ってしまい、ブラウザで開いて初めて分かる類のもの:
 *   1. <img>/<video> は Authorization を送れない → 配信は URL 中のトークンで行う
 *   2. 動画は Range(206) 未対応だと再生開始もシークもできない
 *   3. Content-Type が application/octet-stream だと <video> で描けない → 拡張子で補う
 *   4. 動画は #t=0.1 を付けないと再生前が真っ黒な箱になる（表示側で対応）
 *   5. ソフト削除だけだとメディアの実体が孤児として残る → 削除時に実体も消す
 */

declare(strict_types=1);

class ReleaseNotesController
{
    /** 公開 URL 用トークン（status=published かつ is_public=1 のみ見える） */
    public const SCOPE_PUBLIC = 'public';
    /** アプリ内表示用トークン（status=published を全件見せる。社内向けの号を含む） */
    public const SCOPE_INTERNAL = 'internal';

    private const META_KEY = [
        self::SCOPE_PUBLIC => 'releaseNotesTokenPublic',
        self::SCOPE_INTERNAL => 'releaseNotesTokenInternal',
    ];

    private const CATEGORIES = ['fix', 'improve', 'feature'];

    /** 1号あたりのメディア数上限。 */
    private const MAX_MEDIA_PER_NOTE = 30;

    /**
     * 許可する MIME。
     * 動画を含めるのは必須。「操作したら何が変わるか」は静止画では示せない。
     * SVG はスクリプトを埋め込めるため意図的に除外している。
     */
    private const ALLOWED_MIME = [
        'image/png' => '.png',
        'image/jpeg' => '.jpg',
        'image/webp' => '.webp',
        'image/gif' => '.gif',
        'video/mp4' => '.mp4',
        'video/webm' => '.webm',
        'video/quicktime' => '.mov',
    ];

    /** 送信側が Content-Type を誤ったときに拡張子から補うための対応表。 */
    private const EXT_MIME = [
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'mov' => 'video/quicktime',
    ];

    private Database $db;
    private string $mediaDir;
    private int $maxUploadSize;

    /** メディア配信 URL の前置き（例: /__debug/api/release-notes/media/）。index.php が組む。 */
    private string $mediaUrlBase = '';
    /** 公開ページ URL の前置き（例: /__debug/api/release-notes/p/）。 */
    private string $pageUrlBase = '';
    /** JSON フィード URL の前置き（例: /__debug/api/release-notes/feed/）。 */
    private string $feedUrlBase = '';
    /** env=test 等を引き継ぐためのクエリ（例: '?env=test'。dev なら空文字）。 */
    private string $urlQuery = '';

    public function __construct(Database $db, string $mediaDir, int $maxUploadSize = 52428800)
    {
        $this->db = $db;
        $this->mediaDir = rtrim($mediaDir, '/');
        $this->maxUploadSize = $maxUploadSize;

        if (!is_dir($this->mediaDir)) {
            mkdir($this->mediaDir, 0755, true);
        }
    }

    /**
     * URL の組み立て情報を注入する。
     * 統合先ごとにベースパスが違う（/__debug/api など）ため、ルーター側で算出したものを渡す。
     */
    public function setUrlContext(string $apiBasePath, string $env): void
    {
        $base = rtrim($apiBasePath, '/');
        $this->mediaUrlBase = $base . '/release-notes/media/';
        $this->pageUrlBase = $base . '/release-notes/p/';
        $this->feedUrlBase = $base . '/release-notes/feed/';
        // 既定 env は dev。クライアントに渡す URL を無駄に長くしないため dev では付けない。
        $this->urlQuery = $env === 'dev' ? '' : ('?env=' . rawurlencode($env));
    }

    // ── トークン ────────────────────────────────────────────────────────────

    /**
     * スコープのトークンを取得する（無ければ生成して保存）。
     */
    private function token(string $scope): string
    {
        $key = self::META_KEY[$scope] ?? null;
        if ($key === null) {
            throw new InvalidArgumentException('Unknown scope');
        }
        $cur = $this->db->getMeta($key);
        if (is_string($cur) && $cur !== '') {
            return $cur;
        }
        $token = bin2hex(random_bytes(24));
        $this->db->setMeta($key, $token);
        return $token;
    }

    /**
     * 2本のトークンと、それぞれの URL を返す（管理用）。
     */
    public function tokens(): array
    {
        $pub = $this->token(self::SCOPE_PUBLIC);
        $int = $this->token(self::SCOPE_INTERNAL);
        return [
            'success' => true,
            'data' => [
                'public' => [
                    'token' => $pub,
                    'pageUrl' => $this->pageUrlBase . $pub . $this->urlQuery,
                    'feedUrl' => $this->feedUrl($pub),
                ],
                'internal' => [
                    'token' => $int,
                    'pageUrl' => $this->pageUrlBase . $int . $this->urlQuery,
                    'feedUrl' => $this->feedUrl($int),
                ],
            ],
        ];
    }

    private function feedUrl(string $token): string
    {
        return $this->feedUrlBase . $token . $this->urlQuery;
    }

    /**
     * トークンを作り直す。漏れたときの失効手段。
     */
    public function rotateToken(string $scope): array
    {
        if (!isset(self::META_KEY[$scope])) {
            return ['success' => false, 'error' => 'scope must be public or internal'];
        }
        $this->db->setMeta(self::META_KEY[$scope], bin2hex(random_bytes(24)));
        return $this->tokens();
    }

    /**
     * トークンからスコープを判定する（該当なしは null）。
     * 総当たり比較を避けるため hash_equals を使う。
     */
    private function scopeOf(string $token): ?string
    {
        if ($token === '' || preg_match('/^[a-f0-9]{32,}$/', $token) !== 1) {
            return null;
        }
        foreach (self::META_KEY as $scope => $key) {
            $stored = $this->db->getMeta($key);
            if (is_string($stored) && $stored !== '' && hash_equals($stored, $token)) {
                return $scope;
            }
        }
        return null;
    }

    // ── 参照 ────────────────────────────────────────────────────────────────

    /**
     * 管理用の一覧。下書きも含めて全件返す。
     * 投入側(feedback-fix)はこれを叩いて「もう告知した報告」を突き合わせる。
     */
    public function index(): array
    {
        return ['success' => true, 'data' => $this->collect(null)];
    }

    /**
     * 公開/アプリ内向けの一覧（トークンのスコープで絞る）。
     */
    public function feed(string $token): array
    {
        $scope = $this->scopeOf($token);
        if ($scope === null) {
            return ['success' => false, 'error' => 'Not found'];
        }
        return ['success' => true, 'scope' => $scope, 'data' => $this->collect($scope)];
    }

    /**
     * 号 + 項目 + メディアを組み立てる。
     *
     * @param string|null $scope null なら全件（管理用）
     */
    private function collect(?string $scope): array
    {
        $where = 'deleted_at IS NULL';
        if ($scope === self::SCOPE_PUBLIC) {
            $where .= " AND status = 'published' AND is_public = 1";
        } elseif ($scope === self::SCOPE_INTERNAL) {
            $where .= " AND status = 'published'";
        }

        $notes = $this->db->query(
            "SELECT * FROM release_notes WHERE $where ORDER BY released_on DESC, id DESC"
        );
        if (!$notes) {
            return [];
        }

        $ids = array_map(static fn($n) => (int) $n['id'], $notes);
        $ph = implode(',', array_fill(0, count($ids), '?'));

        $items = $this->db->query(
            "SELECT * FROM release_note_items WHERE release_note_id IN ($ph) ORDER BY sort_order, id",
            $ids
        );
        $images = $this->db->query(
            "SELECT * FROM release_note_images WHERE release_note_id IN ($ph) ORDER BY sort_order, id",
            $ids
        );

        // 「前回（○月○日 第N号）からの変更」を画面が出せるように、参照先の最小情報を添える。
        // 参照先が絞り込みで落ちている場合もあるため、元の全件から引く。
        $allNotes = $this->db->query('SELECT id, version, released_on FROM release_notes WHERE deleted_at IS NULL');
        $byId = [];
        foreach ($allNotes as $n) {
            $byId[(int) $n['id']] = $n;
        }

        $out = [];
        foreach ($notes as $n) {
            $id = (int) $n['id'];
            $prevId = $n['previous_release_id'] === null ? null : (int) $n['previous_release_id'];
            $prev = ($prevId !== null && isset($byId[$prevId])) ? $byId[$prevId] : null;

            $out[] = [
                'id' => $id,
                'version' => $n['version'],
                'title' => $n['title'],
                'summary' => $n['summary'],
                'released_on' => $n['released_on'],
                'previous_release_id' => $prevId,
                'previous' => $prev === null ? null : [
                    'id' => (int) $prev['id'],
                    'version' => $prev['version'],
                    'released_on' => $prev['released_on'],
                ],
                'cover_image_id' => $n['cover_image_id'] === null ? null : (int) $n['cover_image_id'],
                'status' => $n['status'],
                'is_public' => (int) $n['is_public'] === 1,
                'created_at' => Database::toJstIso($n['created_at']),
                'updated_at' => Database::toJstIso($n['updated_at']),
                'items' => array_values(array_map(
                    fn($i) => $this->formatItem($i),
                    array_filter($items, static fn($i) => (int) $i['release_note_id'] === $id)
                )),
                'images' => array_values(array_map(
                    fn($im) => $this->formatImage($im),
                    array_filter($images, static fn($im) => (int) $im['release_note_id'] === $id)
                )),
            ];
        }
        return $out;
    }

    private function formatItem(array $i): array
    {
        return [
            'id' => (int) $i['id'],
            'release_note_id' => (int) $i['release_note_id'],
            'sort_order' => (int) $i['sort_order'],
            'category' => $i['category'],
            'headline' => $i['headline'],
            'where_text' => $i['where_text'],
            'before_text' => $i['before_text'],
            'after_text' => $i['after_text'],
            'feedback_id' => $i['feedback_id'] === null ? null : (int) $i['feedback_id'],
        ];
    }

    /**
     * 表示用に整形する。**token 自体は返さず url に埋めて返す**
     * （トークンは配信専用で、それ以外の用途を持たせない）。
     */
    private function formatImage(array $im): array
    {
        return [
            'id' => (int) $im['id'],
            'release_note_id' => (int) $im['release_note_id'],
            'item_id' => $im['item_id'] === null ? null : (int) $im['item_id'],
            'original_name' => $im['original_name'],
            'mime_type' => $im['mime_type'],
            'size' => (int) $im['size'],
            'caption' => $im['caption'],
            'sort_order' => (int) $im['sort_order'],
            'url' => $this->mediaUrlBase . $im['token'] . $this->urlQuery,
        ];
    }

    // ── 更新（管理） ─────────────────────────────────────────────────────────

    public function create(array $input): array
    {
        $version = trim((string) ($input['version'] ?? ''));
        $title = trim((string) ($input['title'] ?? ''));
        $releasedOn = trim((string) ($input['released_on'] ?? ''));

        if ($version === '') {
            return ['success' => false, 'error' => 'version は必須です'];
        }
        if ($title === '') {
            return ['success' => false, 'error' => 'title は必須です'];
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $releasedOn) !== 1) {
            return ['success' => false, 'error' => 'released_on は YYYY-MM-DD で指定してください'];
        }

        // previous_release_id の指定が無ければ公開日から直前の号を自動で選ぶ。
        // これが「前回（○月○日 第N号）からの変更」の表示根拠になる。
        $prev = $input['previous_release_id'] ?? null;
        if ($prev === null) {
            $row = $this->db->fetchOne(
                'SELECT id FROM release_notes WHERE deleted_at IS NULL AND released_on < ? ORDER BY released_on DESC, id DESC LIMIT 1',
                [$releasedOn]
            );
            $prev = $row === null ? null : (int) $row['id'];
        } else {
            $prev = (int) $prev;
        }

        $status = ($input['status'] ?? '') === 'published' ? 'published' : 'draft';
        // 社外公開は明示的に true を渡したときだけ。既定は非公開。
        $isPublic = $this->truthy($input['is_public'] ?? false) ? 1 : 0;

        $this->db->execute(
            'INSERT INTO release_notes (version, title, summary, released_on, previous_release_id, status, is_public)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                $version,
                $title,
                isset($input['summary']) && is_string($input['summary']) ? $input['summary'] : null,
                $releasedOn,
                $prev,
                $status,
                $isPublic,
            ]
        );

        return ['success' => true, 'data' => $this->show((int) $this->db->lastInsertId())];
    }

    public function update(int $id, array $input): array
    {
        $cur = $this->db->fetchOne('SELECT * FROM release_notes WHERE id = ? AND deleted_at IS NULL', [$id]);
        if ($cur === null) {
            return ['success' => false, 'error' => 'Not found'];
        }

        $fields = [];
        $binds = [];

        foreach (['version', 'title', 'summary', 'released_on'] as $key) {
            if (array_key_exists($key, $input)) {
                $val = $input[$key];
                if ($key === 'released_on' && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $val) !== 1) {
                    return ['success' => false, 'error' => 'released_on は YYYY-MM-DD で指定してください'];
                }
                $fields[] = "$key = ?";
                $binds[] = $val === null ? null : (string) $val;
            }
        }
        if (array_key_exists('status', $input)) {
            if (!in_array($input['status'], ['draft', 'published'], true)) {
                return ['success' => false, 'error' => 'status は draft か published です'];
            }
            $fields[] = 'status = ?';
            $binds[] = $input['status'];
        }
        if (array_key_exists('is_public', $input)) {
            $fields[] = 'is_public = ?';
            $binds[] = $this->truthy($input['is_public']) ? 1 : 0;
        }
        foreach (['previous_release_id', 'cover_image_id'] as $key) {
            if (array_key_exists($key, $input)) {
                $fields[] = "$key = ?";
                $binds[] = $input[$key] === null ? null : (int) $input[$key];
            }
        }

        if (!$fields) {
            return ['success' => false, 'error' => '更新する項目がありません'];
        }

        $fields[] = 'updated_at = CURRENT_TIMESTAMP';
        $binds[] = $id;
        $this->db->execute('UPDATE release_notes SET ' . implode(', ', $fields) . ' WHERE id = ?', $binds);

        return ['success' => true, 'data' => $this->show($id)];
    }

    /**
     * 号を削除する。
     *
     * 論理削除だけにするとメディアの実体が残る（参照実装で実際に孤児の mp4 が残った）。
     * 復元手段を用意していない以上、実体を残す理由が無いのでここで片付ける。
     */
    public function delete(int $id): array
    {
        $cur = $this->db->fetchOne('SELECT id FROM release_notes WHERE id = ? AND deleted_at IS NULL', [$id]);
        if ($cur === null) {
            return ['success' => false, 'error' => 'Not found'];
        }

        $images = $this->db->query('SELECT stored_name FROM release_note_images WHERE release_note_id = ?', [$id]);

        $this->db->beginTransaction();
        try {
            $this->db->execute('UPDATE release_notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [$id]);
            $this->db->execute('DELETE FROM release_note_images WHERE release_note_id = ?', [$id]);
            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }

        // DB を確定させてからファイルを消す（逆順だと DB 失敗時にファイルだけ消える）。
        $dir = $this->noteDir($id);
        foreach ($images as $im) {
            $path = $dir . '/' . $im['stored_name'];
            if (is_file($path)) {
                @unlink($path);
            }
        }
        if (is_dir($dir)) {
            @rmdir($dir);
        }

        return ['success' => true];
    }

    public function addItem(int $noteId, array $input): array
    {
        if (!$this->noteExists($noteId)) {
            return ['success' => false, 'error' => 'Not found'];
        }
        $headline = trim((string) ($input['headline'] ?? ''));
        if ($headline === '') {
            return ['success' => false, 'error' => 'headline は必須です'];
        }
        $category = in_array($input['category'] ?? '', self::CATEGORIES, true) ? $input['category'] : 'fix';

        $order = $input['sort_order'] ?? null;
        if (!is_int($order)) {
            $row = $this->db->fetchOne(
                'SELECT COALESCE(MAX(sort_order), -1) AS m FROM release_note_items WHERE release_note_id = ?',
                [$noteId]
            );
            $order = ((int) ($row['m'] ?? -1)) + 1;
        }

        $this->db->execute(
            'INSERT INTO release_note_items
                (release_note_id, sort_order, category, headline, where_text, before_text, after_text, feedback_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $noteId,
                $order,
                $category,
                $headline,
                $this->nullableText($input['where_text'] ?? null),
                $this->nullableText($input['before_text'] ?? null),
                $this->nullableText($input['after_text'] ?? null),
                isset($input['feedback_id']) && is_numeric($input['feedback_id']) ? (int) $input['feedback_id'] : null,
            ]
        );

        $row = $this->db->fetchOne('SELECT * FROM release_note_items WHERE id = ?', [$this->db->lastInsertId()]);
        return ['success' => true, 'data' => $this->formatItem($row ?? [])];
    }

    public function updateItem(int $noteId, int $itemId, array $input): array
    {
        $cur = $this->db->fetchOne(
            'SELECT id FROM release_note_items WHERE id = ? AND release_note_id = ?',
            [$itemId, $noteId]
        );
        if ($cur === null) {
            return ['success' => false, 'error' => 'Not found'];
        }

        $fields = [];
        $binds = [];
        foreach (['headline', 'where_text', 'before_text', 'after_text'] as $key) {
            if (array_key_exists($key, $input)) {
                $fields[] = "$key = ?";
                $binds[] = $this->nullableText($input[$key]);
            }
        }
        if (array_key_exists('category', $input)) {
            if (!in_array($input['category'], self::CATEGORIES, true)) {
                return ['success' => false, 'error' => 'category は fix / improve / feature のいずれかです'];
            }
            $fields[] = 'category = ?';
            $binds[] = $input['category'];
        }
        foreach (['sort_order', 'feedback_id'] as $key) {
            if (array_key_exists($key, $input)) {
                $fields[] = "$key = ?";
                $binds[] = $input[$key] === null ? null : (int) $input[$key];
            }
        }
        if (!$fields) {
            return ['success' => false, 'error' => '更新する項目がありません'];
        }

        $binds[] = $itemId;
        $this->db->execute('UPDATE release_note_items SET ' . implode(', ', $fields) . ' WHERE id = ?', $binds);

        $row = $this->db->fetchOne('SELECT * FROM release_note_items WHERE id = ?', [$itemId]);
        return ['success' => true, 'data' => $this->formatItem($row ?? [])];
    }

    /**
     * 項目を削除する。ぶら下がっているメディアも実体ごと片付ける。
     */
    public function deleteItem(int $noteId, int $itemId): array
    {
        $cur = $this->db->fetchOne(
            'SELECT id FROM release_note_items WHERE id = ? AND release_note_id = ?',
            [$itemId, $noteId]
        );
        if ($cur === null) {
            return ['success' => false, 'error' => 'Not found'];
        }

        $images = $this->db->query('SELECT stored_name FROM release_note_images WHERE item_id = ?', [$itemId]);

        $this->db->beginTransaction();
        try {
            $this->db->execute('DELETE FROM release_note_images WHERE item_id = ?', [$itemId]);
            $this->db->execute('DELETE FROM release_note_items WHERE id = ?', [$itemId]);
            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }

        $dir = $this->noteDir($noteId);
        foreach ($images as $im) {
            $path = $dir . '/' . $im['stored_name'];
            if (is_file($path)) {
                @unlink($path);
            }
        }

        return ['success' => true];
    }

    // ── メディア ────────────────────────────────────────────────────────────

    /**
     * メディアを添付する（multipart/form-data）。
     * item_id を付ければその項目の証跡、無ければ号全体の代表メディア（一覧カードに出る）。
     */
    public function uploadImage(int $noteId): array
    {
        if (!$this->noteExists($noteId)) {
            return ['success' => false, 'error' => 'Not found'];
        }

        if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
            // post_max_size を超えると $_FILES 自体が空になる。原因が分からないと詰まるので明示する。
            $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
            if ($contentLength > 0) {
                return ['success' => false, 'error' => 'ファイルがありません（PHP の post_max_size を超えている可能性があります）'];
            }
            return ['success' => false, 'error' => 'ファイルがありません'];
        }
        $file = $_FILES['file'];
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $code = $file['error'];
            if ($code === UPLOAD_ERR_INI_SIZE || $code === UPLOAD_ERR_FORM_SIZE) {
                return ['success' => false, 'error' => 'ファイルが大きすぎます（PHP の upload_max_filesize 設定を確認してください）'];
            }
            return ['success' => false, 'error' => "File upload failed (code: $code)"];
        }

        if ((int) $file['size'] > $this->maxUploadSize) {
            $mb = (int) round($this->maxUploadSize / 1048576);
            return ['success' => false, 'error' => "File too large (max {$mb}MB)"];
        }

        $count = $this->db->fetchOne(
            'SELECT COUNT(*) AS cnt FROM release_note_images WHERE release_note_id = ?',
            [$noteId]
        );
        if ($count !== null && (int) $count['cnt'] >= self::MAX_MEDIA_PER_NOTE) {
            return ['success' => false, 'error' => 'Maximum media per release reached (max ' . self::MAX_MEDIA_PER_NOTE . ')'];
        }

        // MIME は必ず実ファイルのバイナリから判定する（$_FILES['type'] はクライアント申告なので信用しない）。
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detected = (string) $finfo->file($file['tmp_name']);
        $originalName = is_string($file['name']) && $file['name'] !== '' ? $file['name'] : 'upload';
        $mimeType = $this->resolveMime($originalName, $detected);

        if (!isset(self::ALLOWED_MIME[$mimeType])) {
            return ['success' => false, 'error' => "Invalid file type: $detected"];
        }

        $itemId = null;
        if (isset($_POST['item_id']) && is_numeric($_POST['item_id'])) {
            $itemId = (int) $_POST['item_id'];
            $owns = $this->db->fetchOne(
                'SELECT id FROM release_note_items WHERE id = ? AND release_note_id = ?',
                [$itemId, $noteId]
            );
            if ($owns === null) {
                return ['success' => false, 'error' => 'item_id がこのリリースの項目ではありません'];
            }
        }

        $dir = $this->noteDir($noteId);
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            return ['success' => false, 'error' => 'Failed to create storage directory'];
        }

        $storedName = bin2hex(random_bytes(16)) . self::ALLOWED_MIME[$mimeType];
        if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $storedName)) {
            return ['success' => false, 'error' => 'Failed to save file'];
        }

        $order = $this->db->fetchOne(
            'SELECT COALESCE(MAX(sort_order), -1) AS m FROM release_note_images WHERE release_note_id = ?',
            [$noteId]
        );

        $this->db->execute(
            'INSERT INTO release_note_images
                (release_note_id, item_id, token, stored_name, original_name, mime_type, size, caption, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $noteId,
                $itemId,
                bin2hex(random_bytes(24)),
                $storedName,
                $originalName,
                $mimeType,
                (int) $file['size'],
                isset($_POST['caption']) && is_string($_POST['caption']) && $_POST['caption'] !== '' ? $_POST['caption'] : null,
                ((int) ($order['m'] ?? -1)) + 1,
            ]
        );

        $row = $this->db->fetchOne('SELECT * FROM release_note_images WHERE id = ?', [$this->db->lastInsertId()]);
        return ['success' => true, 'data' => $this->formatImage($row ?? [])];
    }

    public function deleteImage(int $noteId, int $imageId): array
    {
        $img = $this->db->fetchOne(
            'SELECT id, stored_name FROM release_note_images WHERE id = ? AND release_note_id = ?',
            [$imageId, $noteId]
        );
        if ($img === null) {
            return ['success' => false, 'error' => 'Not found'];
        }

        $this->db->execute('DELETE FROM release_note_images WHERE id = ?', [$imageId]);
        // 代表メディアに指定されていたら参照も外す（存在しない id を指したままにしない）。
        $this->db->execute('UPDATE release_notes SET cover_image_id = NULL WHERE cover_image_id = ?', [$imageId]);

        $path = $this->noteDir($noteId) . '/' . $img['stored_name'];
        if (is_file($path)) {
            @unlink($path);
        }

        return ['success' => true];
    }

    /**
     * メディアを配信する。
     *
     * **認証を通さない**。<img src> / <video src> は Authorization ヘッダを送れないため、
     * 認証必須にするとブラウザからは 401 で何も表示されない（curl では通るので気づけない）。
     * 代わりに推測不能なトークンを URL に持たせている。
     *
     * Range(206) に対応する。未対応だとブラウザが全部落とし終えるまで再生を始められず、
     * シークもできない。画像にも害はないので一律で対応する。
     */
    public function serveMedia(string $token): void
    {
        if (preg_match('/^[a-f0-9]{32,}$/', $token) !== 1) {
            $this->mediaNotFound();
            return;
        }
        $img = $this->db->fetchOne(
            'SELECT i.*, n.deleted_at FROM release_note_images i
               JOIN release_notes n ON n.id = i.release_note_id
              WHERE i.token = ?',
            [$token]
        );
        if ($img === null || $img['deleted_at'] !== null) {
            $this->mediaNotFound();
            return;
        }

        // パストラバーサル防御: 解決後のパスが保存先の配下であることを必ず確認する。
        $root = realpath($this->noteDir((int) $img['release_note_id']));
        $full = $root === false ? false : realpath($root . '/' . $img['stored_name']);
        if ($root === false || $full === false || !str_starts_with($full, $root . DIRECTORY_SEPARATOR)) {
            $this->mediaNotFound();
            return;
        }

        $size = filesize($full);
        if ($size === false) {
            $this->mediaNotFound();
            return;
        }

        header('Content-Type: ' . $img['mime_type']);
        header('Content-Disposition: inline');
        header('Cache-Control: private, max-age=300');
        header('Accept-Ranges: bytes');

        $range = $this->parseRange((string) ($_SERVER['HTTP_RANGE'] ?? ''), $size);
        if ($range === false) {
            http_response_code(416);
            header("Content-Range: bytes */$size");
            return;
        }
        if ($range === null) {
            header('Content-Length: ' . $size);
            readfile($full);
            return;
        }

        [$start, $end] = $range;
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
        header('Content-Length: ' . ($end - $start + 1));
        $this->streamRange($full, $start, $end);
    }

    /**
     * Range ヘッダを解釈する。
     *
     * @return array{0:int,1:int}|null|false [start,end] / null=Range 指定なし / false=範囲不正(416)
     */
    private function parseRange(string $header, int $size): array|null|false
    {
        $header = trim($header);
        if ($header === '' || preg_match('/^bytes=(\d*)-(\d*)$/', $header, $m) !== 1) {
            return null;
        }
        [$rawStart, $rawEnd] = [$m[1], $m[2]];
        if ($rawStart === '' && $rawEnd === '') {
            return false;
        }

        if ($rawStart === '') {
            // suffix range（末尾 N バイト）
            $n = (int) $rawEnd;
            if ($n <= 0) {
                return false;
            }
            $start = max(0, $size - $n);
            $end = $size - 1;
        } else {
            $start = (int) $rawStart;
            $end = $rawEnd === '' ? $size - 1 : min((int) $rawEnd, $size - 1);
        }

        if ($start > $end || $start >= $size || $start < 0) {
            return false;
        }
        return [$start, $end];
    }

    private function streamRange(string $path, int $start, int $end): void
    {
        $fh = fopen($path, 'rb');
        if ($fh === false) {
            return;
        }
        fseek($fh, $start);
        $remaining = $end - $start + 1;
        while ($remaining > 0 && !feof($fh)) {
            $chunk = fread($fh, (int) min(8192, $remaining));
            if ($chunk === false) {
                break;
            }
            echo $chunk;
            $remaining -= strlen($chunk);
        }
        fclose($fh);
    }

    private function mediaNotFound(): void
    {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Not found']);
    }

    // ── 内部ヘルパ ──────────────────────────────────────────────────────────

    private function show(int $id): array
    {
        $row = $this->db->fetchOne('SELECT * FROM release_notes WHERE id = ?', [$id]);
        if ($row === null) {
            return [];
        }
        return [
            'id' => (int) $row['id'],
            'version' => $row['version'],
            'title' => $row['title'],
            'summary' => $row['summary'],
            'released_on' => $row['released_on'],
            'previous_release_id' => $row['previous_release_id'] === null ? null : (int) $row['previous_release_id'],
            'cover_image_id' => $row['cover_image_id'] === null ? null : (int) $row['cover_image_id'],
            'status' => $row['status'],
            'is_public' => (int) $row['is_public'] === 1,
            'created_at' => Database::toJstIso($row['created_at']),
            'updated_at' => Database::toJstIso($row['updated_at']),
        ];
    }

    private function noteExists(int $id): bool
    {
        return $this->db->fetchOne('SELECT id FROM release_notes WHERE id = ? AND deleted_at IS NULL', [$id]) !== null;
    }

    private function noteDir(int $noteId): string
    {
        return $this->mediaDir . '/' . $noteId;
    }

    private function nullableText(mixed $v): ?string
    {
        if (!is_string($v)) {
            return null;
        }
        $t = trim($v);
        return $t === '' ? null : $t;
    }

    private function truthy(mixed $v): bool
    {
        return $v === true || $v === 1 || $v === '1' || $v === 'true';
    }

    /**
     * MIME を確定する。
     *
     * 送信側が Content-Type を付け忘れると application/octet-stream で飛んでくる。
     * そのまま保存すると <video> で描けなくなるため、拡張子から補う。
     */
    private function resolveMime(string $originalName, string $detected): string
    {
        if ($detected !== '' && $detected !== 'application/octet-stream' && isset(self::ALLOWED_MIME[$detected])) {
            return $detected;
        }
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        return self::EXT_MIME[$ext] ?? $detected;
    }

    // ── 公開ページ（HTML） ──────────────────────────────────────────────────

    /**
     * クライアントがそのまま読める単独ページを返す。
     *
     * ホストアプリのビルドにもルーティングにも認証ガードにも依存しない。
     * URL を送るだけで読める状態にすることがこの機能の主目的なので、
     * 外部 CSS / JS / フォントを一切参照しない自己完結の HTML にしている。
     */
    public function publicPage(string $token): void
    {
        $scope = $this->scopeOf($token);
        header_remove('Content-Type');
        if ($scope === null) {
            http_response_code(404);
            header('Content-Type: text/html; charset=utf-8');
            echo $this->errorPage('ページが見つかりません', 'URL が正しいかご確認ください。');
            return;
        }

        header('Content-Type: text/html; charset=utf-8');
        // 公開 URL でも検索エンジンには載せない（クライアントに配る前提の限定公開）。
        header('X-Robots-Tag: noindex, nofollow');
        header('Cache-Control: private, no-store');
        echo $this->renderPage($this->collect($scope), $scope);
    }

    private function renderPage(array $notes, string $scope): string
    {
        $css = $this->pageCss();
        $body = $notes === []
            ? '<p class="empty">まだ掲載されている更新はありません。</p>'
            : $this->renderNotes($notes);

        $internalBadge = $scope === self::SCOPE_INTERNAL
            ? '<span class="scope-badge">社内向けを含む表示</span>'
            : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>更新情報</title>
<style>{$css}</style>
</head>
<body>
<div class="wrap">
  <header class="page-head">
    <h1>更新情報</h1>
    <p class="lead">アプリの更新内容を新しい順に掲載しています{$internalBadge}</p>
  </header>
  {$body}
</div>
<div class="lightbox" id="lightbox" hidden>
  <button type="button" class="lightbox-close" aria-label="閉じる">&times;</button>
  <img src="" alt="">
</div>
<script>
(function () {
  var box = document.getElementById('lightbox');
  var img = box.querySelector('img');
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-zoom]');
    if (t) { img.src = t.getAttribute('data-zoom'); box.hidden = false; return; }
    if (e.target === box || e.target.closest('.lightbox-close')) { box.hidden = true; img.src = ''; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) { box.hidden = true; img.src = ''; }
  });
})();
</script>
</body>
</html>
HTML;
    }

    private function renderNotes(array $notes): string
    {
        $out = [];
        foreach ($notes as $idx => $n) {
            $out[] = $this->renderNote($n, $idx === 0);
        }
        return '<div class="timeline">' . implode('', $out) . '</div>';
    }

    private function renderNote(array $n, bool $isLatest): string
    {
        $e = static fn(?string $s): string => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');

        $date = $this->formatDate((string) $n['released_on']);
        $prevLine = $n['previous'] === null
            ? '最初のリリースです'
            : '前回（' . $e($this->formatDate((string) $n['previous']['released_on'])) . ' ' . $e($n['previous']['version']) . '）からの変更';

        $cover = null;
        foreach ($n['images'] as $im) {
            if ($im['item_id'] === null) {
                $cover = $im;
                break;
            }
        }

        $counts = [];
        foreach (self::CATEGORIES as $c) {
            $num = count(array_filter($n['items'], static fn($i) => $i['category'] === $c));
            if ($num > 0) {
                $counts[] = '<span class="chip chip-' . $c . '">' . $e($this->categoryLabel($c)) . ' ' . $num . '</span>';
            }
        }

        $sections = [];
        foreach (self::CATEGORIES as $c) {
            $items = array_values(array_filter($n['items'], static fn($i) => $i['category'] === $c));
            if (!$items) {
                continue;
            }
            $rows = [];
            foreach ($items as $i => $item) {
                $rows[] = $this->renderItem($item, $i + 1, $n['images']);
            }
            $sections[] = '<section class="cat"><h3 class="cat-title cat-' . $c . '">'
                . $e($this->categoryLabel($c)) . '（' . count($items) . '件）</h3><ol class="items">'
                . implode('', $rows) . '</ol></section>';
        }

        $summaryBlock = '';
        if ($n['summary'] !== null && $n['summary'] !== '' || $cover !== null) {
            $summaryBlock = '<div class="summary-row">'
                . ($cover !== null ? '<div class="cover">' . $this->renderMedia($cover) . '</div>' : '')
                . (($n['summary'] ?? '') !== '' ? '<p class="summary">' . nl2br($e($n['summary'])) . '</p>' : '')
                . '</div>';
        }

        // details/summary を使うと JS 無しでアコーディオンになる。最新号だけ開いておく。
        $open = $isLatest ? ' open' : '';
        $itemCount = count($n['items']);

        return '<article class="note' . ($isLatest ? ' latest' : '') . '">'
            . '<div class="dot"></div>'
            . '<div class="note-meta"><span class="date">' . $e($date) . '</span>'
            . '<span class="ver">' . $e($n['version']) . '</span>'
            . ($isLatest ? '<span class="latest-badge">最新</span>' : '') . '</div>'
            . '<div class="card">'
            . '<div class="card-head">'
            . '<h2>' . $e($n['title']) . '</h2>'
            . '<p class="prev">' . $prevLine . '</p>'
            . ($counts ? '<div class="chips">' . implode('', $counts) . '</div>' : '')
            . $summaryBlock
            . '</div>'
            . ($sections
                ? '<details' . $open . '><summary>変更点をすべて見る（' . $itemCount . '件）</summary>'
                    . '<div class="card-body">' . implode('', $sections) . '</div></details>'
                : '')
            . '</div></article>';
    }

    private function renderItem(array $item, int $index, array $allImages): string
    {
        $e = static fn(?string $s): string => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');

        $media = array_values(array_filter($allImages, static fn($im) => $im['item_id'] === $item['id']));
        $mediaHtml = '';
        if ($media) {
            $figs = [];
            foreach ($media as $m) {
                $figs[] = '<figure>' . $this->renderMedia($m)
                    . (($m['caption'] ?? null) !== null ? '<figcaption>' . $e($m['caption']) . '</figcaption>' : '')
                    . '</figure>';
            }
            $mediaHtml = '<div class="media">' . implode('', $figs) . '</div>';
        }

        // 「これまで → これから」の対で読ませる。片方だけだと何が変わったのか伝わらない。
        $ba = '';
        if (($item['before_text'] ?? null) !== null || ($item['after_text'] ?? null) !== null) {
            $ba = '<div class="ba">'
                . (($item['before_text'] ?? null) !== null
                    ? '<p class="before"><span class="ba-label">これまで</span>' . $e($item['before_text']) . '</p>' : '')
                . (($item['after_text'] ?? null) !== null
                    ? '<p class="after"><span class="ba-label">これから</span>' . $e($item['after_text']) . '</p>' : '')
                . '</div>';
        }

        return '<li class="item"><span class="num">' . $index . '.</span><div class="item-body">'
            . '<p class="headline">' . $e($item['headline']) . '</p>'
            . (($item['where_text'] ?? null) !== null ? '<p class="where">場所: ' . $e($item['where_text']) . '</p>' : '')
            . $ba . $mediaHtml
            . '</div></li>';
    }

    /**
     * 動画には #t=0.1 を付ける。付けないと再生前が真っ黒な箱に見えて、何の動画か分からない。
     */
    private function renderMedia(array $m): string
    {
        $url = htmlspecialchars((string) $m['url'], ENT_QUOTES, 'UTF-8');
        $alt = htmlspecialchars((string) ($m['caption'] ?? ''), ENT_QUOTES, 'UTF-8');

        if (str_starts_with((string) $m['mime_type'], 'video/')) {
            return '<video src="' . $url . '#t=0.1" controls playsinline preload="metadata"></video>';
        }
        return '<img src="' . $url . '" alt="' . $alt . '" loading="lazy" data-zoom="' . $url . '">';
    }

    private function categoryLabel(string $category): string
    {
        return match ($category) {
            'improve' => '使いやすくしたこと',
            'feature' => '新しくできること',
            default => '直したこと',
        };
    }

    private function formatDate(string $ymd): string
    {
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $ymd, $m) !== 1) {
            return $ymd;
        }
        return sprintf('%d年%d月%d日', (int) $m[1], (int) $m[2], (int) $m[3]);
    }

    private function errorPage(string $title, string $lead): string
    {
        $e = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
        $css = $this->pageCss();
        return '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow">'
            . '<title>' . $e($title) . '</title><style>' . $css . '</style></head>'
            . '<body><div class="wrap"><header class="page-head"><h1>' . $e($title) . '</h1>'
            . '<p class="lead">' . $e($lead) . '</p></header></div></body></html>';
    }

    /**
     * 自己完結の CSS。色は dev-tools の MANUAL_COLORS に合わせてある
     * （アプリ内コンポーネントと見た目を揃えるため）。
     */
    private function pageCss(): string
    {
        return <<<'CSS'
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#F7F8FA;color:#111827;
  font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP","Yu Gothic",sans-serif;
  line-height:1.7;-webkit-text-size-adjust:100%}
.wrap{max-width:820px;margin:0 auto;padding:32px 16px 64px}
.page-head{margin-bottom:24px}
.page-head h1{margin:0;font-size:22px;font-weight:700;color:#043E80}
.lead{margin:4px 0 0;font-size:13px;color:#6B7280}
.scope-badge{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:999px;
  background:#FEF3C7;color:#92400E;font-size:11px}
.empty{padding:24px;background:#fff;border:1px solid #E5E7EB;border-radius:10px;
  color:#6B7280;font-size:14px}
.timeline{position:relative;padding-left:22px}
.timeline::before{content:"";position:absolute;left:6px;top:8px;bottom:8px;width:1px;background:#E5E7EB}
.note{position:relative;margin-bottom:24px}
.dot{position:absolute;left:-22px;top:6px;width:13px;height:13px;border-radius:50%;
  background:#D1D5DB;border:2px solid #F7F8FA}
.note.latest .dot{background:#043E80}
.note-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:6px}
.date{font-size:13px;font-weight:600;color:#374151}
.ver{font-size:11px;padding:1px 8px;border-radius:999px;background:#EEF2F7;color:#4B5563}
.latest-badge{font-size:11px;padding:1px 8px;border-radius:999px;
  background:#043E80;color:#fff}
.card{background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden}
.card-head{padding:16px 16px 14px}
.card-head h2{margin:0;font-size:16px;font-weight:700}
.prev{margin:4px 0 0;font-size:12px;color:#6B7280}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{font-size:11px;padding:2px 9px;border-radius:999px;border:1px solid}
.chip-fix{background:#FFFBEB;color:#92400E;border-color:#FDE68A}
.chip-improve{background:#ECFDF5;color:#065F46;border-color:#A7F3D0}
.chip-feature{background:#EFF6FF;color:#1E40AF;border-color:#BFDBFE}
.summary-row{display:flex;gap:14px;margin-top:14px;flex-direction:column}
.summary{margin:0;font-size:14px;color:#374151;flex:1}
.cover{flex-shrink:0}
.cover img,.cover video{width:100%;border-radius:8px;border:1px solid #E5E7EB;display:block}
details{border-top:1px solid #F3F4F6}
summary{padding:10px 16px;font-size:12px;color:#6B7280;cursor:pointer;list-style:none;
  text-align:center;user-select:none}
summary::-webkit-details-marker{display:none}
summary:hover{background:#F9FAFB}
summary::before{content:"▸ ";display:inline-block;transition:transform .15s}
details[open] summary::before{content:"▾ "}
.card-body{padding:4px 16px 16px;background:#FAFBFC}
.cat{margin-top:16px}
.cat-title{margin:0 0 8px;font-size:12px;font-weight:700}
.cat-title.cat-fix{color:#92400E}
.cat-title.cat-improve{color:#065F46}
.cat-title.cat-feature{color:#1E40AF}
.items{list-style:none;margin:0;padding:0}
.item{display:flex;gap:8px;background:#fff;border:1px solid #F3F4F6;border-radius:8px;
  padding:10px 12px;margin-bottom:10px}
.num{font-size:12px;color:#9CA3AF;padding-top:2px}
.item-body{flex:1;min-width:0}
.headline{margin:0;font-size:14px;color:#111827}
.where{margin:2px 0 0;font-size:12px;color:#9CA3AF}
.ba{margin-top:8px}
.ba p{margin:0 0 2px;font-size:12px}
.before{color:#6B7280}
.after{color:#111827}
.ba-label{display:inline-block;width:4.5em;color:#9CA3AF;flex-shrink:0}
.media{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px}
.media figure{margin:0;width:100%;max-width:420px}
.media img,.media video{width:100%;border-radius:6px;border:1px solid #E5E7EB;
  background:#000;display:block}
.media img{background:#F9FAFB;cursor:zoom-in}
.media figcaption{margin-top:4px;font-size:11px;color:#9CA3AF}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:50;
  display:flex;align-items:center;justify-content:center;padding:24px}
.lightbox[hidden]{display:none}
.lightbox img{max-width:100%;max-height:100%;border-radius:8px;background:#fff}
.lightbox-close{position:absolute;top:12px;right:16px;background:none;border:none;
  color:#fff;font-size:32px;line-height:1;cursor:pointer}
@media (min-width:640px){
  .summary-row{flex-direction:row}
  .cover{width:220px}
}
CSS;
    }
}
