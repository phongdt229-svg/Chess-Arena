<?php
declare(strict_types=1);

// Errors must never leak into the JSON body as HTML; they go to the server error log instead
ini_set('display_errors', '0');

function json_ok(array $data = [], int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_fail(string $error, int $status = 400, array $extra = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(array_merge(['ok' => false, 'error' => $error], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

// config/config.php lives one level above the web root; loaded once
function app_config(): array
{
    static $config = null;
    if ($config === null) {
        $path = dirname(__DIR__, 3) . '/config/config.php';
        $loaded = is_file($path) && is_readable($path) ? require $path : null;
        $config = is_array($loaded) ? $loaded : [];
    }
    return $config;
}

// Set 'debug' => true in config.php to include the exception message in 500 responses. Turn it off when done.
function debug_enabled(): bool
{
    return (app_config()['debug'] ?? false) === true;
}

function server_error(Throwable $e, string $code = 'SERVER_ERROR'): never
{
    error_log('chess-arena: ' . get_class($e) . ': ' . $e->getMessage());
    json_fail($code, 500, debug_enabled() ? ['detail' => get_class($e) . ': ' . $e->getMessage()] : []);
}

set_exception_handler(static function (Throwable $e): void {
    server_error($e);
});

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('Allow: ' . $method);
        json_fail('METHOD_NOT_ALLOWED', 405);
    }
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '' || strlen($raw) > 4096) {
        json_fail('VALIDATION');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_fail('VALIDATION');
    }
    return $data;
}
