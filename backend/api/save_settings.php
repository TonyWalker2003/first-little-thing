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
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

// Prepare data
$start_date = $data['startDate'] ?? null;
$cycle_duration = $data['cycleDuration'] ?? null;
$current_cycle = $data['currentCycle'] ?? null;
$next_appointment = $data['nextAppointment'] ?? null;

// Insert or Update
$sql = "INSERT INTO settings (user_id, start_date, cycle_duration, current_cycle, next_appointment) 
        VALUES (?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        start_date = VALUES(start_date), 
        cycle_duration = VALUES(cycle_duration), 
        current_cycle = VALUES(current_cycle), 
        next_appointment = VALUES(next_appointment)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("isiss", $user_id, $start_date, $cycle_duration, $current_cycle, $next_appointment);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>