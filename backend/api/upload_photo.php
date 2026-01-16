<?php
session_start();
require_once __DIR__ . '/../auth/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

if (!isset($_FILES['file']) || !isset($_POST['date']) || !isset($_POST['type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$user_id = $_SESSION['user_id'];
$date = $_POST['date'];
$type = $_POST['type'];
$file = $_FILES['file'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    echo json_encode(['error' => 'File upload error: ' . $file['error']]);
    exit();
}

$mime_type = mime_content_type($file['tmp_name']);
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if (!in_array($mime_type, $allowed_types)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, WEBP allowed.']);
    exit();
}

$image_data = file_get_contents($file['tmp_name']);

// Use prepared statement to prevent SQL injection and handle binary data correctly
$stmt = $conn->prepare("INSERT INTO photos (user_id, image_data, mime_type, type, photo_date) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $user_id, $image_data, $mime_type, $type, $date);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'id' => $stmt->insert_id,
        'message' => 'Photo uploaded successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database insert failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>