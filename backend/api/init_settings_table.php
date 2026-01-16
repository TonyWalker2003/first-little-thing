<?php
require_once __DIR__ . '/../auth/db.php';

// Check if table exists
$checkTable = "SHOW TABLES LIKE 'settings'";
$result = $conn->query($checkTable);

if ($result->num_rows == 0) {
    // Table does not exist, create it
    $sql = "CREATE TABLE settings (
        user_id INT(11) NOT NULL PRIMARY KEY,
        start_date DATE,
        cycle_duration INT(11),
        current_cycle INT(11),
        next_appointment DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    if ($conn->query($sql) === TRUE) {
        echo "Table 'settings' created successfully.";
    } else {
        echo "Error creating table: " . $conn->error;
    }
} else {
    echo "Table 'settings' already exists.";
}

$conn->close();
?>