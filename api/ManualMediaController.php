<?php
/**
 * Debug Notes API - Manual Media Controller
 *
 * マニュアル（ManualPiP / ManualSidebar / MarkdownRenderer が表示する .md ページ）に貼る
 * 画像のアップロード・配信。設計は RFC 002 / ADR-002 で確定済み。
 *
 * ReleaseNotesController のメディア関連メソッド（uploadImage / deleteImage / serveMedia /
 * parseRange / streamRange / resolveMime）を参考実装とするが、以下の点で異なる:
 *
 *   1. 親エンティティが無い: ManualItem は dev-tools の DB に実体を持たない
 *      （ホストアプリが配列として渡す）。そのため release-notes の noteExists() 相当の
 *      「その号は存在するか」という存在チェックはできない／行わない。代わりに
 *      manual_item_id を正規表現 ITEM_ID_PATTERN で検証し、不一致なら 400 を返す。
 *      この検証はディレクトリ名として使う前に必ず通す（パストラバーサル対策の要）。
 *   2. 公開/下書きの概念が無い: serveMedia はトークン一致のみで配信可否を判定する
 *      （release-notes の status='published' チェックに相当するものは無い。
 *      マニュアルはアプリ内表示前提のため）。
 *   3. 画像のみ: 動画は対象外（ALLOWED_MIME に video/* を含めない）。
 *   4. 「号 → 項目 → メディア」の3階層ではなく「項目(ページ) → メディア」の2階層。
 *      manual_item_id が直接メディアに紐付く（item_id 相当のカラムは無い）。
 */

declare(strict_types=1);

class ManualMediaController
{
    /** 1項目（ManualItem 1件）あたりのメディア数上限。release_note_images の MAX_MEDIA_PER_NOTE に倣う。 */
    private const MAX_MEDIA_PER_ITEM = 30;

    /** アップロード上限（バイト）。10MB。全画面キャプチャ等で notes 添付(5MB)より大きくなりやすいため広め。 */
    private const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

    /**
     * 許可する MIME。画像のみ（動画は対象外）。
     * SVG はスクリプトを埋め込めるため意図的に除外している（ReleaseNotesController と同じ理由）。
     */
    private const ALLOWED_MIME = [
        'image/png' => '.png',
        'image/jpeg' => '.jpg',
        'image/webp' => '.webp',
        'image/gif' => '.gif',
    ];

    /** 送信側が Content-Type を誤ったときに拡張子から補うための対応表。 */
    private const EXT_MIME = [
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
    ];

    /**
     * manual_item_id として許可する文字種。URL パスセグメント兼ディレクトリ名として使うため、
     * ここを通っていない値をファイルシステムパスに使ってはならない（パストラバーサル対策の要）。
     */
    private const ITEM_ID_PATTERN = '/^[A-Za-z0-9_-]{1,128}$/';

    /**
     * 全 manual_item_id 横断の保存容量上限（バイト）。既定 500MB。
     *
     * manual_item_id は実在チェックができない（RFC 002。ManualItem が DB に実体を
     * 持たないため）。MAX_MEDIA_PER_ITEM は item 単位の上限に過ぎず、新しい
     * manual_item_id を名乗って POST するだけで際限なく新しい枠（30枚 x 10MB）を
     * 確保できてしまう。それを横断的に頭打ちにするための保険。
     */
    private const DEFAULT_MAX_TOTAL_SIZE = 500 * 1024 * 1024;

    private Database $db;
    private string $mediaDir;
    private int $maxTotalSize;

    /** メディア配信 URL の前置き（例: /__debug/api/manual/media/）。index.php が組む。 */
    private string $mediaUrlBase = '';
    /** env=test 等を引き継ぐためのクエリ（例: '?env=test'。dev なら空文字）。 */
    private string $urlQuery = '';

    public function __construct(Database $db, string $mediaDir, int $maxTotalSize = self::DEFAULT_MAX_TOTAL_SIZE)
    {
        $this->db = $db;
        $this->mediaDir = rtrim($mediaDir, '/');
        $this->maxTotalSize = $maxTotalSize;

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
        $this->mediaUrlBase = $base . '/manual/media/';
        // 既定 env は dev。クライアントに渡す URL を無駄に長くしないため dev では付けない。
        $this->urlQuery = $env === 'dev' ? '' : ('?env=' . rawurlencode($env));
    }

    // ── メディア ────────────────────────────────────────────────────────────

    /**
     * 画像を添付する（multipart/form-data）。
     *
     * ManualItem の実在確認はできない（DB に実体が無いため）。manual_item_id の
     * 文字種検証のみを「実在確認の代わり」として行う。
     */
    public function uploadImage(string $manualItemId): array
    {
        if (preg_match(self::ITEM_ID_PATTERN, $manualItemId) !== 1) {
            return ['success' => false, 'error' => 'manual_item_id が不正です'];
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

        if ((int) $file['size'] > self::MAX_UPLOAD_SIZE) {
            $mb = (int) round(self::MAX_UPLOAD_SIZE / 1048576);
            return ['success' => false, 'error' => "File too large (max {$mb}MB)"];
        }

        // MIME は必ず実ファイルのバイナリから判定する（$_FILES['type'] はクライアント申告なので信用しない）。
        // DB ロックを取る前に済ませておく（不正な型を弾くだけの場合に書き込みロックを取らないため）。
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detected = (string) $finfo->file($file['tmp_name']);
        $originalName = is_string($file['name']) && $file['name'] !== '' ? $file['name'] : 'upload';
        $mimeType = $this->resolveMime($originalName, $detected);

        if (!isset(self::ALLOWED_MIME[$mimeType])) {
            return ['success' => false, 'error' => "Invalid file type: $detected"];
        }

        // MAX_MEDIA_PER_ITEM / MAX_TOTAL_SIZE の判定から INSERT までを IMMEDIATE
        // トランザクションで直列化する。通常の beginTransaction()（DEFERRED）だと
        // 判定に使う SELECT の時点ではロックを取らないため、並行リクエストが同じ
        // 古い件数/容量を読んで両方とも上限チェックを通過し得る（TOCTOU）。
        $this->db->beginImmediate();
        try {
            $count = $this->db->fetchOne(
                'SELECT COUNT(*) AS cnt FROM manual_media WHERE manual_item_id = ?',
                [$manualItemId]
            );
            if ($count !== null && (int) $count['cnt'] >= self::MAX_MEDIA_PER_ITEM) {
                $this->db->rollBack();
                return ['success' => false, 'error' => 'Maximum media per item reached (max ' . self::MAX_MEDIA_PER_ITEM . ')'];
            }

            // manual_item_id は実在チェックができない（RFC 002）ため、item 単位の上限だけでは
            // 新しい manual_item_id を名乗って POST するだけで際限なく容量を確保できてしまう。
            // 全 item 横断の合計サイズにも上限を設ける。
            $total = $this->db->fetchOne('SELECT COALESCE(SUM(size), 0) AS total FROM manual_media');
            $currentTotal = $total !== null ? (int) $total['total'] : 0;
            if ($currentTotal + (int) $file['size'] > $this->maxTotalSize) {
                $this->db->rollBack();
                $mb = (int) round($this->maxTotalSize / 1048576);
                return ['success' => false, 'error' => "Total media storage limit reached (max {$mb}MB)"];
            }

            $dir = $this->itemDir($manualItemId);
            if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
                $this->db->rollBack();
                return ['success' => false, 'error' => 'Failed to create storage directory'];
            }

            $storedName = bin2hex(random_bytes(16)) . self::ALLOWED_MIME[$mimeType];
            if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $storedName)) {
                $this->db->rollBack();
                return ['success' => false, 'error' => 'Failed to save file'];
            }

            $order = $this->db->fetchOne(
                'SELECT COALESCE(MAX(sort_order), -1) AS m FROM manual_media WHERE manual_item_id = ?',
                [$manualItemId]
            );

            $this->db->execute(
                'INSERT INTO manual_media
                    (manual_item_id, token, stored_name, original_name, mime_type, size, caption, sort_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $manualItemId,
                    bin2hex(random_bytes(24)),
                    $storedName,
                    $originalName,
                    $mimeType,
                    (int) $file['size'],
                    isset($_POST['caption']) && is_string($_POST['caption']) && $_POST['caption'] !== '' ? $_POST['caption'] : null,
                    ((int) ($order['m'] ?? -1)) + 1,
                ]
            );

            $insertedId = $this->db->lastInsertId();
            $this->db->commit();
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }

        $row = $this->db->fetchOne('SELECT * FROM manual_media WHERE id = ?', [$insertedId]);
        return ['success' => true, 'data' => $this->formatMedia($row ?? [])];
    }

    /**
     * manual_item_id を横断した一覧（監査用）。
     *
     * manual_item_id は実在チェックができず、item 単位のメディア一覧
     * （GET /manual/items/{itemId}/media）は itemId を先に知っていないと呼べない。
     * そのため「どんな manual_item_id にどれだけメディアが積まれているか」を横断的に
     * 把握・監査する手段が無かった。運用側がディスク使用量を確認できるようにする。
     */
    public function listItems(): array
    {
        $rows = $this->db->query(
            'SELECT manual_item_id, COUNT(*) AS media_count, COALESCE(SUM(size), 0) AS total_size
             FROM manual_media
             GROUP BY manual_item_id
             ORDER BY manual_item_id'
        );
        return [
            'success' => true,
            'data' => array_map(
                fn($r) => [
                    'manual_item_id' => $r['manual_item_id'],
                    'media_count' => (int) $r['media_count'],
                    'total_size' => (int) $r['total_size'],
                ],
                $rows
            ),
        ];
    }

    /**
     * 項目（ManualItem 1件）単位のメディア一覧。
     */
    public function list(string $manualItemId): array
    {
        if (preg_match(self::ITEM_ID_PATTERN, $manualItemId) !== 1) {
            return ['success' => false, 'error' => 'manual_item_id が不正です'];
        }

        $rows = $this->db->query(
            'SELECT * FROM manual_media WHERE manual_item_id = ? ORDER BY sort_order, id',
            [$manualItemId]
        );
        return ['success' => true, 'data' => array_map(fn($r) => $this->formatMedia($r), $rows)];
    }

    /**
     * メディアを削除する。DB 行と実ファイルを消す（物理削除。deleted_at は持たない）。
     * DB を確定させてからファイルを消す（逆順だと DB 失敗時にファイルだけ消える）。
     */
    public function deleteImage(int $mediaId): array
    {
        $row = $this->db->fetchOne(
            'SELECT id, manual_item_id, stored_name FROM manual_media WHERE id = ?',
            [$mediaId]
        );
        if ($row === null) {
            return ['success' => false, 'error' => 'Not found'];
        }

        $this->db->execute('DELETE FROM manual_media WHERE id = ?', [$mediaId]);

        $manualItemId = (string) $row['manual_item_id'];
        if (preg_match(self::ITEM_ID_PATTERN, $manualItemId) === 1) {
            $path = $this->itemDir($manualItemId) . '/' . $row['stored_name'];
            if (is_file($path)) {
                @unlink($path);
            }
        }

        return ['success' => true];
    }

    /**
     * メディアを配信する。
     *
     * **認証を通さない**。<img src> は Authorization ヘッダを送れないため、
     * 認証必須にするとブラウザからは 401 で何も表示されない（curl では通るので気づけない）。
     * 代わりに推測不能なトークンを URL に持たせている。
     *
     * release-notes の status='published' チェックに相当するものは無い。マニュアルは
     * アプリ内表示前提のため、トークン一致のみで配信可否を判定する。
     *
     * Range(206) に対応する。画像のみでも将来の動画対応を見込みコストが低いため実装しておく。
     */
    public function serveMedia(string $token): void
    {
        if (preg_match('/^[a-f0-9]{32,}$/', $token) !== 1) {
            $this->mediaNotFound();
            return;
        }
        $img = $this->db->fetchOne('SELECT * FROM manual_media WHERE token = ?', [$token]);
        if ($img === null) {
            $this->mediaNotFound();
            return;
        }

        $manualItemId = (string) $img['manual_item_id'];
        // DB に保存されている manual_item_id は uploadImage() 時点で検証済みのはずだが、
        // パストラバーサル対策の要となる値なので配信直前にも念のため再検証する。
        if (preg_match(self::ITEM_ID_PATTERN, $manualItemId) !== 1) {
            $this->mediaNotFound();
            return;
        }

        // パストラバーサル防御: 解決後のパスが保存先の配下であることを必ず確認する。
        $root = realpath($this->itemDir($manualItemId));
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

    /**
     * 表示用に整形する。**token 自体は返さず url に埋めて返す**
     * （トークンは配信専用で、それ以外の用途を持たせない。ReleaseNotesController::formatImage と同じ方針）。
     */
    private function formatMedia(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'manual_item_id' => $r['manual_item_id'],
            'original_name' => $r['original_name'],
            'mime_type' => $r['mime_type'],
            'size' => (int) $r['size'],
            'caption' => $r['caption'],
            'sort_order' => (int) $r['sort_order'],
            'url' => $this->mediaUrlBase . $r['token'] . $this->urlQuery,
        ];
    }

    /**
     * manual_item_id 用の保存ディレクトリを返す。
     *
     * 呼び出し元は必ず ITEM_ID_PATTERN の検証を通した値だけをここに渡すこと
     * （ここがパストラバーサル対策の要になる）。
     */
    private function itemDir(string $manualItemId): string
    {
        return $this->mediaDir . '/' . $manualItemId;
    }

    /**
     * MIME を確定する。
     *
     * 送信側が Content-Type を付け忘れると application/octet-stream で飛んでくる。
     * そのまま保存すると Content-Type ヘッダが誤ったまま配信されるため、拡張子から補う。
     *
     * 拡張子フォールバックは finfo が「未検出」（空 / application/octet-stream）の
     * ときだけに限る。finfo が具体的な型を検出した場合はそれを信用し、そのまま返す
     * （呼び出し元の ALLOWED_MIME チェックで弾かれる）。ここで「finfo の検出値が
     * ALLOWED_MIME の4種と一致しない限り拡張子を優先する」という条件にしてしまうと、
     * finfo が text/x-php や text/html のような危険な実体を正しく検出していても
     * その判定を握りつぶして拡張子ベースで image/* に確定させてしまい、実ファイルの
     * バイナリから判定するという設計意図（134行目のコメント）が無意味になる。
     */
    private function resolveMime(string $originalName, string $detected): string
    {
        if ($detected !== '' && $detected !== 'application/octet-stream') {
            return $detected;
        }
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        return self::EXT_MIME[$ext] ?? $detected;
    }
}
