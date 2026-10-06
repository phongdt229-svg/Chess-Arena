<?php
declare(strict_types=1);

require_once __DIR__ . '/response.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = app_config();
    if (!isset($config['db_dsn'], $config['db_user'], $config['db_pass'])) {
        json_fail('CONFIG_MISSING', 500);
    }

    try {
        $pdo = new PDO($config['db_dsn'], $config['db_user'], $config['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        server_error($e, 'DB_UNAVAILABLE');
    }
    return $pdo;
}
