/**
 * Smart Unit Converter - Content Script
 * Scans the page for currency values, highlights them with dashed border,
 * and shows conversions on hover.
 */

// Array to store found currency values and their DOM paths
const foundCurrencies = [];

// Track whether the converter is enabled
let isEnabled = false;

// Mark the page as having our script loaded
document.body.setAttribute("data-smart-converter-loaded", "true");

// Common currency symbols, including those used globally
const CURRENCY_SYMBOLS = [
  // Western currencies
  "\\$",
  "€",
  "£",
  "¥",
  // Other major currencies
  "₹",
  "₽",
  "₩",
  "฿",
  "₫",
  "₴",
  "₸",
  "₼",
  "₺",
  "₾",
  "₦",
  "R\\$",
  "kr",
  "CHF",
  "Kč",
  "zł",
  // Informal symbols
  "Rs\\.?",
  "руб\\.?",
  "грн\\.?",
  "p\\.",
  "z[łl]\\.?",
  "K[čc]\\.?",
  "лв\\.?",
];

// Common currency codes (ISO 4217 and common non-standard codes)
const CURRENCY_CODES = [
  // Major currencies
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "HKD",
  "NZD",
  "SGD",
  // European currencies
  "CZK",
  "DKK",
  "NOK",
  "SEK",
  "PLN",
  "HUF",
  "RON",
  "BGN",
  "HRK",
  "ISK",
  // Asian currencies
  "KRW",
  "INR",
  "IDR",
  "MYR",
  "PHP",
  "THB",
  "VND",
  // Middle Eastern & African
  "ILS",
  "SAR",
  "AED",
  "ZAR",
  "NGN",
  // Latin American
  "MXN",
  "BRL",
  "ARS",
  "CLP",
  "COP",
  "PEN",
  // Common non-ISO but widely used
  "RMB",
  "NTD",
  "EURO",
  "Euros",
];

// Asian currency characters and special notations
const ASIAN_CURRENCY = [
  "元",
  "円",
  "圓",
  "圆",
  "원",
  "฿",
  "₫",
  "৳",
  "௹",
  "૱",
  "೩",
  "฿",
  "៛",
  "₭",
  "₮",
  "₯",
  "₱",
  "₲",
  "₳",
  "₴",
  "₵",
];

// Basic price pattern: captures digits with various thousand/decimal separators
// Handles formats like: 1,000.00 | 1.000,00 | 1 000,00 | 1,000 | 1000 | 1k | 1K
const PRICE_PATTERN =
  "\\d+(?:[\\s\\.,]?\\d*){0,3}(?:[,.][0-9]{1,4})?(?:\\s*[-,][-–]?)?";

// Regular expression to match common currency formats, now built from components
const currencyRegex = new RegExp(
  [
    // Currency symbol before amount: $100, €50, etc.
    `(?:\\b|^)(${CURRENCY_SYMBOLS.join("|")})\\s*${PRICE_PATTERN}(?!\\d)`,

    // Amount followed by currency symbol: 100$, 50€, etc.
    `(?:\\b|^)${PRICE_PATTERN}(?:\\s*|\\-|\\/|,|\\.|\\*)(${CURRENCY_SYMBOLS.join("|")})(?!\\d)`,

    // Amount followed by currency code: 100 USD, 50 EUR, etc.
    `(?:\\b|^)${PRICE_PATTERN}(?:\\s+(?:${CURRENCY_CODES.join("|")})(?!\\d))`,

    // Currency code before amount: USD 100, EUR 50, etc.
    `(?:\\b|^)(?:${CURRENCY_CODES.join("|")})\\s+${PRICE_PATTERN}(?!\\d)`,

    // Asian currency formats: 1000円, 50元, etc.
    `(?:\\b|^)${PRICE_PATTERN}(?:${ASIAN_CURRENCY.join("|")})(?!\\d)`,

    // Czech notation formats: 35,- or 35,-- or 35,-Kč
    `(?:\\b|^)${PRICE_PATTERN}(?:,-|-,|,--|--,)(?:${CURRENCY_SYMBOLS.join("|")})?(?!\\d)`,
  ].join("|"),
  "gi",
);

// Backup in case the main regex is too slow or causes issues
const simpleCurrencyRegex =
  /(\$|€|£|¥|Kč|kr|\bCHF\b|руб\.|R\$)(?:\s*)\d+(?:[,.]\d+)?|\d+(?:[,.]\d+)?(?:\s*)(\$|€|£|¥|Kč|kr|\bCHF\b|руб\.|R\$)|\b\d+(?:[,.]\d+)?(?:\s*)(?:USD|EUR|GBP|JPY|CZK|PLN|HUF|SEK|NOK|DKK)(?:\b|$)|\b\d+[,.](?:-|--|-,|,-|,-)(?!\d)/gi;

// Current exchange rates relative to USD (as of May 2023)
// These are static rates for demonstration purposes
const EXCHANGE_RATES = {
  USD: 1.0, // US Dollar (base currency)
  EUR: 0.93, // Euro
  GBP: 0.8, // British Pound
  JPY: 139.5, // Japanese Yen
  CHF: 0.9, // Swiss Franc
  CAD: 1.35, // Canadian Dollar
  AUD: 1.5, // Australian Dollar
  CNY: 7.15, // Chinese Yuan
  HKD: 7.83, // Hong Kong Dollar
  NZD: 1.62, // New Zealand Dollar
  SGD: 1.34, // Singapore Dollar
  CZK: 22.0, // Czech Koruna
  DKK: 6.88, // Danish Krone
  NOK: 10.79, // Norwegian Krone
  SEK: 10.33, // Swedish Krona
  PLN: 4.18, // Polish Złoty
  HUF: 340.87, // Hungarian Forint
  RON: 4.6, // Romanian Leu
  BGN: 1.82, // Bulgarian Lev
  HRK: 7.01, // Croatian Kuna
  ISK: 139.13, // Icelandic Króna
  KRW: 1335.47, // South Korean Won
  INR: 82.42, // Indian Rupee
  IDR: 14870.35, // Indonesian Rupiah
  MYR: 4.57, // Malaysian Ringgit
  PHP: 55.61, // Philippine Peso
  THB: 34.71, // Thai Baht
  VND: 23509.0, // Vietnamese Dong
  ILS: 3.67, // Israeli New Shekel
  SAR: 3.75, // Saudi Riyal
  AED: 3.67, // United Arab Emirates Dirham
  ZAR: 18.99, // South African Rand
  NGN: 460.83, // Nigerian Naira
  MXN: 17.6, // Mexican Peso
  BRL: 5.06, // Brazilian Real
  ARS: 231.69, // Argentine Peso
  CLP: 797.55, // Chilean Peso
  COP: 4615.0, // Colombian Peso
  PEN: 3.69, // Peruvian Sol
  RMB: 7.15, // Chinese Yuan (alternative code)
  NTD: 30.92, // New Taiwan Dollar
};

// Currencies to show in the popup (most common world currencies)
const CONVERSION_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "CZK"];

// Debug level: 0 = none, 1 = basic, 2 = verbose
const DEBUG_LEVEL = 2;

/**
 * Simple logging function that respects debug level
 */
const HTML_ESCAPE_MAP_CS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP_CS[ch]);
}

function debugLog(message, level = 1) {
  if (DEBUG_LEVEL >= level) {
    console.log(`[Smart Unit Converter] ${message}`);
  }
}

/**
 * Create and inject CSS styles for our elements
 */
function injectStyles() {
  // Check if we already added styles
  if (document.getElementById("smart-unit-converter-styles")) return;

  const styles = `
    .smart-unit-converter-highlight {
      border: 2px dashed #3498db !important;
      border-radius: 3px !important;
      padding: 0 2px !important;
      cursor: pointer !important;
      position: relative !important;
    }
    
    .smart-unit-converter-highlight:hover {
      border-color: #2980b9 !important;
      background-color: rgba(52, 152, 219, 0.1) !important;
    }
    
    .smart-unit-converter-popup {
      position: fixed !important;
      z-index: 9999999 !important;
      background-color: white !important;
      border: 1px solid #ddd !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
      padding: 8px 12px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
      max-width: 300px !important;
      min-width: 200px !important;
      color: #333 !important;
      transition: opacity 0.2s !important;
      pointer-events: none !important;
      opacity: 0 !important;
    }
    
    .smart-unit-converter-popup.visible {
      opacity: 1 !important;
    }
    
    .smart-unit-converter-popup-title {
      font-weight: bold !important;
      margin-bottom: 6px !important;
      padding-bottom: 4px !important;
      border-bottom: 1px solid #eee !important;
      color: #2c3e50 !important;
    }
    
    .smart-unit-converter-popup-conversions {
      max-height: 200px !important;
      overflow-y: auto !important;
    }
    
    .smart-unit-converter-conversion-item {
      display: flex !important;
      justify-content: space-between !important;
      margin: 3px 0 !important;
    }
    
    .smart-unit-converter-conversion-item-currency {
      font-weight: 600 !important;
      color: #333 !important;
    }
    
    .smart-unit-converter-conversion-item-value {
      color: #27ae60 !important;
    }
    
    .smart-unit-converter-conversion-item-rate {
      font-size: 11px !important;
      color: #7f8c8d !important;
      margin: 0 0 8px 12px !important;
      font-style: italic !important;
    }
    
    .smart-unit-converter-popup-footer {
      font-size: 10px !important;
      color: #7f8c8d !important;
      margin-top: 6px !important;
      text-align: right !important;
      border-top: 1px solid #eee !important;
      padding-top: 4px !important;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = "smart-unit-converter-styles";
  styleElement.setAttribute("data-smart-converter-element", "true");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

/**
 * Extract numeric value from a currency string
 * @param {string} currencyStr - Currency string
 * @returns {number} - The numeric value
 */
function extractNumericValue(currencyStr) {
  if (!currencyStr) return 0;

  // Remove any non-numeric characters except for '.' and ','
  const numericStr = currencyStr
    .replace(/[^\d.,]/g, "")
    // Normalize decimal separators - assumes that the last '.' or ',' is the decimal separator
    .replace(/(\d)[.,](\d{1,2})(?=[.,]|$)/, "$1.$2")
    // Replace any remaining ',' with ''
    .replace(/,/g, "");

  return parseFloat(numericStr) || 0;
}

/**
 * Determine currency type from found value
 * @param {string} value - The found currency value
 * @returns {string} - The currency type identifier
 */
function determineCurrencyType(value) {
  if (!value) return "Neznámý";

  // Common currency symbols and their mapping
  const symbolMap = {
    $: "USD", // Dollar - default is USD but could be others
    "€": "EUR", // Euro
    "£": "GBP", // British Pound
    "¥": "JPY", // Japanese Yen (could also be CNY)
    "₹": "INR", // Indian Rupee
    "₽": "RUB", // Russian Ruble
    "₩": "KRW", // Korean Won
    "฿": "THB", // Thai Baht
    "₫": "VND", // Vietnamese Dong
    "₴": "UAH", // Ukrainian Hryvnia
    "₸": "KZT", // Kazakhstani Tenge
    "₺": "TRY", // Turkish Lira
    R$: "BRL", // Brazilian Real
    kr: "SEK", // Swedish Krona (could also be NOK/DKK)
    CHF: "CHF", // Swiss Franc
    Kč: "CZK", // Czech Koruna
    zł: "PLN", // Polish Złoty
    Ft: "HUF", // Hungarian Forint
    元: "CNY", // Chinese Yuan
    円: "JPY", // Japanese Yen (kanji)
    원: "KRW", // Korean Won (hangeul)
    руб: "RUB", // Russian Ruble (abbreviation)
    грн: "UAH", // Ukrainian Hryvnia (abbreviation)
  };

  // Check exact matches against codes
  for (const code of CURRENCY_CODES) {
    if (value.includes(code)) {
      return code;
    }
  }

  // Check symbols
  for (const [symbol, code] of Object.entries(symbolMap)) {
    if (value.includes(symbol)) {
      return code;
    }
  }

  // Special case for Czech currency format with dashes
  // Check both formats with and without spaces: "35,-", "35 ,-", "35,--", etc.
  if (value.match(/\d+\s*,[-–]/) || value.match(/\d+\s*[,.][-–]{1,2}/)) {
    // If it has Kč in it, it's CZK
    if (value.includes("Kč") || value.includes("CZK")) {
      return "CZK";
    }
    // For the Czech notation without currency symbol, default to CZK
    // This handles cases like "35,-", "35 ,-", "35,--", etc.
    return "CZK";
  }

  // If we get here, we couldn't identify the currency
  return "Neznámý";
}

/**
 * Convert currency amount to different currencies
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @returns {Object} - Object with converted values
 */
function convertCurrency(amount, fromCurrency) {
  if (!amount || !fromCurrency || !EXCHANGE_RATES[fromCurrency]) {
    return {};
  }

  // First convert to USD
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];

  // Then convert to target currencies
  const conversions = {};
  CONVERSION_CURRENCIES.forEach((currency) => {
    if (currency !== fromCurrency && EXCHANGE_RATES[currency]) {
      conversions[currency] = amountInUSD * EXCHANGE_RATES[currency];
    }
  });

  return conversions;
}

/**
 * Format currency value with proper code
 * @param {number} value - Numeric value
 * @param {string} currencyCode - Currency code
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value, currencyCode) {
  if (typeof value !== "number") return "";

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

/**
 * Create a popup for currency conversion
 * @param {string} originalValue - Original currency string
 * @param {string} currencyType - Detected currency type
 * @param {number} amount - Numeric amount
 * @returns {HTMLElement} - Popup element
 */
function createConversionPopup(originalValue, currencyType, amount) {
  // Remove any existing popup to ensure we don't have multiple
  removeExistingPopup();

  const popup = document.createElement("div");
  popup.className = "smart-unit-converter-popup";
  popup.id = "smart-unit-converter-popup";
  popup.setAttribute("data-smart-converter-element", "true");

  // Add title
  const title = document.createElement("div");
  title.className = "smart-unit-converter-popup-title";
  title.textContent = `Převod: ${originalValue}`;
  popup.appendChild(title);

  // Add conversions container
  const conversionsContainer = document.createElement("div");
  conversionsContainer.className = "smart-unit-converter-popup-conversions";

  // Get conversions
  const conversions = convertCurrency(amount, currencyType);

  // Add conversion rows
  for (const [code, value] of Object.entries(conversions)) {
    const row = document.createElement("div");
    row.className = "smart-unit-converter-conversion-item";

    const currencyElem = document.createElement("span");
    currencyElem.className = "smart-unit-converter-conversion-item-currency";
    currencyElem.textContent = code;

    const valueElem = document.createElement("span");
    valueElem.className = "smart-unit-converter-conversion-item-value";
    valueElem.textContent = formatCurrency(value, code);

    // Calculate and display exchange rate
    const rateElem = document.createElement("div");
    rateElem.className = "smart-unit-converter-conversion-item-rate";

    // Calculate exchange rate between source currency and target currency
    const sourceRate = EXCHANGE_RATES[currencyType] || 1;
    const targetRate = EXCHANGE_RATES[code] || 1;
    const exchangeRate = targetRate / sourceRate;

    rateElem.textContent = `1 ${currencyType} = ${exchangeRate.toFixed(4)} ${code}`;

    row.appendChild(currencyElem);
    row.appendChild(valueElem);
    conversionsContainer.appendChild(row);
    conversionsContainer.appendChild(rateElem);
  }

  popup.appendChild(conversionsContainer);

  // Add footer
  const footer = document.createElement("div");
  footer.className = "smart-unit-converter-popup-footer";
  footer.textContent = "Přibližné kurzy k aktuálnímu datu";
  popup.appendChild(footer);

  // Append to a safe location that won't interfere with page content
  // Using document.body directly ensures it's outside of any page flows
  document.body.appendChild(popup);

  return popup;
}

/**
 * Remove existing popup if it exists
 */
function removeExistingPopup() {
  const existingPopup = document.getElementById("smart-unit-converter-popup");
  if (existingPopup) {
    existingPopup.remove();
  }
}

/**
 * Position the popup next to the highlighted element
 * @param {HTMLElement} popup - The popup element
 * @param {HTMLElement} targetElement - Element to position popup next to
 */
function positionPopup(popup, targetElement) {
  if (!popup || !targetElement) return;

  const rect = targetElement.getBoundingClientRect();

  // Position to the right if possible, otherwise to the left
  const spaceRight = window.innerWidth - rect.right;

  if (spaceRight > 220) {
    // Position to the right
    popup.style.left = rect.right + 10 + "px";
    popup.style.top = rect.top - 5 + "px";
  } else {
    // Position to the left
    popup.style.left = rect.left - 220 + "px";
    popup.style.top = rect.top - 5 + "px";
  }
}

/**
 * Gets a unique path to the DOM element
 * @param {Element} element - The DOM element to get the path for
 * @returns {string} The path to the element
 */
function getDomPath(element) {
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += "#" + element.id;
      path.unshift(selector);
      break;
    } else {
      let siblings = element.parentNode ? element.parentNode.childNodes : [];
      let index = 0;
      for (let i = 0; i < siblings.length; i++) {
        let sibling = siblings[i];
        if (sibling === element) {
          selector += ":nth-child(" + (index + 1) + ")";
          break;
        }
        if (
          sibling.nodeType === Node.ELEMENT_NODE &&
          sibling.nodeName.toLowerCase() === selector
        ) {
          index++;
        }
      }
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(" > ");
}

/**
 * Get surrounding text context for the found currency
 * @param {string} text - The full text content
 * @param {number} matchIndex - The starting index of the match
 * @param {number} contextLength - How many characters of context to include
 * @returns {string} - The context string
 */
function getTextContext(text, matchIndex, matchLength, contextLength = 30) {
  const startIndex = Math.max(0, matchIndex - contextLength);
  const endIndex = Math.min(
    text.length,
    matchIndex + matchLength + contextLength,
  );

  let prefix = startIndex > 0 ? "..." : "";
  let suffix = endIndex < text.length ? "..." : "";

  return (
    prefix +
    text.substring(startIndex, matchIndex) +
    "<HIGHLIGHT>" +
    text.substring(matchIndex, matchIndex + matchLength) +
    "</HIGHLIGHT>" +
    text.substring(matchIndex + matchLength, endIndex) +
    suffix
  );
}

/**
 * Log the currencies in a structured format
 */
function logFoundCurrencies() {
  if (foundCurrencies.length === 0) {
    console.log(
      "[Smart Unit Converter] Žádné měny nenalezeny na této stránce.",
    );
    return;
  }

  // Group by currency type
  const currencyGroups = {};
  foundCurrencies.forEach((item) => {
    // Try to determine the currency type
    const currencyType = determineCurrencyType(item.value);

    if (!currencyGroups[currencyType]) {
      currencyGroups[currencyType] = [];
    }
    currencyGroups[currencyType].push(item);
  });

  // Log table header
  console.log(
    `%c[Smart Unit Converter] Nalezeno ${foundCurrencies.length} měnových hodnot na stránce ${window.location.href}`,
    "font-weight: bold; font-size: 14px; color: #2c3e50;",
  );

  // Log groups
  for (const [currency, items] of Object.entries(currencyGroups)) {
    console.group(
      `%cMěna: ${currency} (${items.length} hodnot)`,
      "font-weight: bold; color: #2980b9;",
    );

    // Table format for each group
    console.table(
      items.map((item) => ({
        Hodnota: item.value,
        Kontext: item.context || "N/A",
        "DOM cesta":
          item.domPath.length > 100
            ? item.domPath.substring(0, 100) + "..."
            : item.domPath,
      })),
    );

    console.groupEnd();
  }

  // Log details in expandable group
  console.group("Podrobný výpis všech nalezených měn:");
  foundCurrencies.forEach((currency, index) => {
    console.log(`%c${index + 1}. ${currency.value}`, "font-weight: bold;");
    console.log(`   Kontext: ${currency.context || "N/A"}`);
    console.log(`   DOM cesta: ${currency.domPath}`);
    console.log("\n");
  });
  console.groupEnd();
}

/**
 * Test for currency values in text
 */
function testCurrencyRegex(text) {
  if (!text || text.trim() === "") return [];

  try {
    // Try the comprehensive regex first
    const matches = text.match(currencyRegex);
    if (matches && matches.length > 0) {
      return matches;
    }

    // If no matches or if an error occurs, try the simple regex as fallback
    const simpleMatches = text.match(simpleCurrencyRegex);
    return simpleMatches || [];
  } catch (e) {
    debugLog(`Error in regex: ${e.message}`, 2);
    // Fallback to simple regex in case of errors
    try {
      return text.match(simpleCurrencyRegex) || [];
    } catch (e2) {
      debugLog(`Error in simple regex: ${e2.message}`, 2);
      return [];
    }
  }
}

/**
 * Handle mouse enter event on a highlighted currency
 * @param {Event} event - Mouse event
 */
function handleMouseEnter(event) {
  const target = event.target;
  if (!target || !target.getAttribute("data-currency-value")) return;

  const currencyValue = target.getAttribute("data-currency-value");
  const currencyType = target.getAttribute("data-currency-type");
  const numericValue = parseFloat(
    target.getAttribute("data-numeric-value") || "0",
  );

  // Create new popup
  const popup = createConversionPopup(
    currencyValue,
    currencyType,
    numericValue,
  );

  // Position and show popup
  positionPopup(popup, target);

  // Show popup with slight delay for better UX
  setTimeout(() => {
    popup.classList.add("visible");
  }, 50);
}

/**
 * Handle mouse leave event on a highlighted currency
 * @param {Event} event - Mouse event
 */
function handleMouseLeave(event) {
  const popup = document.getElementById("smart-unit-converter-popup");
  if (popup) {
    popup.classList.remove("visible");

    // Remove popup after fade-out animation completes
    setTimeout(() => {
      removeExistingPopup();
    }, 300);
  }
}

/**
 * Finds and highlights currency values in text nodes
 * @param {Node} node - The node to search in
 */
function findCurrenciesInNode(node) {
  if (!node) return;

  // Skip nodes that have already been processed or are part of our own elements
  if (
    node.nodeType === Node.ELEMENT_NODE &&
    (node.hasAttribute("data-smart-converter-processed") ||
      node.classList?.contains("smart-unit-converter-highlight") ||
      node.hasAttribute("data-smart-converter-element"))
  ) {
    return;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    // Skip empty text nodes
    const text = node.textContent;
    if (!text || text.trim() === "") return;

    // Skip if parent already has our highlight elements (prevents duplicate processing)
    if (
      node.parentElement &&
      node.parentElement.querySelector(".smart-unit-converter-highlight")
    ) {
      return;
    }

    const matches = testCurrencyRegex(text);

    if (matches && matches.length > 0) {
      // Create a wrapper element to replace the text node
      const wrapper = document.createElement("span");
      wrapper.setAttribute("data-smart-converter-processed", "true");
      let lastIndex = 0;
      let newHTML = "";

      // Replace each match with a highlighted span
      const regex = new RegExp(currencyRegex);
      let match;

      debugLog(
        `Found ${matches.length} matches in text: ${text.substring(0, 50)}...`,
        2,
      );

      regex.lastIndex = 0; // Reset the regex
      while ((match = regex.exec(text)) !== null) {
        // Add text before the match (escaped — it's page text, not HTML)
        newHTML += escapeHtml(text.substring(lastIndex, match.index));

        // Extract the currency value
        const currencyValue = match[0];
        const currencyType = determineCurrencyType(currencyValue);
        const numericValue = extractNumericValue(currencyValue);

        // Add the highlighted match with dashed border (escape all values into HTML context)
        const safeCurrencyValue = escapeHtml(currencyValue);
        const safeCurrencyType = escapeHtml(String(currencyType));
        const safeNumericValue = escapeHtml(String(numericValue));
        newHTML += `<span class="smart-unit-converter-highlight" data-currency-value="${safeCurrencyValue}" data-currency-type="${safeCurrencyType}" data-numeric-value="${safeNumericValue}">${safeCurrencyValue}</span>`;

        // Update lastIndex to the end of the match
        lastIndex = regex.lastIndex;

        // Get text context
        const context = getTextContext(text, match.index, currencyValue.length);

        // Store the currency value and its path
        foundCurrencies.push({
          value: currencyValue,
          domPath:
            getDomPath(node.parentElement) +
            " > textNode(" +
            Array.from(node.parentNode.childNodes).indexOf(node) +
            ")",
          context: context,
          currencyType: currencyType,
          numericValue: numericValue,
        });
      }

      // Add any remaining text (escaped — it's page text, not HTML)
      newHTML += escapeHtml(text.substring(lastIndex));

      // Replace the text node with the new HTML
      wrapper.innerHTML = newHTML;
      if (node.parentNode) {
        node.parentNode.replaceChild(wrapper, node);

        // Add event listeners to the newly created highlighted elements
        wrapper
          .querySelectorAll(".smart-unit-converter-highlight")
          .forEach((elem) => {
            elem.addEventListener("mouseenter", handleMouseEnter);
            elem.addEventListener("mouseleave", handleMouseLeave);
          });
      }
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Skip script, style, and other non-content elements
    const nodeName = node.nodeName.toLowerCase();
    if (
      nodeName === "script" ||
      nodeName === "style" ||
      nodeName === "noscript" ||
      nodeName === "iframe" ||
      nodeName === "object" ||
      nodeName === "embed"
    ) {
      return;
    }

    // Mark this node as processed
    node.setAttribute("data-smart-converter-processed", "true");

    // Process child nodes (make a copy of childNodes as it can change during iteration)
    Array.from(node.childNodes).forEach(findCurrenciesInNode);
  }
}

/**
 * Main function that processes the entire page
 */
function processPage() {
  if (!isEnabled) {
    debugLog(
      "Smart Unit Converter je vypnutý - neprovádím skenování stránky",
      1,
    );
    return;
  }

  // Check if the page already has our script's processing attribute
  if (document.body.hasAttribute("data-smart-converter-processing")) {
    debugLog("Page is currently being processed, skipping", 1);
    return;
  }

  // Set a processing flag to prevent multiple simultaneous runs
  document.body.setAttribute("data-smart-converter-processing", "true");

  debugLog("Starting page scan for currencies", 1);
  debugLog(`Current URL: ${window.location.href}`, 2);
  debugLog(`Current page state: ${document.readyState}`, 2);

  // Test a variety of currency formats to make sure our regex works
  const testValues = [
    // Common formats
    "$10.99",
    "€20",
    "100 USD",
    "50EUR",
    "5.99 GBP",
    // Czech formats
    "35 Kč",
    "35Kč",
    "35,-",
    "35,–",
    "35,-Kč",
    "35,- Kč",
    // European formats
    "10,99 €",
    "1.000,00 €",
    "1 000 €",
    "1.000 kr",
    "CHF 99,95",
    // British formats
    "£10.99",
    "£10,99",
    "£1,000.00",
    // Asian formats
    "¥1000",
    "₩10000",
    "1000元",
    "₹499",
    // Latin American formats
    "R$50,00",
    "MX$100",
    "CLP 1.000",
    // Other formats with thousands separators
    "$1,000.00",
    "€1.000,00",
    "1 000 Kč",
  ];

  debugLog("Testing currency detection with various formats:", 2);
  testValues.forEach((value) => {
    const matches = testCurrencyRegex(value);
    const matchResult =
      matches && matches.length > 0
        ? `✓ MATCHED: ${matches.join(", ")}`
        : "❌ NO MATCH";
    debugLog(`  "${value}": ${matchResult}`, 2);
  });

  // Inject CSS styles for our elements
  injectStyles();

  // Clear any previous results
  foundCurrencies.length = 0;

  try {
    // Process the page body
    findCurrenciesInNode(document.body);

    debugLog(`Found ${foundCurrencies.length} currencies on the page`, 1);

    // Log detailed currency information
    logFoundCurrencies();

    // Send the results back to the extension
    chrome.runtime.sendMessage({
      action: "currenciesFound",
      currencies: foundCurrencies,
    });
  } finally {
    // Always remove the processing flag when done
    document.body.removeAttribute("data-smart-converter-processing");
  }
}

/**
 * Setup a MutationObserver to watch for DOM changes
 */
function setupDynamicContentObserver() {
  if (!isEnabled) return;

  debugLog("Setting up MutationObserver for dynamic content", 1);

  // Create an observer instance
  const observer = new MutationObserver((mutations) => {
    let nodesToProcess = [];

    mutations.forEach((mutation) => {
      // Skip our own mutations to prevent infinite loops
      if (
        mutation.target.hasAttribute &&
        (mutation.target.hasAttribute("data-smart-converter-element") ||
          mutation.target.hasAttribute("data-smart-converter-processed") ||
          mutation.target.closest(".smart-unit-converter-popup") ||
          mutation.target.closest(".smart-unit-converter-highlight"))
      ) {
        return;
      }

      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Process only if significant nodes were added
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];

          // Skip processing our own elements
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.classList &&
              (node.classList.contains("smart-unit-converter-popup") ||
                node.classList.contains("smart-unit-converter-highlight") ||
                node.hasAttribute("data-smart-converter-element") ||
                node.hasAttribute("data-smart-converter-processed"))
            ) {
              continue;
            }

            // If it's a major element like div, section, etc.
            const tag = node.tagName.toLowerCase();
            if (
              ["div", "section", "article", "main", "tr", "li"].includes(tag)
            ) {
              nodesToProcess.push(node);
            }
          }
        }
      }
    });

    if (nodesToProcess.length > 0) {
      debugLog(
        `Processing ${nodesToProcess.length} new nodes from DOM mutations`,
        1,
      );

      // Process only the new nodes instead of the entire page
      nodesToProcess.forEach((node) => {
        findCurrenciesInNode(node);
      });
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
}

// Initialize - check if the feature is enabled
chrome.storage.local.get(["smartUnitConverterEnabled"], function (result) {
  isEnabled = result.smartUnitConverterEnabled || false;

  debugLog(`Smart Unit Converter initialized with state: ${isEnabled}`, 1);

  if (isEnabled) {
    if (document.readyState === "loading") {
      debugLog("Document still loading, waiting for DOMContentLoaded", 1);
      // Wait for the page to be fully loaded
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(processPage, 500);
        setupDynamicContentObserver();
      });
    } else {
      debugLog("Document already loaded, processing immediately", 1);
      setTimeout(processPage, 500);
      setupDynamicContentObserver();
    }

    // Also process after window load for any lazy-loaded content
    window.addEventListener("load", function () {
      debugLog("Window load event fired", 1);
      // Allow a little time for any final async content to settle
      setTimeout(processPage, 1000);
    });
  }

  // Let the extension know the content script has been injected
  chrome.runtime.sendMessage({
    action: "smartUnitConverterInjected",
  });
});

// Listen for state changes from the background script
chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === "smartUnitConverterStateChanged") {
    const wasEnabled = isEnabled;
    isEnabled = message.enabled;

    debugLog(`State changed: ${isEnabled}`, 1);

    // If turned on and wasn't enabled before, process the page
    if (isEnabled && !wasEnabled && document.readyState === "complete") {
      processPage();
      setupDynamicContentObserver();
    }
  }
});

debugLog("Content script loaded", 1);
