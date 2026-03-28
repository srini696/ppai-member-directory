<?php
/**
 * Serves both the API and frontend static files from a single PHP process.
 * Run with: php -S 0.0.0.0:8000 server.php
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve API routes
if (str_starts_with($uri, '/api/')) {
    require __DIR__ . '/api/index.php';
    return true;
}

// Serve static files from public/
$staticFile = __DIR__ . '/public' . $uri;

// Default to index.html for root
if ($uri === '/' || $uri === '') {
    $staticFile = __DIR__ . '/public/index.html';
}

// If the file exists, serve it with correct content type
if (is_file($staticFile)) {
    $ext = pathinfo($staticFile, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
    ];
    $mime = $mimeTypes[$ext] ?? 'application/octet-stream';
    header("Content-Type: $mime");
    readfile($staticFile);
    return true;
}

// 404 for everything else
http_response_code(404);
echo '404 Not Found';
