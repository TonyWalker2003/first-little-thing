import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define paths
// Use relative path for dist directory
const distDir = './dist';
const htmlPath = path.join(distDir, 'index.html');
const phpPath = path.join(distDir, 'index.php');

console.log('Starting post-build processing...');
console.log(`Checking for index.html at: ${htmlPath}`);

if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Inject PHP Auth Check at the top
  const phpHeader = `<?php
session_start();

// Cache Control
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if (!isset($_SESSION['user_id'])) {
  header("Location: /auth/login.php");
  exit();
}
?>
`;

  // 2. Inject Logout Button into <body>
  const logoutButton = `
  <div style="position: fixed; top: 10px; right: 10px; z-index: 99999;">
    <a href="/auth/logout.php"
      style="display: inline-block; text-decoration: none; background: #dc3545; color: white; padding: 8px 16px; border-radius: 4px; font-family: sans-serif; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      登出
    </a>
  </div>
`;

  // Insert PHP header at the very beginning
  html = phpHeader + html;

  // Insert Logout button after <body> tag
  html = html.replace('<body>', '<body>' + logoutButton);

  // Write to index.php
  fs.writeFileSync(phpPath, html);
  console.log('✅ Created index.php with auth logic.');

  // Delete index.html
  try {
    fs.unlinkSync(htmlPath);
    console.log('🗑️  Removed index.html to avoid conflicts.');
  } catch (err) {
    console.warn('⚠️  Could not remove index.html:', err.message);
  }

  console.log('🎉 Post-build processing complete! App is ready at /dist/index.php');
} else {
  console.warn('⚠️ Warning: index.html not found in dist directory. This is expected if you have not run `vite build` yet.');
}
