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

$candidates = [dirname(__DIR__, 2) . '/config/config.php'];
$docRoot = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');
if ($docRoot !== '') {
    $candidates[] = dirname(rtrim($docRoot, '/')) . '/config/config.php';
}
$candidates = array_values(array_unique($candidates));

// Paths, flags, permission bits and numeric owner ids only: never file contents or credentials
$where = [
    'script_owner_uid' => getmyuid(),
    'open_basedir' => ini_get('open_basedir') ?: null,
    'candidates' => [],
];
$configPath = null;
foreach ($candidates as $candidate) {
    $exists = @file_exists($candidate);
    $readable = @is_readable($candidate);
    $where['candidates'][] = [
        'path' => $candidate,
        'exists' => $exists,
        'readable' => $readable,
        'perms' => $exists ? substr(sprintf('%o', @fileperms($candidate)), -4) : null,
        'owner_uid' => $exists ? @fileowner($candidate) : null,
        'parent_dir_exists' => @is_dir(dirname($candidate)),
    ];
    if ($configPath === null && $exists && $readable) {
        $configPath = $candidate;
    }
}

if ($configPath !== null) {
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

$next = null;
if (!$checks['php_8_1_or_newer']) {
    $next = 'Switch this site to PHP 8.1 or newer.';
} elseif (!$checks['pdo_mysql']) {
    $next = 'Enable the pdo_mysql PHP extension.';
} elseif (!$checks['config_file']) {
    $next = 'config.php was not found or is not readable at any path in config.candidates. Create it there, and make it readable by the site user (owner_uid should equal script_owner_uid, perms 0644 or 0640).';
} elseif (!$checks['db_connection']) {
    $next = 'Check db_dsn, db_user and db_pass in config.php (' . ($problem ?? 'connection failed') . ').';
} elseif (!$checks['tables']) {
    $next = 'Import schema.sql into the database.';
}

$ok = $next === null;
http_response_code($ok ? 200 : 503);
echo json_encode(['ok' => $ok, 'checks' => $checks, 'config' => $where, 'next' => $next], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
