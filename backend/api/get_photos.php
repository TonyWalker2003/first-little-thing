<?php
session_start();
require_once __DIR__ . '/../auth/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$date = isset($_GET['date']) ? $_GET['date'] : null;

$sql = "SELECT id, type, photo_date as date, created_at FROM photos WHERE user_id = ?";
$types = "i";
$params = [$user_id];

if ($date) {
    $sql .= " AND photo_date = ?";
    $types .= "s";
    $params[] = $date;
}

$sql .= " ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$photos = [];
while ($row = $result->fetch_assoc()) {
    // Add a URL field that points to the blob retrieval endpoint
    $row['url'] = "/api/get_photo_blob.php?id=" . $row['id'];
    $photos[] = $row;
}

echo json_encode($photos);

$stmt->close();
$conn->close();
?>