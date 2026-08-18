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
  [SHEET_STOCK_PRODUCTS]: ['id', 'name', 'costPrice', 'listPrice', 'quantity', 'tagIds', 'description', 'image', 'images', 'active', 'variantsJson', 'variants', 'createdAt', 'updatedAt'],
  [SHEET_PREORDER_PRODUCTS]: ['id', 'name', 'costPrice', 'listPrice', 'quota', 'deadline', 'tagIds', 'description', 'image', 'images', 'active', 'variantsJson', 'variants', 'createdAt', 'updatedAt'],
  [SHEET_PRODUCT_TAGS]: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
  [SHEET_STALL_SCHEDULES]: ['id', 'period', 'location', 'image', 'stallFee', 'days', 'createdAt', 'updatedAt'],
  [SHEET_CONNECTION_SCHEDULES]: ['id', 'period', 'location', 'image', 'startDate', 'endDate', 'flightFee', 'hotelFee', 'createdAt', 'updatedAt'],
  [SHEET_SCHEDULE_SETTINGS]: ['id', 'type', 'image', 'createdAt', 'updatedAt']
};

const JSON_FIELDS = {
  items: true,
  tagIds: true,
  images: true,
  days: true,
  variants: true
};

function normalizeProductImageUrl(image) {
  var raw = String(image || '').trim();
  if (!raw) return '';
  if (/^data:image\//i.test(raw)) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(raw)) return '';
  var clean = raw.replace(/[?#].*$/, '').replace(/\\/g, '/');
  var relative = clean.replace(/^\/?images\//i, '').replace(/^\/+/, '');
  if (!relative || relative.split('/').indexOf('..') !== -1) return '';
  if (!/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(relative)) return '';
  return '/images/' + relative;
}

function normalizeProductImageEntry(entry, index) {
  var source = typeof entry === 'string' ? { url: entry } : (entry || {});
  var url = normalizeProductImageUrl(source.url || source.imageUrl || source.image || '');
  if (!url) return null;
  return {
    url: url,
    publicId: String(source.publicId || source.public_id || source.key || source.objectKey || source.object_key || ''),
    isPrimary: source.isPrimary === true || source.is_primary === true || index === 0,
    sortOrder: Number(source.sortOrder || source.sort_order || index)
  };
}

function normalizePrimaryProductImages(images) {
  var normalized = (images || []).filter(Boolean).map(function(image, index) {
    return {
      url: normalizeProductImageUrl(image.url || ''),
      publicId: String(image.publicId || image.public_id || image.key || ''),
      isPrimary: image.isPrimary === true,
      sortOrder: index
    };
  }).filter(function(image) { return !!image.url; });
  if (!normalized.length) return [];
  var primaryIndex = normalized.findIndex(function(image) { return image.isPrimary; });
  if (primaryIndex < 0) primaryIndex = 0;
  return normalized.map(function(image, index) {
    image.isPrimary = index === primaryIndex;
    image.sortOrder = index;
    return image;
  });
}

function normalizeProductImages(product) {
  product = product || {};
  var rawImages = Array.isArray(product.images) ? product.images : parseJsonArray(product.images);
  var images = rawImages.map(normalizeProductImageEntry).filter(Boolean).sort(function(a, b) {
    return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  });
  var fallback = normalizeProductImageEntry(product.image || product.imageUrl || '', images.length);
  if (fallback && !images.some(function(image) { return image.url === fallback.url; })) images.unshift(fallback);
  return normalizePrimaryProductImages(images);
}

function applyProductImages(product) {
  var images = normalizeProductImages(product);
  product.images = images;
  product.image = (images.find(function(image) { return image.isPrimary; }) || images[0] || {}).url || '';
  return product;
}

function safeSupabaseMirror(label, callback) {
  try {
    callback();
  } catch (error) {
    console.warn('Supabase mirror failed for ' + label + ': ' + error.toString());
  }
}

function doGet(e) {
  return handleResponse(readData());
}

function authorizeExternalRequests() {
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
  return 'UrlFetchApp authorization is ready.';
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'saveVendor') {
      if (!data.payload.id) data.payload.id = Date.now();
      saveRow(SHEET_VENDORS, data.payload);
      safeSupabaseMirror('saveVendor', function() { syncSupabaseVendor(data.payload); });
    }
    if (data.action === 'deleteVendor') {
      deleteRow(SHEET_VENDORS, data.id);
      safeSupabaseMirror('deleteVendor', function() { deleteSupabaseMirrorRow('vendors', data.id); });
    }
    if (data.action === 'saveOrder') {
      if (!data.payload.id) data.payload.id = Date.now();
      saveRow(SHEET_ORDERS, data.payload);
      safeSupabaseMirror('saveOrder', function() { syncSupabaseBackendOrder(data.payload); });
    }
    if (data.action === 'deleteOrder') {
      deleteRow(SHEET_ORDERS, data.id);
      safeSupabaseMirror('deleteOrder', function() { deleteSupabaseMirrorRow('backend_orders', data.id); });
    }
    if (data.action === 'saveWebsite') {
      if (!data.payload.id) data.payload.id = Date.now();
      saveRow(SHEET_WEBSITES, data.payload);
      safeSupabaseMirror('saveWebsite', function() { syncSupabaseWebsite(data.payload); });
    }
    if (data.action === 'deleteWebsite') {
      deleteRow(SHEET_WEBSITES, data.id);
      safeSupabaseMirror('deleteWebsite', function() { deleteSupabaseMirrorRow('websites', data.id); });
    }

    if (data.action === 'saveStockProduct') {
      if (!data.payload.id) data.payload.id = Date.now();
      data.payload = applyProductImages(data.payload);
      saveRow(SHEET_STOCK_PRODUCTS, data.payload);
      safeSupabaseMirror('saveStockProduct', function() { syncSupabaseProduct('stock', data.payload); });
    }
    if (data.action === 'deleteStockProduct') {
      deleteRow(SHEET_STOCK_PRODUCTS, data.id);
      safeSupabaseMirror('deleteStockProduct', function() { deleteSupabaseProduct(data.id); });
    }
    if (data.action === 'savePreorderProduct') {
      if (!data.payload.id) data.payload.id = Date.now();
      data.payload = applyProductImages(data.payload);
      saveRow(SHEET_PREORDER_PRODUCTS, data.payload);
      safeSupabaseMirror('savePreorderProduct', function() { syncSupabaseProduct('preorder', data.payload); });
    }
    if (data.action === 'deletePreorderProduct') {
      deleteRow(SHEET_PREORDER_PRODUCTS, data.id);
      safeSupabaseMirror('deletePreorderProduct', function() { deleteSupabaseProduct(data.id); });
    }
    if (data.action === 'saveProductTag') {
      if (!data.payload.id) data.payload.id = Date.now();
      saveRow(SHEET_PRODUCT_TAGS, data.payload);
      safeSupabaseMirror('saveProductTag', function() { syncSupabaseCategory(data.payload); });
    }
    if (data.action === 'deleteProductTag') {
      deleteRow(SHEET_PRODUCT_TAGS, data.id);
      safeSupabaseMirror('deleteProductTag', function() { deleteSupabaseCategory(data.id); });
    }
    if (data.action === 'saveStallSchedule') {
      if (!data.payload.id) data.payload.id = Date.now();
      saveRow(SHEET_STALL_SCHEDULES, data.payload);
      safeSupabaseMirror('saveStallSchedule', function() { syncSupabaseStallSchedule(data.payload); });
    }
    if (data.action === 'deleteStallSchedule') {
      deleteRow(SHEET_STALL_SCHEDULES, data.id);
      safeSupabaseMirror('deleteStallSchedule', function() { deleteSupabaseMirrorRow('stall_schedules', data.id); });
    }
    if (data.action === 'saveConnectionSchedule') {
      if (!data.payload.id) data.payload.id = Date.now();
      saveRow(SHEET_CONNECTION_SCHEDULES, data.payload);
      safeSupabaseMirror('saveConnectionSchedule', function() { syncSupabaseConnectionSchedule(data.payload); });
    }
    if (data.action === 'deleteConnectionSchedule') {
      deleteRow(SHEET_CONNECTION_SCHEDULES, data.id);
      safeSupabaseMirror('deleteConnectionSchedule', function() { deleteSupabaseMirrorRow('connection_schedules', data.id); });
    }
    if (data.action === 'saveScheduleSetting') {
      if (!data.payload.id) data.payload.id = data.payload.type || Date.now();
      if (String(data.payload.type || '') === 'product-default') {
        data.payload.image = normalizeProductImageUrl(data.payload.image);
      }
      saveRow(SHEET_SCHEDULE_SETTINGS, data.payload);
      safeSupabaseMirror('saveScheduleSetting', function() { syncSupabaseScheduleSetting(data.payload); });
    }

    if (data.action === 'getExchangeRates') {
      var rates = scrapeBankRates();
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', data: rates }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return handleResponse({ status: 'success' });
  } catch (error) {
    return handleResponse({ status: 'error', message: error.toString() });
  }
}

function readData() {
  try {
    if (isSupabaseConfigured()) return readSupabaseData();
  } catch (error) {
    console.warn('Supabase read failed, fallback to Google Sheets: ' + error.toString());
  }
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
            obj[header] = header === 'tagIds' || header === 'days' || header === 'items' || header === 'images' ? [] : value;
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

function getSupabaseConfig(required) {
  var props = PropertiesService.getScriptProperties();
  var url = (props.getProperty('SUPABASE_URL') || '').replace(/\/+$/, '');
  var key = props.getProperty('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!url || !key) {
    if (required === false) return null;
    throw new Error('Supabase Script Properties are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url: url, key: key };
}

function isSupabaseConfigured() {
  return !!getSupabaseConfig(false);
}

function supabaseRequest(path, method, payload, prefer) {
  var config = getSupabaseConfig();
  var options = {
    method: method || 'get',
    muteHttpExceptions: true,
    headers: {
      apikey: config.key,
      Authorization: 'Bearer ' + config.key,
      'Content-Type': 'application/json',
      Prefer: prefer || 'return=representation'
    }
  };
  if (payload !== undefined && payload !== null) options.payload = JSON.stringify(payload);

  var response = UrlFetchApp.fetch(config.url + '/rest/v1/' + path, options);
  var code = response.getResponseCode();
  var text = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('Supabase request failed (' + code + '): ' + text);
  }
  return text ? JSON.parse(text) : null;
}

function readSupabaseData() {
  return {
    vendors: readSupabaseVendors(),
    orders: readSupabaseBackendOrders(),
    websites: readSupabaseWebsites(),
    stockProducts: readSupabaseProducts('stock'),
    preorderProducts: readSupabaseProducts('preorder'),
    productTags: readSupabaseCategories(),
    stallSchedules: readSupabaseStallSchedules(),
    connectionSchedules: readSupabaseConnectionSchedules(),
    scheduleSettings: readSupabaseScheduleSettings()
  };
}

function readSupabaseVendors() {
  return (supabaseRequest('vendors?select=*&order=created_at.asc', 'get') || []).map(function(row) {
    return {
      id: row.legacy_id || row.id,
      name: row.name || '',
      contact: row.contact || '',
      location: row.location || '',
      currency: row.currency || '',
      notes: row.notes || ''
    };
  });
}

function readSupabaseWebsites() {
  return (supabaseRequest('websites?select=*&order=created_at.asc', 'get') || []).map(function(row) {
    return {
      id: row.legacy_id || row.id,
      name: row.name || '',
      contact: row.contact || '',
      location: row.location || '',
      currency: row.currency || '',
      link: row.link || '',
      notes: row.notes || ''
    };
  });
}

function readSupabaseBackendOrders() {
  return (supabaseRequest('backend_orders?select=*&order=created_at.desc', 'get') || []).map(function(row) {
    return {
      id: row.legacy_id || row.id,
      date: row.date || '',
      vendorId: row.vendor_id || '',
      orderNo: row.order_no || '',
      trackingNo: row.tracking_no || '',
      shipped: row.shipped || '',
      shippedDate: row.shipped_date || '',
      items: Array.isArray(row.items) ? row.items : []
    };
  });
}

function readSupabaseCategories() {
  return (supabaseRequest('categories?select=*&order=created_at.asc', 'get') || []).map(function(row) {
    return {
      id: row.legacy_id || row.id,
      name: row.name || '',
      color: row.color || '#ec4899',
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  });
}

function readSupabaseProducts(productType) {
  var select = [
    'id',
    'legacy_id',
    'product_type',
    'name',
    'description',
    'image_url',
    'cost_price',
    'base_price',
    'stock_quantity',
    'preorder_quota',
    'deadline',
    'status',
    'created_at',
    'updated_at',
    'product_variants(id,legacy_id,sku,spec,price,stock_quantity,product_url,status,sort_order)',
    'product_images(id,public_id,secure_url,alt_text,sort_order,is_primary)',
    'product_categories(categories(id,legacy_id,name,color))'
  ].join(',');
  var rows = supabaseRequest('products?select=' + encodeURIComponent(select) + '&product_type=eq.' + productType + '&order=created_at.desc', 'get') || [];
  return rows.map(function(row) {
    var variants = (row.product_variants || []).map(function(variant) {
      return {
        id: variant.legacy_id || variant.id,
        spec: variant.spec || '預設款',
        price: Number(variant.price || 0),
        quantity: Number(variant.stock_quantity || 0),
        link: variant.product_url || ''
      };
    });
    var tagIds = (row.product_categories || [])
      .map(function(link) { return link.categories; })
      .filter(Boolean)
      .map(function(category) { return category.legacy_id || category.id; });
    var quantity = productType === 'stock' ? Number(row.stock_quantity || 0) : Number(row.preorder_quota || 0);
    var images = (row.product_images || []).map(function(image, index) {
      return {
        url: image.secure_url || '',
        publicId: image.public_id || '',
        isPrimary: image.is_primary === true,
        sortOrder: Number(image.sort_order || index)
      };
    }).sort(function(a, b) {
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
    return applyProductImages({
      id: row.legacy_id || row.id,
      name: row.name || '',
      costPrice: Number(row.cost_price || 0),
      listPrice: Number(row.base_price || 0),
      quantity: productType === 'stock' ? quantity : undefined,
      quota: productType === 'preorder' ? quantity : undefined,
      deadline: row.deadline || '',
      tagIds: tagIds,
      description: row.description || '',
      image: row.image_url || '',
      images: images,
      active: row.status === 'active',
      variantsJson: JSON.stringify(variants),
      variants: variants,
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    });
  });
}

function readSupabaseStallSchedules() {
  return (supabaseRequest('stall_schedules?select=*&order=created_at.desc', 'get') || []).map(function(row) {
    return {
      id: row.legacy_id || row.id,
      period: row.period || '',
      location: row.location || '',
      image: row.image || '',
      stallFee: Number(row.stall_fee || 0),
      days: Array.isArray(row.days) ? row.days : [],
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  });
}

function readSupabaseConnectionSchedules() {
  return (supabaseRequest('connection_schedules?select=*&order=created_at.desc', 'get') || []).map(function(row) {
    return {
      id: row.legacy_id || row.id,
      period: row.period || '',
      location: row.location || '',
      image: row.image || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      flightFee: Number(row.flight_fee || 0),
      hotelFee: Number(row.hotel_fee || 0),
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  });
}

function readSupabaseScheduleSettings() {
  return (supabaseRequest('schedule_settings?select=*&order=created_at.asc', 'get') || []).map(function(row) {
    return {
      id: row.legacy_id || row.type || row.id,
      type: row.type || '',
      image: row.image || '',
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  });
}

function slugify(value) {
  var slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return slug || ('category-' + Date.now());
}

function supabaseStatus(active, quantity) {
  if (active === false || active === 'false' || active === 'FALSE' || active === '0' || active === '下架') return 'draft';
  if (Number(quantity || 0) <= 0) return 'sold_out';
  return 'active';
}

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    var parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function getProductVariantsForSupabase(product, productType) {
  var qty = productType === 'stock' ? Number(product.quantity || 0) : Number(product.quota || 0);
  var raw = Array.isArray(product.variants) ? product.variants : parseJsonArray(product.variantsJson);
  if (!raw.length) {
    raw = [{
      id: String(product.id || product.name || Date.now()) + '-1',
      spec: '預設款',
      price: Number(product.listPrice || 0),
      quantity: qty,
      link: ''
    }];
  }
  return raw.map(function(variant, index) {
    var stockQuantity = Number(variant.quantity || variant.qty || 0);
    return {
      legacy_id: String(variant.id || (product.id + '-' + (index + 1))),
      sku: String(variant.sku || ''),
      spec: String(variant.spec || variant.name || '預設款').trim() || '預設款',
      price: Number(variant.price || product.listPrice || 0),
      stock_quantity: stockQuantity,
      product_url: String(variant.link || variant.product_url || ''),
      status: supabaseStatus(product.active, stockQuantity),
      sort_order: index
    };
  });
}

function getSupabaseProductByLegacyId(legacyId) {
  var rows = supabaseRequest('products?select=id&legacy_id=eq.' + encodeURIComponent(String(legacyId)) + '&limit=1', 'get');
  return rows && rows.length ? rows[0] : null;
}

function syncSupabaseCategory(tag) {
  if (!tag || !tag.name) return null;
  var slug = slugify(tag.name);
  var legacyId = String(tag.id);
  var payload = {
    legacy_id: legacyId,
    name: String(tag.name),
    slug: slug,
    color: tag.color || ''
  };

  var existing = supabaseRequest(
    'categories?select=id,legacy_id&or=(' +
      'legacy_id.eq.' + encodeURIComponent(legacyId) + ',' +
      'slug.eq.' + encodeURIComponent(slug) +
    ')&limit=1',
    'get'
  );
  if (existing && existing.length && existing[0].id) {
    var updated = supabaseRequest(
      'categories?id=eq.' + encodeURIComponent(existing[0].id),
      'patch',
      payload,
      'return=representation'
    );
    return updated && updated.length ? updated[0] : existing[0];
  }

  var rows = supabaseRequest('categories?on_conflict=legacy_id', 'post', payload, 'resolution=merge-duplicates,return=representation');
  return rows && rows.length ? rows[0] : null;
}

function getOrCreateSupabaseCategoryByTagId(tagId) {
  var rows = supabaseRequest('categories?select=id&legacy_id=eq.' + encodeURIComponent(String(tagId)) + '&limit=1', 'get');
  if (rows && rows.length) return rows[0];

  var tagRows = getSheetData(SHEET_PRODUCT_TAGS);
  var tag = tagRows.find(function(item) { return String(item.id) === String(tagId); });
  if (!tag) return null;
  return syncSupabaseCategory(tag);
}

function syncSupabaseProductCategories(productId, tagIds) {
  supabaseRequest('product_categories?product_id=eq.' + encodeURIComponent(productId), 'delete', null, 'return=minimal');
  var links = [];
  (tagIds || []).forEach(function(tagId) {
    var category = getOrCreateSupabaseCategoryByTagId(tagId);
    if (category && category.id) links.push({ product_id: productId, category_id: category.id });
  });
  if (links.length) supabaseRequest('product_categories', 'post', links, 'return=minimal');
}

function syncSupabaseProductVariants(productId, product, productType) {
  supabaseRequest('product_variants?product_id=eq.' + encodeURIComponent(productId), 'delete', null, 'return=minimal');
  var variants = getProductVariantsForSupabase(product, productType).map(function(variant) {
    variant.product_id = productId;
    return variant;
  });
  if (variants.length) supabaseRequest('product_variants', 'post', variants, 'return=minimal');
}

function syncSupabaseProductImages(productId, product) {
  supabaseRequest('product_images?product_id=eq.' + encodeURIComponent(productId), 'delete', null, 'return=minimal');
  var images = normalizeProductImages(product).filter(function(image) {
    return !!image.publicId;
  }).map(function(image, index) {
    return {
      product_id: productId,
      public_id: image.publicId,
      secure_url: image.url,
      alt_text: product.name || '',
      sort_order: index,
      is_primary: image.isPrimary === true
    };
  });
  if (images.length) supabaseRequest('product_images', 'post', images, 'return=minimal');
}

function syncSupabaseProduct(productType, product) {
  if (!product || !product.name) return;
  var qty = productType === 'stock' ? Number(product.quantity || 0) : Number(product.quota || 0);
  product = applyProductImages(product);
  var productPayload = {
    legacy_id: String(product.id),
    product_type: productType,
    name: String(product.name),
    description: product.description || '',
    image_url: product.image || '',
    cost_price: Number(product.costPrice || 0),
    base_price: Number(product.listPrice || 0),
    stock_quantity: productType === 'stock' ? qty : 0,
    preorder_quota: productType === 'preorder' ? qty : null,
    deadline: productType === 'preorder' && product.deadline ? product.deadline : null,
    status: supabaseStatus(product.active, qty),
    source: 'apps_script_backend'
  };
  var rows = supabaseRequest('products?on_conflict=legacy_id', 'post', productPayload, 'resolution=merge-duplicates,return=representation');
  var saved = rows && rows.length ? rows[0] : getSupabaseProductByLegacyId(product.id);
  if (!saved || !saved.id) throw new Error('Supabase product upsert did not return an id.');
  var tagIds = Array.isArray(product.tagIds) ? product.tagIds : parseJsonArray(product.tagIds);
  syncSupabaseProductCategories(saved.id, tagIds);
  syncSupabaseProductVariants(saved.id, product, productType);
  syncSupabaseProductImages(saved.id, product);
}

function deleteSupabaseProduct(id) {
  if (!id) return;
  supabaseRequest('products?legacy_id=eq.' + encodeURIComponent(String(id)), 'delete', null, 'return=minimal');
}

function deleteSupabaseCategory(id) {
  if (!id) return;
  supabaseRequest('categories?legacy_id=eq.' + encodeURIComponent(String(id)), 'delete', null, 'return=minimal');
}

function upsertSupabaseMirrorRow(tableName, payload) {
  var rows = supabaseRequest(tableName + '?on_conflict=legacy_id', 'post', payload, 'resolution=merge-duplicates,return=representation');
  return rows && rows.length ? rows[0] : null;
}

function deleteSupabaseMirrorRow(tableName, id) {
  if (!id) return;
  supabaseRequest(tableName + '?legacy_id=eq.' + encodeURIComponent(String(id)), 'delete', null, 'return=minimal');
}

function syncSupabaseVendor(vendor) {
  if (!vendor) return;
  upsertSupabaseMirrorRow('vendors', {
    legacy_id: String(vendor.id),
    name: vendor.name || '',
    contact: vendor.contact || '',
    location: vendor.location || '',
    currency: vendor.currency || '',
    notes: vendor.notes || ''
  });
}

function syncSupabaseWebsite(website) {
  if (!website) return;
  upsertSupabaseMirrorRow('websites', {
    legacy_id: String(website.id),
    name: website.name || '',
    contact: website.contact || '',
    location: website.location || '',
    currency: website.currency || '',
    link: website.link || '',
    notes: website.notes || ''
  });
}

function syncSupabaseBackendOrder(order) {
  if (!order) return;
  upsertSupabaseMirrorRow('backend_orders', {
    legacy_id: String(order.id),
    date: order.date || '',
    vendor_id: order.vendorId !== undefined && order.vendorId !== null ? String(order.vendorId) : '',
    order_no: order.orderNo || '',
    tracking_no: order.trackingNo || '',
    shipped: order.shipped || '',
    shipped_date: order.shippedDate || '',
    items: Array.isArray(order.items) ? order.items : parseJsonArray(order.items)
  });
}

function syncSupabaseStallSchedule(schedule) {
  if (!schedule) return;
  upsertSupabaseMirrorRow('stall_schedules', {
    legacy_id: String(schedule.id),
    period: schedule.period || '',
    location: schedule.location || '',
    image: schedule.image || '',
    stall_fee: Number(schedule.stallFee || 0),
    days: Array.isArray(schedule.days) ? schedule.days : parseJsonArray(schedule.days)
  });
}

function syncSupabaseConnectionSchedule(schedule) {
  if (!schedule) return;
  upsertSupabaseMirrorRow('connection_schedules', {
    legacy_id: String(schedule.id),
    period: schedule.period || '',
    location: schedule.location || '',
    image: schedule.image || '',
    start_date: schedule.startDate || null,
    end_date: schedule.endDate || null,
    flight_fee: Number(schedule.flightFee || 0),
    hotel_fee: Number(schedule.hotelFee || 0)
  });
}

function syncSupabaseScheduleSetting(setting) {
  if (!setting) return;
  var type = setting.type || setting.id || 'default';
  var payload = {
    legacy_id: String(setting.id || type),
    type: String(type),
    image: setting.image || ''
  };
  var rows = supabaseRequest('schedule_settings?type=eq.' + encodeURIComponent(String(type)), 'patch', payload, 'return=representation');
  if (!rows || !rows.length) {
    upsertSupabaseMirrorRow('schedule_settings', payload);
  }
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
