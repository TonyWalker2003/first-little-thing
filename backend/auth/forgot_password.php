<?php
// 引入 PHPMailer 類別
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'db.php';

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];

    // 1. 檢查 Email 是否存在
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // 2. 產生 Token 和 過期時間 (30分鐘後過期)
        $token = bin2hex(random_bytes(50));
        $expire = date("Y-m-d H:i:s", strtotime('+30 minutes'));

        // 3. 存入資料庫
        $update = $conn->prepare("UPDATE users SET reset_token=?, token_expire=? WHERE email=?");
        $update->bind_param("sss", $token, $expire, $email);
        $update->execute();

        // 4. 設定 PHPMailer 發信
        $mail = new PHPMailer(true);

        try {
            // --- SMTP 設定 ---
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = '01068113@email.ntou.edu.tw'; // ★ 請改成你的 Gmail
            $mail->Password = 'yrob dpqp ldya xwti';  // ★ 請改成你的 Google 應用程式密碼 (不是登入密碼)
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            $mail->CharSet = 'UTF-8'; // 支援中文

            // --- 寄件資訊 ---
            $mail->setFrom('01068113@email.ntou.edu.tw', '我的網站管理員'); // ★ 改成你的 Email
            $mail->addAddress($email); // 收件人

            // --- 郵件內容 ---
            $reset_link = "http://localhost/auth/reset_password.php?token=" . $token;

            $mail->isHTML(true);
            $mail->Subject = '重置您的密碼';
            $mail->Body = "你好，<br><br>請點擊下方連結重置密碼 (30分鐘內有效)：<br><a href='$reset_link'>$reset_link</a>";

            $mail->send();
            $message = "重置連結已寄出！請檢查您的信箱。";
        } catch (Exception $e) {
            $message = "郵件發送失敗: {$mail->ErrorInfo}";
        }
    } else {
        $message = "找不到此 Email 帳號。";
    }
}
?>

<!DOCTYPE html>
<html lang="zh-TW">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>忘記密碼</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="d-flex align-items-center justify-content-center vh-100 bg-light">
    <div class="card p-4 shadow" style="width: 400px;">
        <h3 class="text-center mb-3">重置密碼</h3>
        <?php if ($message): ?>
            <div class="alert alert-info"><?php echo $message; ?></div>
        <?php endif; ?>
        <form method="post">
            <div class="mb-3">
                <label>請輸入您的 Email</label>
                <input type="email" name="email" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-warning w-100">發送重置連結</button>
        </form>
        <div class="mt-3 text-center">
            <a href="login.php">返回登入</a>
        </div>
    </div>
</body>

</html>