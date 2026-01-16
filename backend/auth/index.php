<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php"); // 沒登入就踢回登入頁
    exit();
}
?>

<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>會員中心</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-5 text-center">
    <div class="container">
        <h1 class="display-4">歡迎回來，<?php echo htmlspecialchars($_SESSION['username']); ?>！</h1>
        <p class="lead">這是一個受保護的頁面，只有登入後才能看到。</p>
        <hr class="my-4">
        <a href="logout.php" class="btn btn-danger btn-lg">登出</a>
    </div>
</body>
</html>