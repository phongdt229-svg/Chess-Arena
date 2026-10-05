<?php
declare(strict_types=1);

// Setup check: open /api/health.php after uploading. It reports only booleans and short codes, never secrets.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$checks = [
    'php_8_1_or_newer' => version_compare(PHP_VERSION, '8.1.0', '>='),
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'config_file' => false,
    'db_connection' => false,
    'tables' => false,
];
$problem = null;

$configPath = dirname(__DIR__, 2) . '/config/config.php';
if (is_file($configPath) && is_readable($configPath)) {
    $checks['config_file'] = true;
    $config = require $configPath;
    if ($checks['pdo_mysql'] && is_array($config)) {
        try {
            $pdo = new PDO($config['db_dsn'] ?? '', $config['db_user'] ?? '', $config['db_pass'] ?? '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);
            $checks['db_connection'] = true;
            $found = (int) $pdo->query(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('users','auth_tokens')"
            )->fetchColumn();
            $checks['tables'] = $found === 2;
        } catch (Throwable $e) {
            // 1045 wrong user/password, 1049 unknown database, 2002 cannot reach server
            $problem = 'db_error_' . (string) ($e instanceof PDOException ? ($e->errorInfo[1] ?? $e->getCode()) : 'unknown');
        }
    }
}

// Where PHP looks and why it may fail (a path and ini value, never file contents or credentials)
$where = [
    'config_path' => $configPath,
    'exists' => @file_exists($configPath),
    'readable' => @is_readable($configPath),
    'parent_dir_exists' => @is_dir(dirname($configPath)),
    'open_basedir' => ini_get('open_basedir') ?: null,
];

$next = null;
if (!$checks['php_8_1_or_newer']) {
    $next = 'Switch this site to PHP 8.1 or newer.';
} elseif (!$checks['pdo_mysql']) {
    $next = 'Enable the pdo_mysql PHP extension.';
} elseif (!$checks['config_file']) {
    $next = 'Create the file named in config.config_path (copy config.example.php and fill in the database details). If open_basedir is set and does not include that folder, ask the host to allow it.';
} elseif (!$checks['db_connection']) {
    $next = 'Check db_dsn, db_user and db_pass in config.php (' . ($problem ?? 'connection failed') . ').';
} elseif (!$checks['tables']) {
    $next = 'Import schema.sql into the database.';
}

$ok = $next === null;
http_response_code($ok ? 200 : 503);
echo json_encode(['ok' => $ok, 'checks' => $checks, 'config' => $where, 'next' => $next], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
