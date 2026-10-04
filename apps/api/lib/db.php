<?php
declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $configPath = dirname(__DIR__, 3) . '/config/config.php';
    if (!is_file($configPath)) {
        require_once __DIR__ . '/response.php';
        json_fail('SERVER_ERROR', 500);
    }
    $config = require $configPath;

    try {
        $pdo = new PDO($config['db_dsn'], $config['db_user'], $config['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        error_log('DB connect failed: ' . $e->getMessage());
        require_once __DIR__ . '/response.php';
        json_fail('SERVER_ERROR', 500);
    }
    return $pdo;
}
