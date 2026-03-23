# Koperasi Backoffice - Update & Backup Guide

## Table of Contents

- [1. Backup Database PostgreSQL](#1-backup-database-postgresql)
- [2. Update Aplikasi Frontend](#2-update-aplikasi-frontend)
- [3. Rollback Jika Ada Masalah](#3-rollback-jika-ada-masalah)
- [4. Backup Database Otomatis (Cron)](#4-backup-database-otomatis-cron)

---

## 1. Backup Database PostgreSQL

### 1.1 Backup Full Database

```bash
# Format: pg_dump -h <host> -U <user> -d <database> -F c -f <output_file>

# Backup dengan format custom (recommended, bisa selective restore)
pg_dump -h localhost -U postgres -d koperasi -F c -f backup_koperasi_$(date +%Y%m%d_%H%M%S).dump

# Backup dengan format SQL plain text (readable)
pg_dump -h localhost -U postgres -d koperasi -f backup_koperasi_$(date +%Y%m%d_%H%M%S).sql

# Backup dengan kompresi gzip
pg_dump -h localhost -U postgres -d koperasi | gzip > backup_koperasi_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 1.2 Backup Tabel Tertentu

```bash
# Backup tabel users saja
pg_dump -h localhost -U postgres -d koperasi -t users -f backup_users_$(date +%Y%m%d_%H%M%S).sql

# Backup beberapa tabel
pg_dump -h localhost -U postgres -d koperasi -t users -t loans -t savings -f backup_partial_$(date +%Y%m%d_%H%M%S).sql
```

### 1.3 Backup Schema Only (Tanpa Data)

```bash
pg_dump -h localhost -U postgres -d koperasi --schema-only -f backup_schema_$(date +%Y%m%d_%H%M%S).sql
```

### 1.4 Backup Data Only (Tanpa Schema)

```bash
pg_dump -h localhost -U postgres -d koperasi --data-only -f backup_data_$(date +%Y%m%d_%H%M%S).sql
```

### 1.5 Restore Database

```bash
# Restore dari format custom (.dump)
pg_restore -h localhost -U postgres -d koperasi -c backup_koperasi_20260323_120000.dump

# Restore dari format SQL (.sql)
psql -h localhost -U postgres -d koperasi < backup_koperasi_20260323_120000.sql

# Restore dari gzip
gunzip -c backup_koperasi_20260323_120000.sql.gz | psql -h localhost -U postgres -d koperasi

# Restore ke database baru (jika ingin test dulu)
createdb -h localhost -U postgres koperasi_restore
pg_restore -h localhost -U postgres -d koperasi_restore backup_koperasi_20260323_120000.dump
```

### 1.6 Verifikasi Backup

```bash
# Cek isi backup (format custom)
pg_restore -l backup_koperasi_20260323_120000.dump

# Cek ukuran file backup
ls -lh backup_koperasi_*.dump

# Test restore ke database temporary
createdb -h localhost -U postgres koperasi_test
pg_restore -h localhost -U postgres -d koperasi_test backup_koperasi_20260323_120000.dump
# Verifikasi data
psql -h localhost -U postgres -d koperasi_test -c "SELECT count(*) FROM users;"
# Hapus database test
dropdb -h localhost -U postgres koperasi_test
```

---

## 2. Update Aplikasi Frontend

### 2.1 Persiapan (Di Server)

```bash
# 1. Masuk ke direktori aplikasi
cd /path/to/koperasi-backoffice

# 2. BACKUP DATABASE DULU! (Wajib sebelum update)
pg_dump -h localhost -U postgres -d koperasi -F c -f ~/backups/backup_koperasi_$(date +%Y%m%d_%H%M%S).dump

# 3. Backup folder build yang sedang jalan (untuk rollback)
cp -r build build_backup_$(date +%Y%m%d_%H%M%S)
```

### 2.2 Update via Git Pull

```bash
# 1. Cek status dan stash perubahan lokal jika ada
git status
git stash  # jika ada perubahan lokal

# 2. Pull perubahan terbaru
git pull origin main

# 3. Install dependencies (jika ada perubahan package.json)
npm install

# 4. Build ulang aplikasi
npm run build

# 5. Restart aplikasi
# Jika pakai PM2:
pm2 restart koperasi-backoffice

# Jika pakai systemd:
sudo systemctl restart koperasi-backoffice

# Jika manual:
# Kill proses yang sedang jalan, lalu:
PORT=3000 node build/index.js
```

### 2.3 Update via Transfer File (Tanpa Git di Server)

Jika server tidak punya git, build di lokal lalu transfer:

```bash
# --- Di Mesin Lokal ---

# 1. Build aplikasi
npm run build

# 2. Buat archive dari folder build
tar -czf koperasi-frontend.tar.gz build/ package.json package-lock.json

# 3. Transfer ke server
scp koperasi-frontend.tar.gz user@server:/path/to/koperasi-backoffice/
```

```bash
# --- Di Server ---

# 1. Masuk ke direktori aplikasi
cd /path/to/koperasi-backoffice

# 2. Backup build lama
cp -r build build_backup_$(date +%Y%m%d_%H%M%S)

# 3. Extract file baru
tar -xzf koperasi-frontend.tar.gz

# 4. Install production dependencies
npm install --production

# 5. Restart aplikasi
pm2 restart koperasi-backoffice
# atau
sudo systemctl restart koperasi-backoffice
```

### 2.4 Verifikasi Setelah Update

```bash
# Cek apakah proses berjalan
pm2 status
# atau
sudo systemctl status koperasi-backoffice

# Cek log untuk error
pm2 logs koperasi-backoffice --lines 50
# atau
journalctl -u koperasi-backoffice -n 50

# Test akses
curl -I http://localhost:3000
```

---

## 3. Rollback Jika Ada Masalah

### 3.1 Rollback Frontend

```bash
# 1. Stop aplikasi
pm2 stop koperasi-backoffice

# 2. Ganti dengan build backup
rm -rf build
cp -r build_backup_20260323_120000 build

# 3. Start ulang
pm2 start koperasi-backoffice
```

### 3.2 Rollback Database

```bash
# 1. Stop semua service yang mengakses database
pm2 stop koperasi-backoffice
# Stop juga Go service jika perlu
sudo systemctl stop koperasi-api

# 2. Restore database dari backup
pg_restore -h localhost -U postgres -d koperasi -c backup_koperasi_20260323_120000.dump

# 3. Start ulang semua service
sudo systemctl start koperasi-api
pm2 start koperasi-backoffice
```

### 3.3 Rollback via Git

```bash
# Lihat commit history
git log --oneline -10

# Kembali ke commit tertentu
git checkout <commit_hash>

# Rebuild
npm install
npm run build

# Restart
pm2 restart koperasi-backoffice
```

---

## 4. Backup Database Otomatis (Cron)

### 4.1 Buat Script Backup

```bash
# Buat file: /home/user/scripts/backup_koperasi.sh
cat << 'SCRIPT' > ~/scripts/backup_koperasi.sh
#!/bin/bash

# Konfigurasi
DB_HOST="localhost"
DB_USER="postgres"
DB_NAME="koperasi"
BACKUP_DIR="/home/user/backups/koperasi"
RETENTION_DAYS=30

# Buat direktori jika belum ada
mkdir -p $BACKUP_DIR

# Nama file backup dengan timestamp
FILENAME="backup_koperasi_$(date +%Y%m%d_%H%M%S).dump"

# Jalankan backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/$FILENAME

# Cek apakah backup berhasil
if [ $? -eq 0 ]; then
    echo "$(date): Backup berhasil - $FILENAME" >> $BACKUP_DIR/backup.log
else
    echo "$(date): Backup GAGAL!" >> $BACKUP_DIR/backup.log
fi

# Hapus backup yang lebih tua dari RETENTION_DAYS hari
find $BACKUP_DIR -name "backup_koperasi_*.dump" -mtime +$RETENTION_DAYS -delete

echo "$(date): Cleanup selesai. Backup lebih dari $RETENTION_DAYS hari dihapus." >> $BACKUP_DIR/backup.log
SCRIPT

# Beri permission execute
chmod +x ~/scripts/backup_koperasi.sh
```

### 4.2 Setup Cron Job

```bash
# Edit crontab
crontab -e

# Tambahkan baris berikut:

# Backup harian jam 2 pagi
0 2 * * * /home/user/scripts/backup_koperasi.sh

# Atau backup setiap 12 jam
0 */12 * * * /home/user/scripts/backup_koperasi.sh
```

### 4.3 Setup Password Tanpa Prompt

Agar `pg_dump` tidak minta password saat dijalankan cron:

```bash
# Buat file .pgpass
echo "localhost:5432:koperasi:postgres:YOUR_PASSWORD" > ~/.pgpass
chmod 600 ~/.pgpass
```

---

## Quick Reference

| Aksi | Command |
|------|---------|
| Backup DB | `pg_dump -h localhost -U postgres -d koperasi -F c -f backup.dump` |
| Restore DB | `pg_restore -h localhost -U postgres -d koperasi -c backup.dump` |
| Build frontend | `npm run build` |
| Start (PM2) | `pm2 start build/index.js --name koperasi-backoffice` |
| Restart (PM2) | `pm2 restart koperasi-backoffice` |
| Lihat log | `pm2 logs koperasi-backoffice` |
| Cek status | `pm2 status` |

> **Catatan**: Ganti `localhost`, `postgres`, `koperasi`, dan path sesuai konfigurasi server Anda.
