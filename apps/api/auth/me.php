<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';

require_method('GET');
json_ok(['user' => public_user(require_user())]);
