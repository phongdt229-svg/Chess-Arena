<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';

require_method('POST');
$token = bearer_token();
if ($token !== null) {
    $stmt = db()->prepare('DELETE FROM auth_tokens WHERE token_hash = ?');
    $stmt->execute([hash('sha256', $token)]);
}
json_ok();
