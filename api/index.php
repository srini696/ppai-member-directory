<?php
/**
 * PPAI Member Directory — API Router
 * Routes requests to appropriate handlers. Run with: php -S localhost:8000
 */

require_once __DIR__ . '/members.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Method not allowed']);
    exit;
}

// Apply optional year filter and sorting from query params
function applyFiltersAndSort(array $members): array {
    // Year filter
    if (isset($_GET['year']) && $_GET['year'] !== '') {
        $year = (int) $_GET['year'];
        if (isset($_GET['year_lte']) && $_GET['year_lte'] === '1') {
            $members = filterByYearOrEarlier($members, $year);
        } else {
            $members = filterByYear($members, $year);
        }
    }

    // Sorting
    $sortField = $_GET['sort'] ?? '';
    $sortOrder = $_GET['order'] ?? 'asc';
    if (in_array($sortField, ['name', 'company', 'year'])) {
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'asc';
        $members = sortMembers($members, $sortField, $sortOrder);
    }

    return $members;
}

// Parse the request URI (strip query string)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

// Route: GET /api/members/search?query=X&company=Y (must precede /api/members/{id} regex)
if ($uri === '/api/members/search') {
    $nameQuery = $_GET['query'] ?? '';
    $companyQuery = $_GET['company'] ?? '';
    if ($nameQuery === '' && $companyQuery === '') {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Missing required parameter: query or company']);
        exit;
    }
    $members = applyFiltersAndSort(searchMembers($nameQuery, $companyQuery));
    echo json_encode(['data' => $members, 'total' => count($members)]);
    exit;
}

// Route: GET /api/members/{id}
if (preg_match('#^/api/members/(\d+)$#', $uri, $matches)) {
    $id = (int) $matches[1];
    $member = getMemberById($id);
    if ($member === null) {
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Member not found']);
        exit;
    }
    echo json_encode(['data' => $member]);
    exit;
}

// Route: GET /api/members
if ($uri === '/api/members') {
    $members = applyFiltersAndSort(getAllMembers());
    echo json_encode(['data' => $members, 'total' => count($members)]);
    exit;
}

// 404 for unknown routes
http_response_code(404);
echo json_encode(['error' => true, 'message' => 'Endpoint not found']);
