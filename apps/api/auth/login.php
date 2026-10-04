<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';

require_method('POST');
$body = read_json_body();
$username = $body['username'] ?? null;
$password = $body['password'] ?? null;
if (!is_string($username) || !is_string($password) || $username === '' || strlen($password) > 72) {
    json_fail('INVALID_CREDENTIALS', 401);
}

$stmt = db()->prepare('SELECT id, username, elo, password_hash FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

// Always run password_verify so response time does not reveal whether the user exists
$dummyHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$ok = password_verify($password, $user ? $user['password_hash'] : $dummyHash);
if (!$user || !$ok) {
    usleep(random_int(100000, 300000));
    json_fail('INVALID_CREDENTIALS', 401);
}

json_ok([
    'token' => issue_token((int) $user['id']),
    'user' => public_user($user),
]);
