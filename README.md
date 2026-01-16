# Aligner Tracker (牙套日記)

A Progressive Web App (PWA) to track your clear aligner (Invisalign/Angelalign) journey. Track wear time, upload daily photos, and sync progress across devices.

## Features

- 📅 **Progress Tracking**: Track current aligner number, days worn, and next appointment.
- 📷 **Photo Diary**: Upload daily "Wearing" and "Not Wearing" photos to monitor teeth movement.
- ☁️ **Cross-Device Sync**: Accounts and data are synchronized via a MySQL database.
- 📱 **Mobile Friendly**: Fully responsive design optimized for mobile use.
- 💾 **Backup/Restore**: Export your data to JSON for safe keeping.

## Technology Stack

- **Frontend**: React, Vite, CSS Modules
- **Backend**: PHP (Vanilla)
- **Database**: MySQL

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PHP (v8.0+)
- MySQL (XAMPP/MAMP recommended)

### Backend Setup
1. Create a MySQL database named `auth_system`.
2. Import the `settings` and `users` tables (Schema to be added).
3. Copy `api/db.example.php` to `api/db.php` and configure your credentials.
   ```php
   $host = 'localhost';
   $user = 'root';
   $pass = 'your_password';
   $dbname = 'auth_system';
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
   The output `dist/` folder contains the static assets.

## License
MIT
