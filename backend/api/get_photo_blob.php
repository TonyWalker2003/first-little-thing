<?php
session_start();
require_once __DIR__ . '/../auth/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit('Unauthorized');
}

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit('Missing ID');
}

$user_id = $_SESSION['user_id'];
$id = $_GET['id'];

$stmt = $conn->prepare("SELECT image_data, mime_type FROM photos WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $user_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($image_data, $mime_type);
    $stmt->fetch();

    header("Content-Type: " . $mime_type);
    // Optional: caching headers
    header("Cache-Control: private, max-age=86400");

    echo $image_data;
} else {
    http_response_code(404);
    echo "Image not found";
}

$stmt->close();
$conn->close();
?>