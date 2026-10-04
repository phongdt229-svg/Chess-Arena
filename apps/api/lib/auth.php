<?php
declare(strict_types=1);

require_once __DIR__ . '/response.php';
require_once __DIR__ . '/db.php';

const TOKEN_TTL_DAYS = 30;

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';
    if (preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $header, $m)) {
        return strtolower($m[1]);
    }
    return null;
}

function issue_token(int $userId): string
{
    $token = bin2hex(random_bytes(32));
    $stmt = db()->prepare(
        'INSERT INTO auth_tokens (token_hash, user_id, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ' . TOKEN_TTL_DAYS . ' DAY))'
    );
    $stmt->execute([hash('sha256', $token), $userId]);

    // Opportunistic cleanup of expired tokens
    if (random_int(1, 50) === 1) {
        db()->exec('DELETE FROM auth_tokens WHERE expires_at < NOW()');
    }
    return $token;
}

function require_user(): array
{
    $token = bearer_token();
    if ($token === null) {
        json_fail('UNAUTHORIZED', 401);
    }
    $stmt = db()->prepare(
        'SELECT u.id, u.username, u.elo
           FROM auth_tokens t
           JOIN users u ON u.id = t.user_id
          WHERE t.token_hash = ? AND t.expires_at > NOW()'
    );
    $stmt->execute([hash('sha256', $token)]);
    $user = $stmt->fetch();
    if (!$user) {
        json_fail('UNAUTHORIZED', 401);
    }
    return $user;
}

function validate_credentials(array $body): array
{
    $username = $body['username'] ?? null;
    $password = $body['password'] ?? null;
    if (!is_string($username) || !is_string($password)) {
        json_fail('VALIDATION');
    }
    if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $username)) {
        json_fail('VALIDATION');
    }
    if (strlen($password) < 8 || strlen($password) > 72) {
        json_fail('VALIDATION');
    }
    return [$username, $password];
}

function public_user(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'username' => $row['username'],
        'elo' => (int) $row['elo'],
    ];
}
