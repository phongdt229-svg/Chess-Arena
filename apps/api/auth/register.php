<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';

require_method('POST');
[$username, $password] = validate_credentials(read_json_body());

$pdo = db();
try {
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        json_fail('USERNAME_TAKEN', 409);
    }
    server_error($e);
}

$userId = (int) $pdo->lastInsertId();
json_ok([
    'token' => issue_token($userId),
    'user' => ['id' => $userId, 'username' => $username, 'elo' => 1200],
], 201);
