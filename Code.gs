/**
 * Web App untuk mengambil data cuaca dari wttr.in dan mengkonversinya ke JSON
 * Cara penggunaan:
 * 1. Deploy sebagai web app
 * 2. Akses dengan parameter 'loc' untuk lokasi, contoh: ?loc=-7.8603934,112.0381211
 */

// KONFIGURASI
var CONFIG = {
  SPREADSHEET_ID: "<ID-SPREDSHEET>",
  LOG_SHEET_NAME: "logAPI",
  TELEGRAM_BOT_TOKEN: "<TOKEN-ID>",
  TELEGRAM_CHAT_ID: "<CHAT-ID>"
};

function doGet(e) {
  var startTime = new Date();
  var userIP = getIpAddress();  // Mendapatkan IP menggunakan ipify
  
  // Jika tidak ada parameter, tampilkan dokumentasi API
  if (!e.parameter.loc) {
    logAccess(startTime, new Date(), userIP, "/", "DOCS", "Success", 200, "Menampilkan dokumentasi API");
    return serveApiDocs();
  }
  
  try {
    // Ambil parameter lokasi
    var location = e.parameter.loc; // Parameter lokasi harus disediakan
    
    // URL untuk wttr.in dengan format plain
    var url = "https://wttr.in/" + location + "?format=j1";
    
    // Lakukan request ke wttr.in untuk format JSON (j1 format)
    var response = UrlFetchApp.fetch(url);
    var jsonData = JSON.parse(response.getContentText());
    
    // Untuk mendapatkan tampilan HTML juga (opsional)
    var htmlUrl = "https://wttr.in/" + location;
    var htmlResponse = UrlFetchApp.fetch(htmlUrl);
    var htmlContent = htmlResponse.getContentText();
    
    // Ekstrak data cuaca yang relevan dan format ulang
    var weatherData = processWeatherData(jsonData, htmlContent, location);
    
    // Log akses sukses
    logAccess(startTime, new Date(), userIP, "/loc=" + location, "GET", "Success", 200, "Data cuaca berhasil diambil");
    
    // Kembalikan data dalam format JSON
    return ContentService.createTextOutput(JSON.stringify(weatherData))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log akses gagal
    logAccess(startTime, new Date(), userIP, "/loc=" + location, "GET", "Error", 500, error.toString());
    
    // Handling error
    return ContentService.createTextOutput(JSON.stringify({
      error: true,
      message: "Error: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Memproses data cuaca dari wttr.in dan mengekstrak informasi yang diperlukan
 */
function processWeatherData(jsonData, htmlContent, location) {
  // Ambil data saat ini
  var current = jsonData.current_condition[0];
  
  // Ambil ramalan 3 hari
  var forecast = jsonData.weather.map(function(day) {
    return {
      date: day.date,
      astronomy: day.astronomy[0],
      maxTempC: day.maxtempC,
      minTempC: day.mintempC,
      hourly: day.hourly.map(function(hour) {
        return {
          time: hour.time,
          tempC: hour.tempC,
          weatherDesc: hour.weatherDesc[0].value,
          precipMM: hour.precipMM,
          humidity: hour.humidity,
          windspeedKmph: hour.windspeedKmph,
          winddir16Point: hour.winddir16Point
        };
      })
    };
  });
  
  // Ekstrak informasi lokasi
  var locationInfo = {
    coordinates: location,
    name: jsonData.nearest_area ? jsonData.nearest_area[0].areaName[0].value : "Unknown",
    region: jsonData.nearest_area ? jsonData.nearest_area[0].region[0].value : "Unknown",
    country: jsonData.nearest_area ? jsonData.nearest_area[0].country[0].value : "Unknown"
  };
  
  // Menggabungkan semua informasi
  return {
    location: locationInfo,
    current: {
      tempC: current.temp_C,
      weatherDesc: current.weatherDesc[0].value,
      windspeedKmph: current.windspeedKmph,
      humidity: current.humidity,
      precipMM: current.precipMM,
      visibility: current.visibility,
      pressure: current.pressure,
      cloudcover: current.cloudcover,
      feelsLikeC: current.FeelsLikeC,
      uvIndex: current.uvIndex
    },
    forecast: forecast,
    timestamp: new Date().toISOString(),
    source: "wttr.in"
  };
}

/**
 * Fungsi tambahan untuk mengekstrak data dari HTML jika format JSON tidak cukup
 * Ini bisa digunakan jika ada informasi spesifik yang hanya tersedia di tampilan HTML
 */
function extractFromHtml(html, pattern) {
  var regex = new RegExp(pattern);
  var match = regex.exec(html);
  return match ? match[1] : null;
}

/**
 * Fungsi untuk menampilkan dokumentasi API yang sederhana dan informatif
 */
function serveApiDocs() {
  var apiName = "Weather API Grabber";
  var version = "v1.0";
  var lastUpdate = new Date().toISOString().split('T')[0];
  
  var html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${apiName}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px;
        color: #333;
        background-color: #f9f9f9;
      }
      .container {
        max-width: 700px;
        margin: 0 auto;
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      h1 {
        color: #2c3e50;
        margin-top: 0;
      }
      code {
        background-color: #f0f0f0;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
      }
      .example {
        background-color: #f0f8ff;
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
        border-left: 4px solid #3498db;
      }
      .endpoint {
        font-weight: bold;
        color: #2980b9;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${apiName}</h1>
      <p>Versi: ${version} | Terakhir Diperbarui: ${lastUpdate}</p>
      
      <h2>Cara Penggunaan:</h2>
      <p>Tambahkan parameter <code>loc</code> dengan nilai koordinat lokasi (latitude,longitude).</p>
      
      <div class="example">
        <p><span class="endpoint">GET</span> <code>${ScriptApp.getService().getUrl()}?loc=-7.8603934,112.0381211</code></p>
      </div>
      
      <h2>Contoh Respons:</h2>
      <div class="example">
        <code>
        {<br>
        &nbsp;&nbsp;"location": {<br>
        &nbsp;&nbsp;&nbsp;&nbsp;"coordinates": "-7.8603934,112.0381211",<br>
        &nbsp;&nbsp;&nbsp;&nbsp;"name": "Kediri"<br>
        &nbsp;&nbsp;},<br>
        &nbsp;&nbsp;"current": {<br>
        &nbsp;&nbsp;&nbsp;&nbsp;"tempC": "24",<br>
        &nbsp;&nbsp;&nbsp;&nbsp;"weatherDesc": "Cerah"<br>
        &nbsp;&nbsp;},<br>
        &nbsp;&nbsp;"forecast": [ ... ],<br>
        &nbsp;&nbsp;"timestamp": "2025-04-04T08:30:45.123Z"<br>
        }
        </code>
      </div>
      
      <p><strong>Catatan:</strong> Data cuaca disediakan oleh wttr.in. Gunakan API ini dengan bijak.</p>
      
      <footer style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
        <p>&copy; ${new Date().getFullYear()} Weather API Grabber</p>
      </footer>
    </div>
  </body>
  </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * Fungsi untuk mencatat log akses ke spreadsheet dan mengirim notifikasi Telegram
 * @param {Date} startTime - Waktu mulai request
 * @param {Date} endTime - Waktu selesai request
 * @param {string} ip - IP pengguna
 * @param {string} endpoint - Endpoint yang diakses
 * @param {string} method - Metode HTTP
 * @param {string} status - Status akses (Success/Error)
 * @param {number} statusCode - Kode status HTTP
 * @param {string} message - Pesan tambahan
 */
function logAccess(startTime, endTime, ip, endpoint, method, status, statusCode, message) {
  try {
    // Log ke spreadsheet
    logToSpreadsheet(startTime, endTime, ip, endpoint, method, status, statusCode, message);
    
    // Kirim notifikasi Telegram untuk error atau aktivitas penting
    if (status === "Error" || endpoint.includes("new") || statusCode >= 400) {
      sendTelegramNotification(startTime, ip, endpoint, method, status, statusCode, message);
    }
  } catch (error) {
    console.error("Gagal mencatat log: " + error.toString());
  }
}

/**
 * Mencatat log ke spreadsheet
 */
function logToSpreadsheet(startTime, endTime, ip, endpoint, method, status, statusCode, message) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
    
    // Buat sheet jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
      sheet.appendRow([
        "Timestamp", 
        "Durasi (ms)", 
        "IP", 
        "Endpoint", 
        "Method", 
        "Status", 
        "Status Code", 
        "Message"
      ]);
    }
    
    // Hitung durasi dalam milidetik
    var duration = endTime.getTime() - startTime.getTime();
    
    // Tambahkan log baru
    sheet.appendRow([
      new Date(), 
      duration, 
      ip, 
      endpoint, 
      method, 
      status, 
      statusCode, 
      message
    ]);
  } catch (error) {
    console.error("Gagal mencatat log ke spreadsheet: " + error.toString());
  }
}

/**
 * Mengirim notifikasi ke Telegram
 */
function sendTelegramNotification(startTime, ip, endpoint, method, status, statusCode, message) {
  try {
    var telegramApiUrl = "https://api.telegram.org/bot" + CONFIG.TELEGRAM_BOT_TOKEN + "/sendMessage";
    
    // Format pesan
    var formattedDate = Utilities.formatDate(startTime, "Asia/Jakarta", "dd-MM-yyyy HH:mm:ss");
    var telegramMessage = 
      "🔔 *Weather API Alert*\n" +
      "⏰ *Time:* " + formattedDate + "\n" +
      "🌐 *IP:* " + ip + "\n" +
      "🔗 *Endpoint:* " + endpoint + "\n" +
      "📝 *Method:* " + method + "\n" +
      "📊 *Status:* " + status + " (" + statusCode + ")\n" +
      "📄 *Message:* " + message;
    
    // Kirim pesan ke Telegram
    var payload = {
      "chat_id": CONFIG.TELEGRAM_CHAT_ID,
      "text": telegramMessage,
      "parse_mode": "Markdown"
    };
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload)
    };
    
    UrlFetchApp.fetch(telegramApiUrl, options);
  } catch (error) {
    console.error("Gagal mengirim notifikasi Telegram: " + error.toString());
  }
}

/**
 * Fungsi untuk mengatur spreadsheet log saat pertama kali
 */
function setupLogSpreadsheet() {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
      
      // Format header
      sheet.appendRow([
        "Timestamp", 
        "Durasi (ms)", 
        "IP", 
        "Endpoint", 
        "Method", 
        "Status", 
        "Status Code", 
        "Message"
      ]);
      
      // Mempercantik header
      sheet.getRange(1, 1, 1, 8).setBackground("#4285F4").setFontColor("white").setFontWeight("bold");
      
      // Menyesuaikan lebar kolom
      sheet.setColumnWidth(1, 180); // Timestamp
      sheet.setColumnWidth(2, 100); // Durasi
      sheet.setColumnWidth(3, 120); // IP
      sheet.setColumnWidth(4, 200); // Endpoint
      sheet.setColumnWidth(5, 80);  // Method
      sheet.setColumnWidth(6, 100); // Status
      sheet.setColumnWidth(7, 100); // Status Code
      sheet.setColumnWidth(8, 300); // Message
      
      // Membekukan baris header
      sheet.setFrozenRows(1);
      
      // Menambahkan filter
      sheet.getRange(1, 1, 1, 8).createFilter();
    }
    
    return "Spreadsheet log berhasil diatur";
  } catch (error) {
    return "Gagal mengatur spreadsheet log: " + error.toString();
  }
}

/**
 * Fungsi untuk menguji pengiriman notifikasi Telegram
 */
function testTelegramNotification() {
  sendTelegramNotification(
    new Date(), 
    "127.0.0.1", 
    "/test", 
    "GET", 
    "Test", 
    200, 
    "Ini adalah pesan tes"
  );
  return "Notifikasi tes dikirim";
}

/**
 * Fungsi untuk mendapatkan alamat IP
 * @return {string} Alamat IP atau 'Unknown' jika gagal
 */
function getIpAddress() {
  var url = 'https://api.ipify.org';
  var options = {
    'method': 'GET',
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      return response.getContentText();
    } else {
      console.error('Error fetching IP address. Response code:', response.getResponseCode());
      return 'Unknown';
    }
  } catch (e) {
    console.error('Error fetching IP address:', e);
    return 'Unknown';
  }
}

/**
 * Alternatif mendapatkan IP dengan mencoba beberapa layanan IP
 * Mencoba beberapa layanan untuk mendapatkan IP yang lebih akurat
 * @return {string} Alamat IP atau 'Unknown' jika gagal
 */
function getIpAddressMultiService() {
  var services = [
    'https://api.ipify.org',
    'https://icanhazip.com',
    'https://ifconfig.me/ip'
  ];
  
  for (var i = 0; i < services.length; i++) {
    try {
      var response = UrlFetchApp.fetch(services[i], {'muteHttpExceptions': true});
      if (response.getResponseCode() === 200) {
        return response.getContentText().trim();
      }
    } catch (e) {
      console.error('Error fetching IP from ' + services[i] + ': ' + e);
    }
  }
  
  return 'Unknown';
}

/**
 * Fungsi untuk debugging
 */
function testScript() {
  var testLocation = "-7.8603934,112.0381211";
  var url = "https://wttr.in/" + testLocation + "?format=j1";
  var response = UrlFetchApp.fetch(url);
  var jsonData = JSON.parse(response.getContentText());
  
  Logger.log(JSON.stringify(jsonData, null, 2));
  
  // Test mendapatkan IP
  Logger.log("IP Address via ipify: " + getIpAddress());
  Logger.log("IP Address via multiple services: " + getIpAddressMultiService());
  
  // Uji setup log
  Logger.log(setupLogSpreadsheet());
  
  // Uji log akses
  logAccess(
    new Date(new Date().getTime() - 1000), 
    new Date(), 
    getIpAddress(), 
    "/test", 
    "GET", 
    "Success", 
    200, 
    "Test akses berhasil"
  );
  
  return "Test berhasil dijalankan";
}
