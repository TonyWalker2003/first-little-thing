<?php
session_start();
require_once __DIR__ . '/../auth/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

// Support both JSON body and POST params
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? $input['id'] : (isset($_POST['id']) ? $_POST['id'] : null);

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing ID']);
    exit();
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM photos WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $user_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Photo deleted']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Photo not found or permission denied']);
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>