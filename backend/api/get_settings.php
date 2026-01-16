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

// Join users table to get username, even if settings don't exist yet
$stmt = $conn->prepare("
    SELECT u.username, s.start_date, s.cycle_duration, s.current_cycle, s.next_appointment 
    FROM users u 
    LEFT JOIN settings s ON u.id = s.user_id 
    WHERE u.id = ?
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $conn->error]);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$response = [];

if ($row = $result->fetch_assoc()) {
    $response['username'] = $row['username'];

    // Only verify settings exist if start_date is not null (due to LEFT JOIN)
    if ($row['start_date']) {
        $response['startDate'] = $row['start_date'];
        $response['cycleDuration'] = $row['cycle_duration'];
        $response['currentCycle'] = $row['current_cycle'];
        $response['nextAppointment'] = $row['next_appointment'];
    }
} else {
    // Should typically not happen if user_id is valid from session, but safe check
    $response['username'] = $_SESSION['username'] ?? '';
}

echo json_encode($response);

$stmt->close();
$conn->close();
?>