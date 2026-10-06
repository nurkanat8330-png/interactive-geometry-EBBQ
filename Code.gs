/**
 * =========================================================================
 * ИНТЕРАКТИВТІ ГЕОМЕТРИЯ: 7-10 СЫНЫПТАР
 * GOOGLE APPS SCRIPT БҰЛТТЫҚ БАЗАСЫ (Code.gs)
 * =========================================================================
 * 
 * Бұл скрипт GitHub Pages арқылы сілтеме алған оқушылардың берген жауаптарын,
 * жинаған балын, тест дәлдігі мен деңгейлік есептерін Google Sheets кестесіне
 * автоматты түрде жазып, мұғалім кабинетіне жеткізіп отырады.
 * 
 * ОРНАТУ НҰСҚАУЛЫҒЫ:
 * 1. Жаңа Google Таблица (Google Sheets) ашыңыз.
 * 2. Жоғарғы мәзірден: Кеңейтімдер (Расширения / Extensions) -> Apps Script басыңыз.
 * 3. Ашылған Code.gs файлындағы барлық кодты өшіріп, төмендегі кодты толық қойыңыз.
 * 4. Жоғарғы жақтағы «Орналастыру» (Развернуть / Deploy) -> «Жаңа орналастыру» (Новое развертывание / New deployment) басыңыз.
 * 5. Түрін «Веб-қосымша» (Веб-приложение / Web app) деп таңдаңыз.
 * 6. «Кімге қолжетімді» (У кого есть доступ / Who has access): «Кез келген адам» (Все / Anyone) етіп белгілеңіз.
 * 7. «Развернуть» басып, берілген Web App URL сілтемесін көшіріп алыңыз.
 * 8. Осы сілтемені біздің қосымшадағы «Мұғалім кабинеті» -> «⚙️ Бұлт баптауы» бөліміне қойыңыз!
 */

// Басты кесте атауы
var SHEET_NAME = "Сынып_Ведомосі";
var LOG_SHEET_NAME = "Жауаптар_Тарихы";

/**
 * Оқушылардың деректерін қабылдау (POST сұраныс)
 */
function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(15000); // Бір мезетте бірнеше оқушы тапсырғанда қақтығысты болдырмау

    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var st = payload.data || payload;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateMainSheet(ss);
    var logSheet = getOrCreateLogSheet(ss);

    // Уақыты
    var timeZone = Session.getScriptTimeZone() || "GMT+5";
    var nowFormatted = Utilities.formatDate(new Date(), timeZone, "dd.MM.yyyy HH:mm:ss");

    // Деректерді реттеу
    var studentName = st.name || "Аты-жөні көрсетілмеген";
    var grade = st.grade || "Сынып көрсетілмеген";
    var topicTitle = st.topicTitle || "Геометрия курсы (19 тақырып)";
    var earnedScore = st.earnedScore || st.xp || 0;
    var maxScore = st.maxScore || 1000;
    var accuracy = (st.accuracy !== undefined ? st.accuracy : 0) + "%";
    var gradeMark = String(st.gradeMark || "4");
    var status = st.status || "Жеткілікті";
    var school = st.school || "Мектеп көрсетілмеген";
    var dateString = st.date ? (st.date + (st.submittedAt ? " " + st.submittedAt : "")) : nowFormatted;

    // 1. Негізгі Сынып Ведомосінде оқушының бұрынғы қатарын іздеу (қайталанбауы үшін)
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      var rowName = String(data[i][1]).trim().toLowerCase();
      var rowGrade = String(data[i][2]).trim().toLowerCase();
      if (rowName === studentName.trim().toLowerCase() && (rowGrade === grade.trim().toLowerCase() || !rowGrade)) {
        rowIndex = i + 1; // 1-indexed sheet row
        break;
      }
    }

    if (rowIndex > 0) {
      // Бар оқушының нәтижесін соңғы көрсеткіштермен жаңарту
      sheet.getRange(rowIndex, 3, 1, 9).setValues([[
        grade,
        topicTitle,
        earnedScore,
        maxScore,
        accuracy,
        gradeMark,
        status,
        school,
        nowFormatted
      ]]);
    } else {
      // Жаңа оқушыны ведомоске қосу
      var newNumber = Math.max(1, data.length);
      sheet.appendRow([
        newNumber,
        studentName,
        grade,
        topicTitle,
        earnedScore,
        maxScore,
        accuracy,
        gradeMark,
        status,
        school,
        nowFormatted
      ]);
    }

    // 2. Жауаптар тарихы журналына (Log) әрбір тапсыруды рет-ретімен тіркеп отыру
    logSheet.appendRow([
      nowFormatted,
      studentName,
      grade,
      topicTitle,
      earnedScore,
      maxScore,
      accuracy,
      gradeMark,
      status,
      school
    ]);

    lock.releaseLock();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Оқушы дерегі кестеге сәтті жазылды!",
      student: studentName
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Мұғалім кабинеті үшін оқушылар тізімін қайтару (GET сұраныс)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateMainSheet(ss);
    var data = sheet.getDataRange().getValues();

    var students = [];

    // 1-жол (шапка) өткізіледі
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[1]) continue; // Егер аты бос болса, өткізу

      students.push({
        id: "st-sheet-" + i,
        name: String(row[1]),
        grade: String(row[2]),
        topicTitle: String(row[3]),
        xp: Number(row[4]) || 0,
        earnedScore: Number(row[4]) || 0,
        maxScore: Number(row[5]) || 1000,
        accuracy: parseFloat(String(row[6]).replace("%", "")) || 0,
        gradeMark: String(row[7] || "4"),
        status: String(row[8] || "Жеткілікті"),
        school: String(row[9] || ""),
        date: String(row[10] || "")
      });
    }

    // JSON форматта оқушылар тізімін қайтару
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: students.length,
      students: students
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Негізгі ведомость парағын жасау немесе баптау
 */
function getOrCreateMainSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }

  // Егер бос болса, шапкасын толтырып, стиль береміз
  if (sheet.getLastRow() === 0) {
    var headers = [
      "№",
      "Оқушының аты-жөні",
      "Сыныбы",
      "Тапсырма / Тақырып атауы",
      "Жинаған балы (XP)",
      "Максималды балл",
      "Пайыздық нәтижесі",
      "Бағасы",
      "Меңгеру сапасы",
      "Мектебі",
      "Орындаған уақыты"
    ];

    sheet.appendRow(headers);

    // Шапка стилі: Қанық көк фон, ақ қаріп, ортаға түзелген, қалың
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e293b");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 36);

    // 1-қатарды бекіту (Freeze)
    sheet.setFrozenRows(1);

    // Бағандардың өлшемін ыңғайластыру
    sheet.setColumnWidth(1, 45);  // №
    sheet.setColumnWidth(2, 220); // Аты-жөні
    sheet.setColumnWidth(3, 110); // Сыныбы
    sheet.setColumnWidth(4, 250); // Тақырып
    sheet.setColumnWidth(5, 130); // XP
    sheet.setColumnWidth(6, 130); // Макс балл
    sheet.setColumnWidth(7, 130); // Пайыз
    sheet.setColumnWidth(8, 80);  // Баға
    sheet.setColumnWidth(9, 130); // Сапа
    sheet.setColumnWidth(10, 180);// Мектеп
    sheet.setColumnWidth(11, 160);// Уақыт
  }

  return sheet;
}

/**
 * Толық тарих логы парағын жасау
 */
function getOrCreateLogSheet(ss) {
  var sheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET_NAME, 1);
  }

  if (sheet.getLastRow() === 0) {
    var logHeaders = [
      "Тапсырылған уақыты",
      "Оқушының аты-жөні",
      "Сыныбы",
      "Тапсырма / Тақырып атауы",
      "Жинаған балы (XP)",
      "Максималды балл",
      "Пайыздық нәтижесі",
      "Бағасы",
      "Меңгеру сапасы",
      "Мектебі"
    ];
    sheet.appendRow(logHeaders);

    var headerRange = sheet.getRange(1, 1, 1, logHeaders.length);
    headerRange.setBackground("#334155");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(9);
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  return sheet;
}
