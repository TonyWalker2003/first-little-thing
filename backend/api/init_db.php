<?php
require_once __DIR__ . '/../auth/db.php';

// Check if table exists
$checkTable = "SHOW TABLES LIKE 'photos'";
$result = $conn->query($checkTable);

if ($result->num_rows == 0) {
    // Table does not exist, create it
    $sql = "CREATE TABLE photos (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        image_data LONGBLOB NOT NULL,
        mime_type VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL COMMENT 'wearing or not-wearing',
        photo_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    if ($conn->query($sql) === TRUE) {
        echo "Table 'photos' created successfully.";
    } else {
        echo "Error creating table: " . $conn->error;
    }
} else {
    echo "Table 'photos' already exists.";
}

$conn->close();
?>