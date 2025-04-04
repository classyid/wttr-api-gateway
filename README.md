# wttr-api-gateway 🌦️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)](https://developers.google.com/apps-script)

Layanan API cuaca sederhana yang mengambil data dari [wttr.in](https://wttr.in) dengan format JSON yang terstruktur, dilengkapi dengan logging dan notifikasi Telegram. Dibangun menggunakan Google Apps Script.

## 🚀 Fitur

- ✅ Mengambil data cuaca dari wttr.in berdasarkan koordinat lokasi
- ✅ Mengubah data menjadi format JSON yang lebih terstruktur dan mudah digunakan
- ✅ Dokumentasi API yang sederhana dan informatif
- ✅ Pencatatan log akses lengkap ke Google Spreadsheet
- ✅ Notifikasi Telegram untuk event penting dan error
- ✅ Mudah di-deploy dan digunakan

## 🛠️ Cara Menggunakan

### Setup

1. Buat project baru di [Google Apps Script](https://script.google.com)
2. Copy-paste kode dari file `weather-api.gs` ke editor
3. Ganti nilai konfigurasi di bagian `CONFIG` sesuai kebutuhan:
   ```javascript
   var CONFIG = {
     SPREADSHEET_ID: "YOUR_SPREADSHEET_ID",
     LOG_SHEET_NAME: "logAPI",
     TELEGRAM_BOT_TOKEN: "YOUR_BOT_TOKEN",
     TELEGRAM_CHAT_ID: "YOUR_CHAT_ID"
   };
   ```
4. Simpan project
5. Jalankan fungsi `setupLogSpreadsheet()` untuk menyiapkan spreadsheet log
6. Deploy sebagai Web App:
   - Pilih "Deploy" > "New deployment"
   - Pilih tipe "Web app"
   - Atur akses ke "Anyone"
   - Klik "Deploy"
   - Salin URL yang dihasilkan

### Penggunaan API

Untuk mengakses API, gunakan URL dengan parameter `loc`:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?loc=LATITUDE,LONGITUDE
```

Contoh:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?loc=-7.8603934,112.0381211
```

Untuk melihat dokumentasi API, akses URL tanpa parameter:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## 📊 Format Respons

Respons API dalam format JSON:

```json
{
  "location": {
    "coordinates": "-7.8603934,112.0381211",
    "name": "Kediri",
    "region": "East Java",
    "country": "Indonesia"
  },
  "current": {
    "tempC": "24",
    "weatherDesc": "Cerah",
    "windspeedKmph": "10",
    "humidity": "85",
    "precipMM": "0.0",
    "visibility": "10",
    "pressure": "1009",
    "feelsLikeC": "26",
    "uvIndex": "1"
  },
  "forecast": [
    {
      "date": "2023-04-04",
      "astronomy": {
        "sunrise": "05:36 AM",
        "sunset": "05:45 PM"
      },
      "maxTempC": "30",
      "minTempC": "24",
      "hourly": [
        // Data per jam
      ]
    }
  ],
  "timestamp": "2023-04-04T08:30:45.123Z",
  "source": "wttr.in"
}
```

## 📝 Monitoring dan Logging

- **Log Akses**: Semua akses API dicatat dalam spreadsheet yang ditentukan
- **Notifikasi Telegram**: Error dan aktivitas penting dikirim ke bot Telegram

## ⚠️ Batasan

- Data diambil dari wttr.in, ketersediaan dan akurasi tergantung pada layanan tersebut
- Google Apps Script memiliki [batas kuota](https://developers.google.com/apps-script/guides/services/quotas) untuk eksekusi
- IP yang dicatat adalah IP server, bukan IP pengguna yang sebenarnya

## 📄 Lisensi

Project ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detail.

## 🙏 Kredit

- [wttr.in](https://github.com/chubin/wttr.in) untuk data cuaca
- [ipify.org](https://www.ipify.org/) untuk layanan deteksi IP

---

Dibuat dengan ❤️ oleh [Andri Wiratmono](https://github.com/classyid)
