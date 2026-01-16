<?php
date_default_timezone_set('Asia/Taipei');
$host = 'localhost';
$user = 'root';
$pass = 'your_password_here';
$dbname = 'auth_system';

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>