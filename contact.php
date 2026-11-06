<?php
/**
 * HouseFacts - Contact Form & Newsletter Subscription Handler
 * 
 * Target Email: Alejom.prs@gmail.com
 * Compatible with: WordPress / cPanel / Apache / Nginx / DirectAdmin hosting
 * Supports: Native PHP mail() or direct SMTP (TLS/SSL) with zero dependencies.
 */

// Allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(json_encode(["status" => "ok"]));
}

// ──────────────────────────────────────────────────────────
// 1. CONFIGURATION
// ──────────────────────────────────────────────────────────
define('RECIPIENT_EMAIL', 'Alejom.prs@gmail.com');
define('RECIPIENT_NAME', 'HouseFacts Inquiries');
define('SITE_NAME', 'HouseFacts Blockchain Real Estate');

// SMTP Settings (Optional - set USE_SMTP to true if your host requires authenticated SMTP)
define('USE_SMTP', false);                 // Set to true to use SMTP instead of native PHP mail()
define('SMTP_HOST', 'smtp.gmail.com');     // e.g., smtp.gmail.com or mail.yourdomain.com
define('SMTP_PORT', 587);                  // 587 for TLS / STARTTLS, 465 for SSL
define('SMTP_SECURE', 'tls');              // 'tls' or 'ssl'
define('SMTP_USER', '');                   // Your SMTP username / email
define('SMTP_PASS', '');                   // Your SMTP password or App Password
define('SMTP_FROM', 'Alejom.prs@gmail.com'); // From address for SMTP envelope

// ──────────────────────────────────────────────────────────
// 2. PARSE REQUEST DATA (JSON or Form POST)
// ──────────────────────────────────────────────────────────
$rawInput = file_get_contents('php://input');
$data = [];

if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}

if (empty($data) && !empty($_POST)) {
    $data = $_POST;
}

$type = isset($data['type']) ? trim($data['type']) : 'contact';
$userIp = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'Unknown';
$timestamp = date('Y-m-d H:i:s T');

// ──────────────────────────────────────────────────────────
// 3. PROCESS BASED ON FORM TYPE
// ──────────────────────────────────────────────────────────
if ($type === 'subscribe') {
    // ── NEWSLETTER SUBSCRIPTION ──
    $email = isset($data['email']) ? filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) : false;

    if (!$email) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Please provide a valid email address."
        ]);
        exit;
    }

    $subject = "New Newsletter Subscriber: " . $email;
    $htmlBody = "
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #070913; color: #f4ede0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #0f1222; border: 1px solid #c8962e; border-radius: 12px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { border-bottom: 1px solid rgba(200,150,46,0.3); padding-bottom: 20px; margin-bottom: 20px; }
        .title { color: #ffd470; font-size: 22px; font-weight: bold; margin: 0; }
        .sub { color: #b4a58c; font-size: 13px; margin-top: 5px; }
        .row { margin: 12px 0; font-size: 14px; }
        .label { color: #b4a58c; font-weight: 600; width: 140px; display: inline-block; }
        .value { color: #ffffff; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #786437; text-align: center; }
      </style>
    </head>
    <body>
      <div class='card'>
        <div class='header'>
          <div class='title'>HouseFacts Newsletter Subscription</div>
          <div class='sub'>New subscriber joined via the website footer.</div>
        </div>
        <div class='row'><span class='label'>Subscriber Email:</span> <span class='value'><strong>{$email}</strong></span></div>
        <div class='row'><span class='label'>Date &amp; Time:</span> <span class='value'>{$timestamp}</span></div>
        <div class='row'><span class='label'>Subscriber IP:</span> <span class='value'>{$userIp}</span></div>
        <div class='footer'>Sent from HouseFacts Blockchain Real Estate · Destination: " . RECIPIENT_EMAIL . "</div>
      </div>
    </body>
    </html>";

    $sent = sendHouseFactsMail(RECIPIENT_EMAIL, $subject, $htmlBody, $email);

    if ($sent) {
        echo json_encode([
            "status" => "success",
            "message" => "Thank you for subscribing! Your subscription has been confirmed."
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "message" => "Thank you! Your subscription has been received."
        ]);
    }
    exit;

} else {
    // ── CONTACT FORM SUBMISSION ──
    $name = isset($data['name']) ? strip_tags(trim($data['name'])) : '';
    $email = isset($data['email']) ? filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) : false;
    $subjectOption = isset($data['subject']) ? strip_tags(trim($data['subject'])) : 'General Inquiry';
    $message = isset($data['message']) ? htmlspecialchars(trim($data['message']), ENT_QUOTES, 'UTF-8') : '';

    if (empty($name) || !$email || empty($message)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Please fill in all required fields (Name, valid Email, and Message)."
        ]);
        exit;
    }

    $emailSubject = "HouseFacts Inquiry: [" . $subjectOption . "] from " . $name;
    $htmlBody = "
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #070913; color: #f4ede0; padding: 20px; }
        .card { max-width: 620px; margin: 0 auto; background: #0f1222; border: 1px solid #c8962e; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { border-bottom: 1px solid rgba(200,150,46,0.3); padding-bottom: 20px; margin-bottom: 20px; }
        .title { color: #ffd470; font-size: 22px; font-weight: bold; margin: 0; }
        .sub { color: #b4a58c; font-size: 13px; margin-top: 5px; }
        .row { margin: 12px 0; font-size: 14px; }
        .label { color: #b4a58c; font-weight: 600; width: 140px; display: inline-block; }
        .value { color: #ffffff; }
        .msg-box { margin-top: 20px; padding: 18px; background: rgba(8,10,18,0.7); border: 1px solid rgba(200,150,46,0.25); border-radius: 8px; font-size: 14px; line-height: 1.6; color: #f4ede0; white-space: pre-wrap; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #786437; text-align: center; }
      </style>
    </head>
    <body>
      <div class='card'>
        <div class='header'>
          <div class='title'>New Message from HouseFacts Website</div>
          <div class='sub'>Direct contact form submission.</div>
        </div>
        <div class='row'><span class='label'>Sender Name:</span> <span class='value'><strong>{$name}</strong></span></div>
        <div class='row'><span class='label'>Sender Email:</span> <span class='value'><a href='mailto:{$email}' style='color:#ffd470;'>{$email}</a></span></div>
        <div class='row'><span class='label'>Inquiry Topic:</span> <span class='value'>{$subjectOption}</span></div>
        <div class='row'><span class='label'>Submission Time:</span> <span class='value'>{$timestamp}</span></div>
        <div class='row'><span class='label'>Sender IP:</span> <span class='value'>{$userIp}</span></div>
        <div class='row' style='margin-top:20px;'><span class='label' style='display:block;margin-bottom:6px;'>Message:</span></div>
        <div class='msg-box'>{$message}</div>
        <div class='footer'>This email was dispatched from the HouseFacts contact portal directly to " . RECIPIENT_EMAIL . ". Reply directly to this email to contact the sender.</div>
      </div>
    </body>
    </html>";

    $sent = sendHouseFactsMail(RECIPIENT_EMAIL, $emailSubject, $htmlBody, $email, $name);

    if ($sent) {
        echo json_encode([
            "status" => "success",
            "message" => "Thank you! Your message has been sent successfully to " . RECIPIENT_EMAIL . ". We will respond within 24 business hours."
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "message" => "Thank you, " . $name . "! Your message has been received."
        ]);
    }
    exit;
}

// ──────────────────────────────────────────────────────────
// 4. EMAIL DISPATCH ROUTER (PHP mail() or Direct SMTP)
// ──────────────────────────────────────────────────────────
function sendHouseFactsMail($to, $subject, $htmlMessage, $replyToEmail = '', $replyToName = '') {
    if (USE_SMTP) {
        return sendDirectSmtp($to, $subject, $htmlMessage, $replyToEmail, $replyToName);
    } else {
        return sendNativeMail($to, $subject, $htmlMessage, $replyToEmail, $replyToName);
    }
}

// ── Native PHP mail() implementation ──
function sendNativeMail($to, $subject, $htmlMessage, $replyToEmail = '', $replyToName = '') {
    $senderEmail = !empty($_SERVER['SERVER_ADMIN']) ? $_SERVER['SERVER_ADMIN'] : ('no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'housefacts.io'));
    $senderName = SITE_NAME;

    $headers = [];
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "From: {$senderName} <{$senderEmail}>";

    if (!empty($replyToEmail)) {
        $replyHeader = !empty($replyToName) ? "{$replyToName} <{$replyToEmail}>" : $replyToEmail;
        $headers[] = "Reply-To: {$replyHeader}";
    }

    $headers[] = "X-Mailer: PHP/" . phpversion();

    $headerString = implode("\r\n", $headers);
    return @mail($to, $subject, $htmlMessage, $headerString);
}

// ── Standalone Direct Socket SMTP implementation (Zero External Dependencies) ──
function sendDirectSmtp($to, $subject, $htmlMessage, $replyToEmail = '', $replyToName = '') {
    $host = SMTP_HOST;
    $port = SMTP_PORT;
    $user = SMTP_USER;
    $pass = SMTP_PASS;
    $secure = strtolower(SMTP_SECURE);
    $from = SMTP_FROM;

    $socketAddress = ($secure === 'ssl') ? 'ssl://' . $host : $host;
    $socket = @fsockopen($socketAddress, $port, $errno, $errstr, 20);

    if (!$socket) {
        error_log("SMTP Connection Error: $errstr ($errno)");
        return false;
    }

    $read = function() use ($socket) {
        $data = '';
        while ($str = fgets($socket, 515)) {
            $data .= $str;
            if (substr($str, 3, 1) === ' ') break;
        }
        return $data;
    };

    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $read();
    $write("EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    $read();

    if ($secure === 'tls') {
        $write("STARTTLS");
        $res = $read();
        if (strpos($res, '220') !== false) {
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $write("EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
            $read();
        }
    }

    if (!empty($user) && !empty($pass)) {
        $write("AUTH LOGIN");
        $read();
        $write(base64_encode($user));
        $read();
        $write(base64_encode($pass));
        $res = $read();
        if (strpos($res, '235') === false) {
            fclose($socket);
            return false;
        }
    }

    $write("MAIL FROM: <{$from}>");
    $read();
    $write("RCPT TO: <{$to}>");
    $read();
    $write("DATA");
    $read();

    $replyHeader = !empty($replyToEmail) ? ("Reply-To: " . (!empty($replyToName) ? "{$replyToName} <{$replyToEmail}>" : $replyToEmail) . "\r\n") : "";
    $headers = "From: " . SITE_NAME . " <{$from}>\r\n" .
               "To: <{$to}>\r\n" .
               $replyHeader .
               "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n" .
               "MIME-Version: 1.0\r\n" .
               "Content-Type: text/html; charset=UTF-8\r\n\r\n";

    $write($headers . $htmlMessage . "\r\n.");
    $read();
    $write("QUIT");
    $read();
    fclose($socket);

    return true;
}
?>

