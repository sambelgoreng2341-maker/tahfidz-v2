// =========================================================================
// CONFIGURATION (PENTING!)
// =========================================================================
// Masukkan ID Spreadsheet Anda di bawah ini (di antara tanda kutip).
// ID bisa diambil dari URL spreadsheet Anda:
// https://docs.google.com/spreadsheets/d/[INI_ID_SPREADSHEET_ANDA]/edit
var SPREADSHEET_ID = ""; 
// =========================================================================

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      return ss;
    }
  } catch (e) {
    // Gagal mengambil active spreadsheet
  }
  
  throw new Error(
    "Spreadsheet tidak terdeteksi! Masukkan ID Spreadsheet Anda secara manual di variabel SPREADSHEET_ID."
  );
}

function initSheets() {
  var ss = getSpreadsheet();
  
  // 1. Setup Sheet Musyrif (Daftar Master Musyrif)
  var sheetMusyrif = ss.getSheetByName("Data_Musyrif");
  if (!sheetMusyrif) {
    sheetMusyrif = ss.insertSheet("Data_Musyrif");
    sheetMusyrif.appendRow(["No", "ID Musyrif", "Nama Musyrif", "Kelompok Halaqah", "Target Bulanan"]);
    
    var defaultMusyrif = [
      [1, "MSR-001", "Ustadz Ahmad Fauzi, Lc.", "Halaqah Ali bin Abi Thalib", 30],
      [2, "MSR-002", "Ustadz Muhammad Ridho", "Halaqah Utsman bin Affan", 30],
      [3, "MSR-003", "Ustadz Suryana Saputra", "Halaqah Umar bin Khattab", 30],
      [4, "MSR-004", "Ustadz Faisal Amri, S.Pd.", "Halaqah Abu Bakar Ash Shiddiq", 30],
      [5, "MSR-005", "Ustadz Zainal Abidin", "Halaqah Zaid bin Tsabit", 30]
    ];
    for (var i = 0; i < defaultMusyrif.length; i++) {
      sheetMusyrif.appendRow(defaultMusyrif[i]);
    }
    sheetMusyrif.getRange("A1:E1").setBackground("#064E3B").setFontColor("#FFFFFF").setFontWeight("bold");
    sheetMusyrif.setFrozenRows(1);
  }

  // 2. Setup Sheet AbsensiLog (Penyimpanan log absensi harian)
  var sheetLog = ss.getSheetByName("Absensi_Log");
  if (!sheetLog) {
    sheetLog = ss.insertSheet("Absensi_Log");
    sheetLog.appendRow(["Tanggal", "Waktu", "ID Musyrif", "Nama Musyrif", "Status", "Catatan", "Timestamp"]);
    sheetLog.getRange("A1:G1").setBackground("#0F766E").setFontColor("#FFFFFF").setFontWeight("bold");
    sheetLog.setFrozenRows(1);
  } else {
    // Migrasi otomatis jika kolom waktu belum ada di database lama
    var firstRowHeaders = sheetLog.getRange(1, 1, 1, 7).getValues()[0];
    if (firstRowHeaders[1] !== "Waktu") {
      sheetLog.insertColumnBefore(2);
      sheetLog.getRange(1, 2).setValue("Waktu");
      sheetLog.getRange("A1:G1").setBackground("#0F766E").setFontColor("#FFFFFF").setFontWeight("bold");
    }
  }
}

function getAppData() {
  try {
    initSheets(); 
    var ss = getSpreadsheet();
    
    // Ambil Data Master Musyrif
    var sheetMusyrif = ss.getSheetByName("Data_Musyrif");
    var musyrifData = sheetMusyrif.getDataRange().getValues();
    var musyrifList = [];
    
    for (var i = 1; i < musyrifData.length; i++) {
      if (musyrifData[i][1]) {
        musyrifList.push({
          no: musyrifData[i][0],
          id: musyrifData[i][1],
          nama: musyrifData[i][2],
          halaqah: musyrifData[i][3],
          target: musyrifData[i][4]
        });
      }
    }
    
    // Ambil Data Log Absensi 3 Sesi
    var sheetLog = ss.getSheetByName("Absensi_Log");
    var logData = sheetLog.getDataRange().getValues();
    var logsList = [];
    
    for (var j = 1; j < logData.length; j++) {
      if (logData[j][0]) {
        var dateVal = logData[j][0];
        var formattedDate = "";
        
        if (dateVal instanceof Date) {
          formattedDate = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          formattedDate = dateVal.toString();
        }
        
        var tsVal = logData[j][6];
        var formattedTS = "";
        if (tsVal instanceof Date) {
          formattedTS = Utilities.formatDate(tsVal, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        } else {
          formattedTS = tsVal.toString();
        }

        logsList.push({
          tanggal: formattedDate,
          waktu: logData[j][1] ? logData[j][1].toString() : "Subuh",
          id: logData[j][2],
          nama: logData[j][3],
          status: logData[j][4],
          catatan: logData[j][5],
          timestamp: formattedTS
        });
      }
    }
    
    return {
      success: true,
      musyrif: musyrifList,
      logs: logsList
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal memproses data Google Sheets: " + error.toString()
    };
  }
}

function submitAttendance(dateStr, waktuStr, records) {
  try {
    initSheets();
    var ss = getSpreadsheet();
    var sheetLog = ss.getSheetByName("Absensi_Log");
    
    var parts = dateStr.split('-');
    var targetY = parseInt(parts[0], 10);
    var targetM = parseInt(parts[1], 10) - 1;
    var targetD = parseInt(parts[2], 10);
    
    var range = sheetLog.getDataRange();
    var values = range.getValues();
    
    // Overwrite data jika menginput tanggal DAN waktu yang sama agar tidak menumpuk duplikat harian per-sesi
    for (var i = values.length - 1; i >= 1; i--) {
      if (values[i][0]) {
        var rowWaktu = values[i][1] ? values[i][1].toString() : "";
        if (rowWaktu === waktuStr) {
          var rowDateVal = values[i][0];
          var isMatch = false;
          if (rowDateVal instanceof Date) {
            if (rowDateVal.getFullYear() === targetY && rowDateVal.getMonth() === targetM && rowDateVal.getDate() === targetD) {
              isMatch = true;
            }
          } else {
             var dStr = rowDateVal.toString();
             if (dStr.indexOf(dateStr) !== -1 || dStr === dateStr) {
               isMatch = true;
             }
          }
          if (isMatch) {
            sheetLog.deleteRow(i + 1);
          }
        }
      }
    }
    
    var now = new Date();
    var newRows = [];
    for (var k = 0; k < records.length; k++) {
      newRows.push([
        dateStr,
        waktuStr,
        records[k].id,
        records[k].nama,
        records[k].status,
        records[k].catatan || "",
        now
      ]);
    }
    
    if (newRows.length > 0) {
      var startRow = sheetLog.getLastRow() + 1;
      sheetLog.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    }
    
    return {
      success: true,
      message: "Absensi " + waktuStr + " berhasil disimpan ke Cloud untuk tanggal " + dateStr
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal menyimpan absensi: " + error.toString()
    };
  }
}

function submitHoliday(dateStr, waktuStr, targetHoliday, musyrifList) {
  try {
    initSheets();
    var ss = getSpreadsheet();
    var sheetLog = ss.getSheetByName("Absensi_Log");

    var parts = dateStr.split('-');
    var targetY = parseInt(parts[0], 10);
    var targetM = parseInt(parts[1], 10) - 1;
    var targetD = parseInt(parts[2], 10);

    var range = sheetLog.getDataRange();
    var values = range.getValues();

    // Hapus data yang ada untuk sesi dan tanggal tersebut
    for (var i = values.length - 1; i >= 1; i--) {
      if (values[i][0]) {
        var rowWaktu = values[i][1] ? values[i][1].toString() : "";
        if (rowWaktu === waktuStr) {
          var rowDateVal = values[i][0];
          var isMatch = false;
          if (rowDateVal instanceof Date) {
            if (rowDateVal.getFullYear() === targetY && rowDateVal.getMonth() === targetM && rowDateVal.getDate() === targetD) {
              isMatch = true;
            }
          } else {
             var dStr = rowDateVal.toString();
             if (dStr.indexOf(dateStr) !== -1 || dStr === dateStr) {
               isMatch = true;
             }
          }
          if (isMatch) {
            sheetLog.deleteRow(i + 1);
          }
        }
      }
    }

    if (targetHoliday) {
      var now = new Date();
      var newRows = [];
      for (var k = 0; k < musyrifList.length; k++) {
        newRows.push([
          dateStr,
          waktuStr,
          musyrifList[k].id,
          musyrifList[k].nama,
          "L",
          "Libur Halaqoh",
          now
        ]);
      }
      if (newRows.length > 0) {
        var startRow = sheetLog.getLastRow() + 1;
        sheetLog.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
      }
    }

    return { 
      success: true, 
      message: "Status libur berhasil " + (targetHoliday ? "diaktifkan" : "dibatalkan") 
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// --- REST API ENTRY POINTS ---

function setCorsHeaders(res) {
  return res.setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var data = getAppData();
  return setCorsHeaders(ContentService.createTextOutput(JSON.stringify(data)));
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var result;

    if (action === 'submitAttendance') {
      result = submitAttendance(payload.dateStr, payload.waktuStr, payload.records);
    } else if (action === 'submitHoliday') {
      result = submitHoliday(payload.dateStr, payload.waktuStr, payload.targetHoliday, payload.musyrifList);
    } else {
      result = { success: false, message: "Unknown action" };
    }

    return setCorsHeaders(ContentService.createTextOutput(JSON.stringify(result)));
  } catch (error) {
    return setCorsHeaders(ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() })));
  }
}

// Menangani permintaan OPTIONS preflight (walaupun Web App kadang membatasinya)
function doOptions(e) {
  var output = ContentService.createTextOutput("");
  return output.setMimeType(ContentService.MimeType.TEXT);
}
