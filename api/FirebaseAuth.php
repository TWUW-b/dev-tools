<?php
/**
 * Firebase ID トークン検証（依存ライブラリ無し・openssl + Google 公開鍵）。
 *
 * notes / feedback 管理 API を「有効な Firebase IDトークン(Authorization: Bearer)
 * OR X-Admin-Key」で受理するために使う（方式A / @TWUWB-002 の続き）。
 *
 * セキュリティ設計:
 *  - alg は RS256 のみ許可（alg=none / HS256 混同攻撃を拒否）
 *  - Google securetoken の x509 公開鍵で RS256 署名を検証
 *  - aud == projectId, iss == https://securetoken.google.com/{projectId}
 *  - exp 未超過, iat/auth_time が未来でない, sub 非空
 *  - 公開鍵は Cache-Control に従いキャッシュ（取得失敗時は期限切れキャッシュにフォールバック）
 *
 * ここには副作用（出力・exit）を持つ関数は置かない（純粋関数のみ＝テスト可能）。
 */

declare(strict_types=1);

const DT_FIREBASE_CERTS_URL_DEFAULT =
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

/** base64url デコード。失敗時 null。 */
function dtBase64UrlDecode(string $data): ?string
{
    if ($data === '' || !preg_match('#^[A-Za-z0-9_-]+$#', $data)) {
        return null;
    }
    $b64 = strtr($data, '-_', '+/');
    $pad = strlen($b64) % 4;
    if ($pad === 1) {
        return null; // 不正な長さ
    }
    if ($pad > 0) {
        $b64 .= str_repeat('=', 4 - $pad);
    }
    $decoded = base64_decode($b64, true);
    return $decoded === false ? null : $decoded;
}

/** Authorization ヘッダを取得（Apache が剥がすケースにフォールバック）。 */
function dtGetAuthorizationHeader(): string
{
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim((string) $_SERVER['HTTP_AUTHORIZATION']);
    }
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return trim((string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strcasecmp((string) $k, 'Authorization') === 0) {
                return trim((string) $v);
            }
        }
    }
    return '';
}

/** 証明書キャッシュの保存ディレクトリ（アプリ専有・非共有）。 */
function dtCertsCacheDir(): string
{
    $dir = __DIR__ . '/data/cache';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

/**
 * kid => PEM のうち「公開鍵として読める cert」だけを残す（想定外形状を弾く）。
 * @param array<mixed> $raw
 * @return array<string,string>
 */
function dtSanitizeCerts(array $raw): array
{
    $out = [];
    foreach ($raw as $kid => $pem) {
        if (is_string($kid) && $kid !== '' && is_string($pem)
            && strpos($pem, '-----BEGIN') !== false
            && openssl_pkey_get_public($pem) !== false
        ) {
            $out[$kid] = $pem;
        }
    }
    return $out;
}

/**
 * パス(ファイル/ディレクトリ)を信頼してよいか（共有ホスティングでの汚染=CWE-377 対策）。
 * group/other 書込可、または(posix 有効時)別ユーザー所有/所有者不明なら信頼しない。
 *
 * 注意: この防御は「テナント毎に UID 分離された環境（suexec / php-fpm per-user、Xserver 等）」で
 * 有効。全テナントが同一 UID で PHP を実行する構成では config.php の feedback_admin_key 自体も
 * 読めてしまうため、本キャッシュ汚染は最弱点ではない（攻撃者は盗んだ admin key で直接認証できる）。
 */
function dtPathTrusted(string $path): bool
{
    $perms = @fileperms($path);
    if ($perms === false) {
        return false;
    }
    if (($perms & 0022) !== 0) {
        return false; // group/other 書込可 → 汚染されうるので不信
    }
    if (function_exists('posix_geteuid')) {
        $owner = @fileowner($path);
        if ($owner === false || $owner !== posix_geteuid()) {
            return false; // 別ユーザー所有(または不明) → 不信
        }
    }
    return true;
}

/** アトミック書込（同ディレクトリの一時ファイル→rename、0600）。 */
function dtAtomicWrite(string $file, string $data): void
{
    $tmp = $file . '.' . getmypid() . '.tmp';
    if (@file_put_contents($tmp, $data, LOCK_EX) !== false) {
        @chmod($tmp, 0600);
        if (!@rename($tmp, $file)) {
            @unlink($tmp);
        }
    }
}

/**
 * Google securetoken の公開鍵を kid => PEM(x509 cert) で返す。
 * Cache-Control: max-age に従い【アプリ専有ディレクトリ】へキャッシュ。共有 /tmp を
 * 使わず、読込時に所有者/権限を検証することで、共有ホスティングでの予測パス汚染
 * （偽証明書の先置きによる署名検証バイパス）を防ぐ。取得失敗時は期限切れキャッシュに
 * フォールバック（可用性。失効鍵でも exp 検証があるため単独ではバイパスにならない）。
 * $certsUrl は差し替え可（テスト用）。
 *
 * @return array<string,string>
 */
function dtFetchFirebaseCerts(string $certsUrl): array
{
    $cacheFile = dtCertsCacheDir() . '/fb_certs_' . md5($certsUrl) . '.json';

    $staleCerts = [];
    // ファイルとその格納ディレクトリの双方が信頼できる場合のみキャッシュを使う。
    if (is_file($cacheFile) && dtPathTrusted(dirname($cacheFile)) && dtPathTrusted($cacheFile)) {
        $raw = @file_get_contents($cacheFile);
        if ($raw !== false) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && isset($decoded['certs']) && is_array($decoded['certs'])) {
                $certs = dtSanitizeCerts($decoded['certs']);
                if ($certs !== []) {
                    if (isset($decoded['expires']) && $decoded['expires'] > time()) {
                        return $certs; // 有効なキャッシュ
                    }
                    $staleCerts = $certs; // 期限切れ（取得失敗時のフォールバック用）
                }
            }
        }
    }

    $ctx = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]]);
    $body = @file_get_contents($certsUrl, false, $ctx);
    if ($body === false) {
        return $staleCerts;
    }

    $decoded = json_decode($body, true);
    $certs = is_array($decoded) ? dtSanitizeCerts($decoded) : [];
    if ($certs === []) {
        return $staleCerts;
    }

    $ttl = 3600;
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('/^cache-control:.*?max-age=(\d+)/i', $h, $m)) {
            $ttl = max(60, (int) $m[1]);
            break;
        }
    }
    dtAtomicWrite($cacheFile, (string) json_encode(['certs' => $certs, 'expires' => time() + $ttl]));

    return $certs;
}

/**
 * Firebase ID トークンを検証する。成功で true、それ以外は false。
 *
 * @param string $token     Bearer の値（"Bearer " は含めない）
 * @param string $projectId Firebase プロジェクト ID（aud / iss の検証に使う）
 * @param string $certsUrl  公開鍵取得 URL（既定は Google securetoken）
 */
function dtVerifyFirebaseIdToken(
    string $token,
    string $projectId,
    string $certsUrl = DT_FIREBASE_CERTS_URL_DEFAULT
): bool {
    if ($projectId === '') {
        return false;
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    [$h64, $p64, $s64] = $parts;

    $headerJson = dtBase64UrlDecode($h64);
    $payloadJson = dtBase64UrlDecode($p64);
    $sig = dtBase64UrlDecode($s64);
    if ($headerJson === null || $payloadJson === null || $sig === null || $sig === '') {
        return false;
    }

    $header = json_decode($headerJson, true);
    $payload = json_decode($payloadJson, true);
    if (!is_array($header) || !is_array($payload)) {
        return false;
    }

    // alg は RS256 固定（alg=none / HS256 混同を拒否）
    if (($header['alg'] ?? null) !== 'RS256') {
        return false;
    }
    if (isset($header['typ']) && strcasecmp((string) $header['typ'], 'JWT') !== 0) {
        return false;
    }
    $kid = $header['kid'] ?? null;
    if (!is_string($kid) || $kid === '') {
        return false;
    }

    $certs = dtFetchFirebaseCerts($certsUrl);
    if (!isset($certs[$kid]) || !is_string($certs[$kid])) {
        return false;
    }

    $pub = openssl_pkey_get_public($certs[$kid]);
    if ($pub === false) {
        return false;
    }
    $verified = openssl_verify($h64 . '.' . $p64, $sig, $pub, OPENSSL_ALGO_SHA256);
    if ($verified !== 1) {
        return false;
    }

    // ── クレーム検証 ──
    $now = time();
    $leeway = 60;
    $expectedIss = 'https://securetoken.google.com/' . $projectId;

    if (!isset($payload['exp']) || !is_int($payload['exp']) || $payload['exp'] <= $now - $leeway) {
        return false;
    }
    if (isset($payload['iat']) && (!is_int($payload['iat']) || $payload['iat'] > $now + $leeway)) {
        return false;
    }
    if (isset($payload['auth_time']) && (!is_int($payload['auth_time']) || $payload['auth_time'] > $now + $leeway)) {
        return false;
    }
    if (($payload['aud'] ?? null) !== $projectId) {
        return false;
    }
    if (($payload['iss'] ?? null) !== $expectedIss) {
        return false;
    }
    if (!isset($payload['sub']) || !is_string($payload['sub']) || $payload['sub'] === '') {
        return false;
    }

    return true;
}
