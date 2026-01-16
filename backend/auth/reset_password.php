<?php
require 'db.php';
$message = "";
$token = $_GET['token'] ?? "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $token = $_POST['token'];
    $new_password = $_POST['password'];

    // 檢查 Token 是否有效且未過期
    $stmt = $conn->prepare("SELECT id FROM users WHERE reset_token = ? AND token_expire > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // 更新密碼並清除 Token
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        
        $update = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, token_expire = NULL WHERE reset_token = ?");
        $update->bind_param("ss", $hashed_password, $token);
        
        if ($update->execute()) {
            $message = "密碼修改成功！<a href='login.php'>立即登入</a>";
        } else {
            $message = "修改失敗。";
        }
    } else {
        $message = "連結無效或已過期。";
    }
}
?>

<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>設定新密碼</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="d-flex align-items-center justify-content-center vh-100 bg-light">
    <div class="card p-4 shadow" style="width: 400px;">
        <h3 class="text-center mb-3">設定新密碼</h3>
        <?php if($message): ?>
            <div class="alert alert-success"><?php echo $message; ?></div>
        <?php else: ?>
            <form method="post">
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
                <div class="mb-3">
                    <label>新密碼</label>
                    <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">確認修改</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>