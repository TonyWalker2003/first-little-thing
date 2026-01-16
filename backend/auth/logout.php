<?php
session_start();
session_destroy(); // 清除所有 Session
header("Location: login.php");
exit();
?>