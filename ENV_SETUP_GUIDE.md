# 🔧 Environment Setup Guide

## 📋 Setting up .env file

File `.env` tidak disertakan dalam repository untuk alasan keamanan. Ikuti langkah berikut untuk setup:

### 1. Copy .env.example

```bash
cp .env.example .env
```

### 2. Generate Application Key

```bash
php artisan key:generate
```

### 3. Configure Database

Edit file `.env` dan sesuaikan kredensial database:

```properties
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=point_of_sales
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Set Application URL

```properties
APP_URL=http://your-domain.com
```

### 5. Configure Mail (Optional)

Jika menggunakan email notifications:

```properties
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

## 🛡️ Security Notes

-   ⚠️ **JANGAN** commit file `.env` ke repository
-   ✅ File `.env` sudah ada di `.gitignore`
-   🔐 Gunakan `APP_KEY` yang kuat (generated otomatis)
-   🔒 Pastikan `APP_DEBUG=false` di production

## 🚀 Production Setup

Untuk production environment:

```properties
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-production-domain.com
```

---

Generated: September 6, 2025
