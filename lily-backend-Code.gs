const SHEET_VENDORS = 'Vendors';
const SHEET_ORDERS = 'Orders';
const SHEET_WEBSITES = 'Websites';
const SHEET_STOCK_PRODUCTS = 'StockProducts';
const SHEET_PREORDER_PRODUCTS = 'PreorderProducts';
const SHEET_PRODUCT_TAGS = 'ProductTags';
const SHEET_STALL_SCHEDULES = 'StallSchedules';
const SHEET_CONNECTION_SCHEDULES = 'ConnectionSchedules';
const SHEET_SCHEDULE_SETTINGS = 'ScheduleSettings';

const SHEET_HEADERS = {
  [SHEET_VENDORS]: ['id', 'name', 'contact', 'location', 'currency', 'notes'],
  [SHEET_ORDERS]: ['id', 'date', 'vendorId', 'orderNo', 'trackingNo', 'shipped', 'shippedDate', 'items'],
  [SHEET_WEBSITES]: ['id', 'name', 'contact', 'location', 'currency', 'link', 'notes'],
  [SHEET_STOCK_PRODUCTS]: ['id', 'name', 'costPrice', 'listPrice', 'quantity', 'tagIds', 'description', 'image', 'active', 'variantsJson', 'variants', 'createdAt', 'updatedAt'],
  [SHEET_PREORDER_PRODUCTS]: ['id', 'name', 'costPrice', 'listPrice', 'quota', 'deadline', 'tagIds', 'description', 'image', 'active', 'variantsJson', 'variants', 'createdAt', 'updatedAt'],
  [SHEET_PRODUCT_TAGS]: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
  [SHEET_STALL_SCHEDULES]: ['id', 'period', 'location', 'image', 'stallFee', 'days', 'createdAt', 'updatedAt'],
  [SHEET_CONNECTION_SCHEDULES]: ['id', 'period', 'location', 'image', 'startDate', 'endDate', 'flightFee', 'hotelFee', 'createdAt', 'updatedAt'],
  [SHEET_SCHEDULE_SETTINGS]: ['id', 'type', 'image', 'createdAt', 'updatedAt']
};

const JSON_FIELDS = {
  items: true,
  tagIds: true,
  days: true,
  variants: true
};

function doGet(e) {
  return handleResponse(readData());
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'saveVendor') saveRow(SHEET_VENDORS, data.payload);
    if (data.action === 'deleteVendor') deleteRow(SHEET_VENDORS, data.id);
    if (data.action === 'saveOrder') saveRow(SHEET_ORDERS, data.payload);
    if (data.action === 'deleteOrder') deleteRow(SHEET_ORDERS, data.id);
    if (data.action === 'saveWebsite') saveRow(SHEET_WEBSITES, data.payload);
    if (data.action === 'deleteWebsite') deleteRow(SHEET_WEBSITES, data.id);

    if (data.action === 'saveStockProduct') saveRow(SHEET_STOCK_PRODUCTS, data.payload);
    if (data.action === 'deleteStockProduct') deleteRow(SHEET_STOCK_PRODUCTS, data.id);
    if (data.action === 'savePreorderProduct') saveRow(SHEET_PREORDER_PRODUCTS, data.payload);
    if (data.action === 'deletePreorderProduct') deleteRow(SHEET_PREORDER_PRODUCTS, data.id);
    if (data.action === 'saveProductTag') saveRow(SHEET_PRODUCT_TAGS, data.payload);
    if (data.action === 'deleteProductTag') deleteRow(SHEET_PRODUCT_TAGS, data.id);
    if (data.action === 'saveStallSchedule') saveRow(SHEET_STALL_SCHEDULES, data.payload);
    if (data.action === 'deleteStallSchedule') deleteRow(SHEET_STALL_SCHEDULES, data.id);
    if (data.action === 'saveConnectionSchedule') saveRow(SHEET_CONNECTION_SCHEDULES, data.payload);
    if (data.action === 'deleteConnectionSchedule') deleteRow(SHEET_CONNECTION_SCHEDULES, data.id);
    if (data.action === 'saveScheduleSetting') saveRow(SHEET_SCHEDULE_SETTINGS, data.payload);

    if (data.action === 'getExchangeRates') {
      var rates = scrapeBankRates();
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', data: rates }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return handleResponse({ status: 'success', data: readData() });
  } catch (error) {
    return handleResponse({ status: 'error', message: error.toString() });
  }
}

function readData() {
  return {
    vendors: getSheetData(SHEET_VENDORS),
    orders: getSheetData(SHEET_ORDERS),
    websites: getSheetData(SHEET_WEBSITES),
    stockProducts: getSheetData(SHEET_STOCK_PRODUCTS),
    preorderProducts: getSheetData(SHEET_PREORDER_PRODUCTS),
    productTags: getSheetData(SHEET_PRODUCT_TAGS),
    stallSchedules: getSheetData(SHEET_STALL_SCHEDULES),
    connectionSchedules: getSheetData(SHEET_CONNECTION_SCHEDULES),
    scheduleSettings: getSheetData(SHEET_SCHEDULE_SETTINGS)
  };
}

function getOrCreateSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);

  const headers = SHEET_HEADERS[sheetName] || ['id'];
  const firstRow = sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn() || 1)).getValues()[0];
  const hasHeaders = firstRow.some(value => String(value || '').trim());
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    headers.forEach(header => {
      if (currentHeaders.indexOf(header) === -1) {
        currentHeaders.push(header);
        sheet.getRange(1, currentHeaders.length).setValue(header);
      }
    });
  }

  return sheet;
}

function getSheetData(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = data.slice(1);
  return rows
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        if (!header) return;
        const value = row[index];
        if (JSON_FIELDS[header] && value) {
          try {
            obj[header] = JSON.parse(value);
          } catch (e) {
            obj[header] = header === 'tagIds' || header === 'days' || header === 'items' ? [] : value;
          }
        } else {
          obj[header] = value;
        }
      });
      return obj;
    });
}

function saveRow(sheetName, payload) {
  const sheet = getOrCreateSheet(sheetName);
  let data = sheet.getDataRange().getValues();
  let headers = data[0];
  const now = new Date().toISOString();
  const processedPayload = { ...payload };

  if (!processedPayload.id) processedPayload.id = Date.now();
  if (headers.indexOf('createdAt') > -1 && !processedPayload.createdAt) processedPayload.createdAt = now;
  if (headers.indexOf('updatedAt') > -1) processedPayload.updatedAt = now;

  Object.keys(processedPayload).forEach(key => {
    if (JSON_FIELDS[key] && processedPayload[key] !== undefined) {
      processedPayload[key] = JSON.stringify(processedPayload[key] || []);
    }
  });

  Object.keys(processedPayload).forEach(key => {
    if (headers.indexOf(key) === -1) {
      headers.push(key);
      sheet.getRange(1, headers.length).setValue(key);
    }
  });

  data = sheet.getDataRange().getValues();
  headers = data[0];
  const idIndex = headers.indexOf('id');
  let rowIndex = -1;

  if (data.length > 1 && idIndex > -1) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIndex]) === String(processedPayload.id)) {
        rowIndex = i + 1;
        if (headers.indexOf('createdAt') > -1 && !payload.createdAt) {
          processedPayload.createdAt = data[i][headers.indexOf('createdAt')] || now;
        }
        break;
      }
    }
  }

  const rowData = headers.map(header => processedPayload[header] !== undefined ? processedPayload[header] : '');

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteRow(sheetName, id) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  const idIndex = data[0].indexOf('id');
  if (idIndex === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function handleResponse(response) {
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function scrapeBankRates() {
  var banks = [
    { name: "中國信託", searchName: "中國信託", jpy: "", cny: "" },
    { name: "台灣銀行", searchName: "台灣銀行", jpy: "", cny: "" },
    { name: "第一銀行", searchName: "第一", jpy: "", cny: "" },
    { name: "兆豐銀行", searchName: "兆豐", jpy: "", cny: "" },
    { name: "玉山銀行", searchName: "玉山", jpy: "", cny: "" }
  ];

  try {
    var jpyRes = UrlFetchApp.fetch("https://www.findrate.tw/JPY/", { muteHttpExceptions: true }).getContentText();
    var cnyRes = UrlFetchApp.fetch("https://www.findrate.tw/CNY/", { muteHttpExceptions: true }).getContentText();

    function extractSellRate(html, searchName) {
      var regex = new RegExp(searchName + "[\\s\\S]*?</tr>", "i");
      var rowMatch = html.match(regex);
      if (rowMatch) {
        var row = rowMatch[0];
        var tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        var tds = [];
        var tdMatch;
        while ((tdMatch = tdRegex.exec(row)) !== null) {
          var val = tdMatch[1].replace(/<[^>]+>/g, '').trim();
          tds.push(val);
        }
        var spotSell = parseFloat(tds[4]);
        if (spotSell > 0) return spotSell.toFixed(4);

        var cashSell = parseFloat(tds[2]);
        if (cashSell > 0) return cashSell.toFixed(4);
      }
      return null;
    }

    for (var i = 0; i < banks.length; i++) {
      var jpy = extractSellRate(jpyRes, banks[i].searchName);
      var cny = extractSellRate(cnyRes, banks[i].searchName);
      if (jpy) banks[i].jpy = jpy;
      if (cny) banks[i].cny = cny;
    }
  } catch (e) {}

  return banks;
}
