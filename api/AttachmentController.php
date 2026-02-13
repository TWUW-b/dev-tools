<?php
/**
 * Debug Notes API - Attachment Controller
 */

declare(strict_types=1);

class AttachmentController
{
    private Database $db;
    private string $uploadDir;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_ATTACHMENTS_PER_NOTE = 5;
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

    private const EXTENSION_MAP = [
        'image/png' => '.png',
        'image/jpeg' => '.jpg',
        'image/webp' => '.webp',
        'image/gif' => '.gif',
    ];

    public function __construct(Database $db, string $uploadDir)
    {
        $this->db = $db;
        $this->uploadDir = rtrim($uploadDir, '/');

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * 画像アップロード
     */
    public function upload(int $noteId): array
    {
        // ノート存在チェック
        $note = $this->db->fetchOne(
            'SELECT id FROM notes WHERE id = ? AND deleted_at IS NULL',
            [$noteId]
        );
        if (!$note) {
            return ['success' => false, 'error' => 'Note not found'];
        }

        // ファイル存在チェック
        if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $errorCode = $_FILES['file']['error'] ?? -1;
            return ['success' => false, 'error' => "File upload failed (code: $errorCode)"];
        }

        $file = $_FILES['file'];

        // サイズチェック
        if ($file['size'] > self::MAX_FILE_SIZE) {
            return ['success' => false, 'error' => 'File too large (max 5MB)'];
        }

        // MIME タイプをバイナリ検査
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, self::ALLOWED_TYPES, true)) {
            return ['success' => false, 'error' => "Invalid file type: $mimeType"];
        }

        // 添付数チェック
        $count = $this->db->fetchOne(
            'SELECT COUNT(*) as cnt FROM note_attachments WHERE note_id = ?',
            [$noteId]
        );
        if ($count && (int)$count['cnt'] >= self::MAX_ATTACHMENTS_PER_NOTE) {
            return ['success' => false, 'error' => 'Maximum attachments per note reached (max 5)'];
        }

        // ファイル名生成
        $ext = self::EXTENSION_MAP[$mimeType] ?? '.bin';
        $filename = bin2hex(random_bytes(16)) . $ext;
        $destPath = $this->uploadDir . '/' . $filename;

        // 保存
        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            return ['success' => false, 'error' => 'Failed to save file'];
        }

        // DB 登録
        $originalName = $file['name'] ?: ('upload' . $ext);
        $this->db->execute(
            'INSERT INTO note_attachments (note_id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?)',
            [$noteId, $filename, $originalName, $mimeType, $file['size']]
        );

        $id = $this->db->lastInsertId();
        $attachment = $this->db->fetchOne(
            'SELECT id, note_id, filename, original_name, mime_type, size, created_at FROM note_attachments WHERE id = ?',
            [$id]
        );

        return [
            'success' => true,
            'attachment' => $attachment,
        ];
    }

    /**
     * 添付一覧
     */
    public function list(int $noteId): array
    {
        $attachments = $this->db->query(
            'SELECT id, note_id, filename, original_name, mime_type, size, created_at FROM note_attachments WHERE note_id = ? ORDER BY created_at ASC',
            [$noteId]
        );

        return [
            'success' => true,
            'attachments' => $attachments,
        ];
    }

    /**
     * 添付削除
     */
    public function delete(int $noteId, int $attachmentId): array
    {
        $attachment = $this->db->fetchOne(
            'SELECT id, filename FROM note_attachments WHERE id = ? AND note_id = ?',
            [$attachmentId, $noteId]
        );

        if (!$attachment) {
            return ['success' => false, 'error' => 'Attachment not found'];
        }

        // ファイル削除
        $filePath = $this->uploadDir . '/' . $attachment['filename'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // DB 削除
        $this->db->execute(
            'DELETE FROM note_attachments WHERE id = ?',
            [$attachmentId]
        );

        return ['success' => true];
    }

    /**
     * 画像配信（バイナリ返却）
     */
    public function serve(string $filename): void
    {
        // パストラバーサル防止
        if (str_contains($filename, '/') || str_contains($filename, '\\') || str_contains($filename, '..')) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid filename']);
            return;
        }

        $filePath = $this->uploadDir . '/' . $filename;
        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'File not found']);
            return;
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);

        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=86400');
        readfile($filePath);
    }
}
