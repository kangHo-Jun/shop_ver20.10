!function(Vue) {
 "use strict";
 Vue = Vue && Object.prototype.hasOwnProperty.call(Vue, "default") ? Vue.default : Vue;
 var s = 1e3, m = 6e4, h = 60 * m, d = 24 * h, ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if ("string" === type && val.length > 0) return function(str) {
   if ((str = String(str)).length > 100) return;
   var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
   if (!match) return;
   var n = parseFloat(match[1]);
   switch ((match[2] || "ms").toLowerCase()) {
   case "years":
   case "year":
   case "yrs":
   case "yr":
   case "y":
    return 315576e5 * n;

   case "weeks":
   case "week":
   case "w":
    return 6048e5 * n;

   case "days":
   case "day":
   case "d":
    return n * d;

   case "hours":
   case "hour":
   case "hrs":
   case "hr":
   case "h":
    return n * h;

   case "minutes":
   case "minute":
   case "mins":
   case "min":
   case "m":
    return n * m;

   case "seconds":
   case "second":
   case "secs":
   case "sec":
   case "s":
    return n * s;

   case "milliseconds":
   case "millisecond":
   case "msecs":
   case "msec":
   case "ms":
    return n;

   default:
    return;
   }
  }(val);
  if ("number" === type && isFinite(val)) return options.long ? function(ms) {
   var msAbs = Math.abs(ms);
   if (msAbs >= d) return plural(ms, msAbs, d, "day");
   if (msAbs >= h) return plural(ms, msAbs, h, "hour");
   if (msAbs >= m) return plural(ms, msAbs, m, "minute");
   if (msAbs >= s) return plural(ms, msAbs, s, "second");
   return ms + " ms";
  }(val) : function(ms) {
   var msAbs = Math.abs(ms);
   if (msAbs >= d) return Math.round(ms / d) + "d";
   if (msAbs >= h) return Math.round(ms / h) + "h";
   if (msAbs >= m) return Math.round(ms / m) + "m";
   if (msAbs >= s) return Math.round(ms / s) + "s";
   return ms + "ms";
  }(val);
  throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
 };
 function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= 1.5 * n;
  return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
 }
 var common = function(env) {
  function createDebug(namespace) {
   let prevTime, namespacesCache, enabledCache, enableOverride = null;
   function debug(...args) {
    if (!debug.enabled) return;
    const self = debug, curr = Number(new Date), ms = curr - (prevTime || curr);
    self.diff = ms, self.prev = prevTime, self.curr = curr, prevTime = curr, args[0] = createDebug.coerce(args[0]), 
    "string" != typeof args[0] && args.unshift("%O");
    let index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
     if ("%%" === match) return "%";
     index++;
     const formatter = createDebug.formatters[format];
     if ("function" == typeof formatter) {
      const val = args[index];
      match = formatter.call(self, val), args.splice(index, 1), index--;
     }
     return match;
    }), createDebug.formatArgs.call(self, args);
    (self.log || createDebug.log).apply(self, args);
   }
   return debug.namespace = namespace, debug.useColors = createDebug.useColors(), debug.color = createDebug.selectColor(namespace), 
   debug.extend = extend, debug.destroy = createDebug.destroy, Object.defineProperty(debug, "enabled", {
    enumerable: !0,
    configurable: !1,
    get: () => null !== enableOverride ? enableOverride : (namespacesCache !== createDebug.namespaces && (namespacesCache = createDebug.namespaces, 
    enabledCache = createDebug.enabled(namespace)), enabledCache),
    set: v => {
     enableOverride = v;
    }
   }), "function" == typeof createDebug.init && createDebug.init(debug), debug;
  }
  function extend(namespace, delimiter) {
   const newDebug = createDebug(this.namespace + (void 0 === delimiter ? ":" : delimiter) + namespace);
   return newDebug.log = this.log, newDebug;
  }
  function toNamespace(regexp) {
   return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
  }
  return createDebug.debug = createDebug, createDebug.default = createDebug, createDebug.coerce = function(val) {
   if (val instanceof Error) return val.stack || val.message;
   return val;
  }, createDebug.disable = function() {
   const namespaces = [ ...createDebug.names.map(toNamespace), ...createDebug.skips.map(toNamespace).map(namespace => "-" + namespace) ].join(",");
   return createDebug.enable(""), namespaces;
  }, createDebug.enable = function(namespaces) {
   let i;
   createDebug.save(namespaces), createDebug.namespaces = namespaces, createDebug.names = [], 
   createDebug.skips = [];
   const split = ("string" == typeof namespaces ? namespaces : "").split(/[\s,]+/), len = split.length;
   for (i = 0; i < len; i++) split[i] && ("-" === (namespaces = split[i].replace(/\*/g, ".*?"))[0] ? createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$")) : createDebug.names.push(new RegExp("^" + namespaces + "$")));
  }, createDebug.enabled = function(name) {
   if ("*" === name[name.length - 1]) return !0;
   let i, len;
   for (i = 0, len = createDebug.skips.length; i < len; i++) if (createDebug.skips[i].test(name)) return !1;
   for (i = 0, len = createDebug.names.length; i < len; i++) if (createDebug.names[i].test(name)) return !0;
   return !1;
  }, createDebug.humanize = ms, createDebug.destroy = function() {
   console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  }, Object.keys(env).forEach(key => {
   createDebug[key] = env[key];
  }), createDebug.names = [], createDebug.skips = [], createDebug.formatters = {}, 
  createDebug.selectColor = function(namespace) {
   let hash = 0;
   for (let i = 0; i < namespace.length; i++) hash = (hash << 5) - hash + namespace.charCodeAt(i), 
   hash |= 0;
   return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }, createDebug.enable(createDebug.load()), createDebug;
 }, browser$1 = function(fn, module) {
  return fn(module = {
   exports: {}
  }, module.exports), module.exports;
 }((function(module, exports) {
  exports.formatArgs = function(args) {
   if (args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff), 
   !this.useColors) return;
   const c = "color: " + this.color;
   args.splice(1, 0, c, "color: inherit");
   let index = 0, lastC = 0;
   args[0].replace(/%[a-zA-Z%]/g, match => {
    "%%" !== match && (index++, "%c" === match && (lastC = index));
   }), args.splice(lastC, 0, c);
  }, exports.save = function(namespaces) {
   try {
    namespaces ? exports.storage.setItem("debug", namespaces) : exports.storage.removeItem("debug");
   } catch (error) {}
  }, exports.load = function() {
   let r;
   try {
    r = exports.storage.getItem("debug");
   } catch (error) {}
   !r && "undefined" != typeof process && "env" in process && (r = process.env.DEBUG);
   return r;
  }, exports.useColors = function() {
   if ("undefined" != typeof window && window.process && ("renderer" === window.process.type || window.process.__nwjs)) return !0;
   if ("undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return !1;
   return "undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }, exports.storage = function() {
   try {
    return localStorage;
   } catch (error) {}
  }(), exports.destroy = (() => {
   let warned = !1;
   return () => {
    warned || (warned = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
   };
  })(), exports.colors = [ "#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33" ], 
  exports.log = console.debug || console.log || (() => {}), module.exports = common(exports);
  const {formatters: formatters} = module.exports;
  formatters.j = function(v) {
   try {
    return JSON.stringify(v);
   } catch (error) {
    return "[UnexpectedJSONParseError]: " + error.message;
   }
  };
 }));
 browser$1.formatArgs, browser$1.save, browser$1.load, browser$1.useColors, browser$1.storage, 
 browser$1.destroy, browser$1.colors, browser$1.log;
 function _defineProperty(obj, key, value) {
  return key in obj ? Object.defineProperty(obj, key, {
   value: value,
   enumerable: !0,
   configurable: !0,
   writable: !0
  }) : obj[key] = value, obj;
 }
 const log = browser$1("browserStorage");
 var allPrecompiledLocales = {
  ar: {},
  be: {},
  bg: {},
  bn: {},
  ca: {},
  cs: {},
  da: {},
  de: {},
  el: {},
  en: {},
  es: {},
  et: {},
  fa: {},
  fi: {},
  fr: {},
  he: {},
  hi: {},
  hr: {},
  hu: {},
  id: {},
  it: {},
  ja: {},
  ko: {},
  lt: {},
  lv: {},
  ms: {},
  nb: {},
  nl: {},
  pl: {},
  pt_BR: {},
  pt_PT: {},
  ro: {},
  ru: {},
  sk: {},
  sl: {},
  sr: {},
  sv: {},
  th: {},
  tr: {},
  uk: {},
  ur: {},
  vi: {},
  zh_CN: {},
  zh_TW: {}
 };
 let ShortcutKeyModifier, SafePage, TextDirection;
 !function(ShortcutKeyModifier) {
  ShortcutKeyModifier.None = "none", ShortcutKeyModifier.Alt = "alt", ShortcutKeyModifier.Meta = "meta", 
  ShortcutKeyModifier.Ctrl = "ctrl", ShortcutKeyModifier.Shift = "shift";
 }(ShortcutKeyModifier || (ShortcutKeyModifier = {})), function(SafePage) {
  SafePage.Blank = "blank", SafePage.NewTab = "newTab";
 }(SafePage || (SafePage = {})), function(TextDirection) {
  TextDirection.Ltr = "ltr", TextDirection.Rtl = "rtl";
 }(TextDirection || (TextDirection = {}));
 const rtlLanguages = [ "ar", "dv", "fa", "ha", "he", "ks", "ku", "ps", "ur", "yi" ];
 let languageCode, precompiledLocale = {};
 function getMessage(messageName, messageFormatParams) {
  return precompiledLocale[messageName] ? precompiledLocale[messageName](messageFormatParams || {}) : chrome.i18n.getMessage(messageName);
 }
 function getLanguage() {
  return (languageCode || chrome.i18n.getUILanguage()).split("_")[0];
 }
 languageCode = getMessage("language_code").replace("-", "_"), languageCode && allPrecompiledLocales && allPrecompiledLocales[languageCode] && (precompiledLocale = allPrecompiledLocales[languageCode]);
 const log$1 = browser$1("messages");
 function sendActionToBg$1(action, callback) {
  log$1('sending message to background, action "%s": %O', action.type, action), chrome.runtime.sendMessage(action, (function(response) {
   callback && callback(response), chrome.runtime.lastError && log$1("sendActionToBg for %s generated error", action.type, chrome.runtime.lastError);
  }));
 }
 function createAction(type, value) {
  return void 0 === value ? {
   type: type
  } : {
   type: type,
   value: value
  };
 }
 let GlobalActionTypes;
 !function(GlobalActionTypes) {
  GlobalActionTypes.Startup = "startup", GlobalActionTypes.GetState = "getState", 
  GlobalActionTypes.StateChange = "stateChange", GlobalActionTypes.Installed = "installed", 
  GlobalActionTypes.Updated = "updated";
 }(GlobalActionTypes || (GlobalActionTypes = {}));
 const globalActions_getState = () => createAction(GlobalActionTypes.GetState);
 let tabbed = !1;
 function tabNavigation() {
  return document.addEventListener("keydown", listenToTab, !1), function() {
   document.removeEventListener("mousedown", listenToMouse, !1), document.removeEventListener("keydown", listenToTab, !1), 
   document.body.classList.remove("tabbed"), tabbed = !1;
  };
 }
 function listenToTab(event) {
  "Tab" === event.code && (tabbed = !0, document.body.classList.add("tabbed"), document.removeEventListener("keydown", listenToTab, !1), 
  document.addEventListener("mousedown", listenToMouse, !1));
 }
 function listenToMouse() {
  tabbed && (tabbed = !1, document.body.classList.remove("tabbed"), document.removeEventListener("mousedown", listenToMouse, !1), 
  document.addEventListener("keydown", listenToTab, !1));
 }
 "undefined" != typeof chrome && void 0 !== chrome.runtime || (window.chrome = browser);
 const browserStorage = new class {
  constructor() {
   _defineProperty(this, "cache", void 0), _defineProperty(this, "usingStorage", void 0), 
   this.cache = {}, this.usingStorage = !1;
  }
  init(keys) {
   return new Promise(resolve => {
    chrome && chrome.storage || resolve(), this.usingStorage = !0, chrome.storage.local.get(keys || null, items => {
     this.cache = items, resolve();
    });
   });
  }
  get(path) {
   return this.cache[path];
  }
  set(path, value) {
   null == value || void 0 === value ? (this.usingStorage && chrome.storage.local.remove(path, () => {
    chrome.runtime.lastError && log('could not remove key "%s" from browser storage (%O)', path, chrome.runtime.lastError);
   }), delete this.cache[path]) : (this.usingStorage && chrome.storage.local.set({
    [path]: value
   }, () => {
    chrome.runtime.lastError && log('could not set key "%s" in browser storage (%O)', path, chrome.runtime.lastError);
   }), this.cache[path] = value);
  }
 };
 let onStateChange;
 const log$2 = browser$1("index");
 function connectToBackground() {
  var type, callback;
  return type = GlobalActionTypes.StateChange, callback = res => {
   log$2("background state changed: %O", res.state), onStateChange && onStateChange(res.state);
  }, chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {
   message && message.type && message.value && message.type === type && callback && callback(message.value);
  })), new Promise((function(resolve) {
   sendActionToBg$1(globalActions_getState(), res => {
    log$2("background state: %O", res.state), resolve(res.state);
   });
  }));
 }
 function initVue(bgState, rootComponent, extraOptions) {
  Vue.mixin({
   methods: {
    translate: (messageName, messageFormatParams) => getMessage(messageName, messageFormatParams),
    translatei18n: (messageName, substitutions) => function(messageName, substitutions) {
     return messageName ? substitutions ? chrome.i18n.getMessage(messageName, substitutions) : chrome.i18n.getMessage(messageName) : "";
    }(messageName, substitutions)
   }
  }), Vue.directive("focus", {
   inserted(node) {
    node.tabIndex = -1, node.focus();
   }
  });
  const app = new Vue({
   components: {
    Root: rootComponent
   },
   data: {
    bgState: bgState,
    hash: location.hash
   },
   el: "#app",
   render(createElement) {
    return createElement(rootComponent, {
     props: {
      bgState: this.bgState,
      hash: this.hash,
      storage: browserStorage
     }
    });
   },
   created() {
    const lang = this.translate("language_code");
    if (lang) {
     const html = document.querySelector("html");
     html.setAttribute("lang", lang), html.setAttribute("dir", rtlLanguages.includes(getLanguage()) ? TextDirection.Rtl : TextDirection.Ltr);
    }
   },
   ...extraOptions
  });
  onStateChange = newBgState => {
   app.bgState = newBgState;
  }, window.addEventListener("hashchange", () => {
   app.hash = location.hash.replace("#", "");
  }, !1);
 }
 let SecureLineVpnAction, SecureVpnVpnAction, StateItemFlag, VpnStatus, VpnLicenseType, VpnLicenseStatus, NativeMessagingEndpointName, VpnProductInstallationInfoLink, VpnProductDownloadLink, SecureBrowserFaqLink, VpnProductLicensePurchaseLink, ApiCompatibility, ExtensionCallerMethodName, LicenseUpgradePageReferer, IProductInfoEdition;
 var ErrorInfoSource, ErrorInfoCode;
 let VpnApiErrorType, AvastOneAction, NotificationType, AnalyticsActionTypes;
 !function(SecureLineVpnAction) {
  SecureLineVpnAction.Connect = "public.AvastSecureLine.Connect", SecureLineVpnAction.ConnectToOptimal = "public.AvastSecureLine.ConnectToOptimal", 
  SecureLineVpnAction.Disconnect = "public.AvastSecureLine.Disconnect", SecureLineVpnAction.GetApiVersion = "public.AvastSecureLine.GetApiVersion", 
  SecureLineVpnAction.GetOptimalGateway = "public.AvastSecureLine.GetOptimalGateway", 
  SecureLineVpnAction.GetState = "public.AvastSecureLine.GetState", SecureLineVpnAction.GetProductInfo = "public.AvastSecureLine.GetProductInfo", 
  SecureLineVpnAction.GetPublicIp = "public.AvastSecureLine.GetPublicIp", SecureLineVpnAction.OnErrorOccurred = "public.AvastSecureLine.OnErrorOccurred", 
  SecureLineVpnAction.OnStateChanged = "public.AvastSecureLine.OnStateChanged", SecureLineVpnAction.SetLanguage = "public.AvastSecureLine.SetLanguage", 
  SecureLineVpnAction.ShowNag = "public.AvastSecureLine.Ui.ShowNag", SecureLineVpnAction.ShowMainWindow = "public.AvastSecureLine.Ui.ShowMainWindow";
 }(SecureLineVpnAction || (SecureLineVpnAction = {})), function(SecureVpnVpnAction) {
  SecureVpnVpnAction.Connect = "public.AVGSecureVPN.Connect", SecureVpnVpnAction.ConnectToOptimal = "public.AVGSecureVPN.ConnectToOptimal", 
  SecureVpnVpnAction.Disconnect = "public.AVGSecureVPN.Disconnect", SecureVpnVpnAction.GetApiVersion = "public.AVGSecureVPN.GetApiVersion", 
  SecureVpnVpnAction.GetOptimalGateway = "public.AVGSecureVPN.GetOptimalGateway", 
  SecureVpnVpnAction.GetState = "public.AVGSecureVPN.GetState", SecureVpnVpnAction.GetProductInfo = "public.AVGSecureVPN.GetProductInfo", 
  SecureVpnVpnAction.GetPublicIp = "public.AVGSecureVPN.GetPublicIp", SecureVpnVpnAction.OnErrorOccurred = "public.AVGSecureVPN.OnErrorOccurred", 
  SecureVpnVpnAction.OnStateChanged = "public.AVGSecureVPN.OnStateChanged", SecureVpnVpnAction.SetLanguage = "public.AVGSecureVPN.SetLanguage", 
  SecureVpnVpnAction.ShowNag = "public.AVGSecureVPN.Ui.ShowNag", SecureVpnVpnAction.ShowMainWindow = "public.AVGSecureVPN.Ui.ShowMainWindow";
 }(SecureVpnVpnAction || (SecureVpnVpnAction = {})), function(StateItemFlag) {
  StateItemFlag[StateItemFlag.VpnStatus = 1] = "VpnStatus", StateItemFlag[StateItemFlag.Gateways = 2] = "Gateways", 
  StateItemFlag[StateItemFlag.LicenseInfo = 4] = "LicenseInfo", StateItemFlag[StateItemFlag.ActiveGateway = 8] = "ActiveGateway", 
  StateItemFlag[StateItemFlag.LastError = 32] = "LastError", StateItemFlag[StateItemFlag.PublicIpInfo = 256] = "PublicIpInfo", 
  StateItemFlag[StateItemFlag.ConnectionInfo = 512] = "ConnectionInfo";
 }(StateItemFlag || (StateItemFlag = {})), function(VpnStatus) {
  VpnStatus.Connected = "connected", VpnStatus.Connecting = "connecting", VpnStatus.Reconnecting = "reconnecting", 
  VpnStatus.Disconnected = "disconnected", VpnStatus.Disconnecting = "disconnecting", 
  VpnStatus.Error = "error", VpnStatus.Initializing = "initializing";
 }(VpnStatus || (VpnStatus = {})), function(VpnLicenseType) {
  VpnLicenseType.Trial = "trial", VpnLicenseType.Subscription = "subscription", VpnLicenseType.Free = "free";
 }(VpnLicenseType || (VpnLicenseType = {})), function(VpnLicenseStatus) {
  VpnLicenseStatus.Valid = "valid", VpnLicenseStatus.Expired = "expired", VpnLicenseStatus.NoSubscription = "noSubscription", 
  VpnLicenseStatus.NoLicenseFile = "noLicenseFile", VpnLicenseStatus.Banned = "banned";
 }(VpnLicenseStatus || (VpnLicenseStatus = {})), function(NativeMessagingEndpointName) {
  NativeMessagingEndpointName.SecureVpn = "com.avg.vpn", NativeMessagingEndpointName.SecureLine = "com.avast.vpn", 
  NativeMessagingEndpointName.AvastOne = "com.avast.nativeproxy";
 }(NativeMessagingEndpointName || (NativeMessagingEndpointName = {})), function(VpnProductInstallationInfoLink) {
  VpnProductInstallationInfoLink.SecureVpn = "https://extension.avgbrowser.com/vpn/how-to-install", 
  VpnProductInstallationInfoLink.SecureLine = "https://extension.avastbrowser.com/vpn/how-to-install";
 }(VpnProductInstallationInfoLink || (VpnProductInstallationInfoLink = {})), function(VpnProductDownloadLink) {
  VpnProductDownloadLink.SecureVpn = "https://extension.avgbrowser.com/vpn/download", 
  VpnProductDownloadLink.SecureLine = "https://extension.avastbrowser.com/vpn/download";
 }(VpnProductDownloadLink || (VpnProductDownloadLink = {})), function(SecureBrowserFaqLink) {
  SecureBrowserFaqLink.SecureVpn = "https://extension.avgbrowser.com/vpn/about", SecureBrowserFaqLink.SecureLine = "https://extension.avastbrowser.com/vpn/about";
 }(SecureBrowserFaqLink || (SecureBrowserFaqLink = {})), function(VpnProductLicensePurchaseLink) {
  VpnProductLicensePurchaseLink.SecureVpn = "https://extension.avgbrowser.com/vpn/offer", 
  VpnProductLicensePurchaseLink.SecureLine = "https://extension.avastbrowser.com/vpn/offer";
 }(VpnProductLicensePurchaseLink || (VpnProductLicensePurchaseLink = {})), function(ApiCompatibility) {
  ApiCompatibility.Compatible = "Compatible", ApiCompatibility.ExtensionOld = "ExtensionOld", 
  ApiCompatibility.VpnClientOld = "VpnClientOld";
 }(ApiCompatibility || (ApiCompatibility = {})), function(ExtensionCallerMethodName) {
  ExtensionCallerMethodName.SetState = "setState", ExtensionCallerMethodName.GetState = "getState", 
  ExtensionCallerMethodName.UpgradeNow = "upgradeNow";
 }(ExtensionCallerMethodName || (ExtensionCallerMethodName = {})), function(LicenseUpgradePageReferer) {
  LicenseUpgradePageReferer.VpnOn = "VPN_on", LicenseUpgradePageReferer.VpnOff = "VPN_off", 
  LicenseUpgradePageReferer.VpnExpired = "VPN_expired", LicenseUpgradePageReferer.VpnLimitReached = "VPN_limit_reached", 
  LicenseUpgradePageReferer.VpnFirstLaunch = "VPN_first_launch", LicenseUpgradePageReferer.VpnGeneric = "VPN";
 }(LicenseUpgradePageReferer || (LicenseUpgradePageReferer = {})), function(IProductInfoEdition) {
  IProductInfoEdition[IProductInfoEdition.Consumer = 1] = "Consumer", IProductInfoEdition[IProductInfoEdition.OemHp = 2] = "OemHp", 
  IProductInfoEdition[IProductInfoEdition.OemAsus = 3] = "OemAsus", IProductInfoEdition[IProductInfoEdition.OemAcer = 4] = "OemAcer", 
  IProductInfoEdition[IProductInfoEdition.OemLenovo = 5] = "OemLenovo", IProductInfoEdition[IProductInfoEdition.OemSamsung = 6] = "OemSamsung", 
  IProductInfoEdition[IProductInfoEdition.Business = 8] = "Business", IProductInfoEdition[IProductInfoEdition.AvastOne = 9] = "AvastOne";
 }(IProductInfoEdition || (IProductInfoEdition = {})), function(ErrorInfoSource) {
  ErrorInfoSource.Connection = "connection";
 }(ErrorInfoSource || (ErrorInfoSource = {})), function(ErrorInfoCode) {
  ErrorInfoCode.LicenseRefused = "licenseRefused", ErrorInfoCode.NoInternetConnection = "noInternetConnection", 
  ErrorInfoCode.LicenseExpired = "licenseExpired", ErrorInfoCode.ConnectionLimitReached = "connectionLimitReached", 
  ErrorInfoCode.DataLimitReached = "dataLimitReached", ErrorInfoCode.VpnNameBanned = "vpnNameBanned", 
  ErrorInfoCode.PlatformNotAllowed = "platformNotAllowed", ErrorInfoCode.LicenseBanned = "licenseBanned", 
  ErrorInfoCode.AuthorizationFailed = "authorizationFailed", ErrorInfoCode.LocationNotAllowed = "locationNotAllowed", 
  ErrorInfoCode.InternalError = "internalError", ErrorInfoCode.MissingMandatoryParameters = "missingMandatoryParameters", 
  ErrorInfoCode.NoLicenseInAccount = "noLicenseInAccount";
 }(ErrorInfoCode || (ErrorInfoCode = {})), function(VpnApiErrorType) {
  VpnApiErrorType.Exception = "exception";
 }(VpnApiErrorType || (VpnApiErrorType = {})), function(AvastOneAction) {
  AvastOneAction.GetIpmUrl = "app.utils.GetUrlParameters", AvastOneAction.ShowStoreWindow = "app.windowManager.ShowStoreWindow";
 }(AvastOneAction || (AvastOneAction = {})), function(NotificationType) {
  NotificationType.ActivateVpnLicense = "ActivateVpnLicense", NotificationType.Error = "Error", 
  NotificationType.InstallVpnClient = "InstallVpnClient", NotificationType.Offline = "Offline", 
  NotificationType.SubscriptionExpired = "SubscriptionExpired", NotificationType.TrialExpired = "TrialExpired", 
  NotificationType.UpdateExtension = "UpdateExtension", NotificationType.UpdateVpnClient = "UpdateVpnClient";
 }(NotificationType || (NotificationType = {})), function(AnalyticsActionTypes) {
  AnalyticsActionTypes.AnalyticsUserConsent = "analytics.analyticsUserConsent", AnalyticsActionTypes.AsbTrack = "analytics.asbTrack", 
  AnalyticsActionTypes.ClientCountryCodeChange = "analytics.clientCountryCodeChange", 
  AnalyticsActionTypes.CreateSession = "analytics.createSession", AnalyticsActionTypes.HeartbeatTracked = "analytics.heartbeatTracked", 
  AnalyticsActionTypes.TrackEvent = "analytics.trackEvent", AnalyticsActionTypes.TrackInstall = "analytics.trackInstall", 
  AnalyticsActionTypes.TrackView = "analytics.trackView", AnalyticsActionTypes.UninstallUrlDirty = "analytics.uninstallUrlDirty", 
  AnalyticsActionTypes.UserConsentChange = "analytics.userConsentChange";
 }(AnalyticsActionTypes || (AnalyticsActionTypes = {}));
 const analyticsActions_asbTrack = (type, action) => createAction(AnalyticsActionTypes.AsbTrack, {
  type: type,
  action: action
 });
 let EventCategory, EventAction, EventLabel, ScreenView, AsbEventType, AsbActivePageTypes, AsbEventAction, AsbEventPage, AsbEventCategory, UserConsentSource, VpnActionTypes;
 !function(EventCategory) {
  EventCategory.Lifecycle = "Lifecycle", EventCategory.Notification = "Notification";
 }(EventCategory || (EventCategory = {})), function(EventAction) {
  EventAction.Installation = "Installation", EventAction.Heartbeat = "Heartbeat", 
  EventAction.Update = "Update", EventAction.Click = "Click";
 }(EventAction || (EventAction = {})), function(EventLabel) {
  EventLabel.WholeNotification = "Whole Notification", EventLabel.Close = "Close", 
  EventLabel.MoreStartFreeDownload = "More: Start Free Download", EventLabel.MoreNextTime = "More: Next time";
 }(EventLabel || (EventLabel = {})), function(ScreenView) {
  ScreenView.Notification = "Notification";
 }(ScreenView || (ScreenView = {})), function(AsbEventType) {
  AsbEventType[AsbEventType.Page = 0] = "Page", AsbEventType[AsbEventType.Click = 1] = "Click";
 }(AsbEventType || (AsbEventType = {})), function(AsbActivePageTypes) {
  AsbActivePageTypes[AsbActivePageTypes.None = 0] = "None", AsbActivePageTypes[AsbActivePageTypes.FreeDataNotUsed = 1] = "FreeDataNotUsed", 
  AsbActivePageTypes[AsbActivePageTypes.FreeDataAvailable = 2] = "FreeDataAvailable", 
  AsbActivePageTypes[AsbActivePageTypes.FreeDataUsed = 3] = "FreeDataUsed", AsbActivePageTypes[AsbActivePageTypes.Paid = 4] = "Paid", 
  AsbActivePageTypes[AsbActivePageTypes.Offline = 5] = "Offline", AsbActivePageTypes[AsbActivePageTypes.General = 6] = "General", 
  AsbActivePageTypes[AsbActivePageTypes.UpdateBrowser = 7] = "UpdateBrowser", AsbActivePageTypes[AsbActivePageTypes.InstallApp = 8] = "InstallApp", 
  AsbActivePageTypes[AsbActivePageTypes.Loading = 9] = "Loading", AsbActivePageTypes[AsbActivePageTypes.UpdateExtension = 10] = "UpdateExtension", 
  AsbActivePageTypes[AsbActivePageTypes.UpdateApp = 11] = "UpdateApp", AsbActivePageTypes[AsbActivePageTypes.LicenseStatusNotValid = 12] = "LicenseStatusNotValid", 
  AsbActivePageTypes[AsbActivePageTypes.Reinstall = 13] = "Reinstall", AsbActivePageTypes[AsbActivePageTypes.Restart = 14] = "Restart";
 }(AsbActivePageTypes || (AsbActivePageTypes = {})), function(AsbEventAction) {
  AsbEventAction.None = "", AsbEventAction.Cta = "cta", AsbEventAction.Close = "close", 
  AsbEventAction.On = "on", AsbEventAction.Off = "off";
 }(AsbEventAction || (AsbEventAction = {})), function(AsbEventPage) {
  AsbEventPage.None = "3999", AsbEventPage.FreeDataNotUsedPage = "3700", AsbEventPage.FreeDataAvailablePage = "3701", 
  AsbEventPage.FreeDataUsedPage = "3702", AsbEventPage.PaidPage = "3703", AsbEventPage.ErrorPage = "3704";
 }(AsbEventPage || (AsbEventPage = {})), function(AsbEventCategory) {
  AsbEventCategory.None = "", AsbEventCategory.Upsell = "upsell", AsbEventCategory.Paid = "", 
  AsbEventCategory.OfflineError = "offline-error", AsbEventCategory.GeneralError = "general-error", 
  AsbEventCategory.UpdateBrowserError = "update-browser-error", AsbEventCategory.InstallAppError = "install-app-error", 
  AsbEventCategory.LoadingError = "loading-error", AsbEventCategory.UpdateExtensionError = "update-extension-error", 
  AsbEventCategory.UpdateAppError = "update-app-error", AsbEventCategory.LicenseStatusNotValidError = "license-status-not-valid-error", 
  AsbEventCategory.ReinstallError = "reinstall-error", AsbEventCategory.RestartError = "restart-error";
 }(AsbEventCategory || (AsbEventCategory = {})), function(UserConsentSource) {
  UserConsentSource.User = "user", UserConsentSource.Preset = "preset";
 }(UserConsentSource || (UserConsentSource = {})), function(VpnActionTypes) {
  VpnActionTypes.ApiCompatibilityResolved = "vpn.apiCompatibilityResolved", VpnActionTypes.ActiveGatewayUpdated = "vpn.activeGatewayUpdated", 
  VpnActionTypes.AddNotification = "vpn.addNotification", VpnActionTypes.GatewaysUpdated = "vpn.gatewaysUpdated", 
  VpnActionTypes.LastErrorUpdated = "vpn.lastErrorUpdated", VpnActionTypes.ErrorOccurred = "vpn.ErrorOccurred", 
  VpnActionTypes.VpnApiReturnedError = "vpn.VpnApiReturnedError", VpnActionTypes.LicenseInfoUpdated = "vpn.licenseInfoUpdated", 
  VpnActionTypes.VpnStatusUpdated = "vpn.vpnStatusUpdated", VpnActionTypes.Connect = "vpn.connect", 
  VpnActionTypes.Disconnect = "vpn.disconnect", VpnActionTypes.OptimalGatewayUpdated = "vpn.optimalGatewayUpdated", 
  VpnActionTypes.SelectGateway = "vpn.selectGateway", VpnActionTypes.IpAddressChanged = "vpn.ipAddressChanged", 
  VpnActionTypes.ProductInfoUpdated = "vpn.productInfoUpdated", VpnActionTypes.PublicIpChanged = "vpn.publicIpChanged", 
  VpnActionTypes.ReconnectingToAnotherGatewayStatusChanged = "vpn.reconnectingToAnotherGatewayStatusChanged", 
  VpnActionTypes.RemoveNotification = "vpn.removeNotification", VpnActionTypes.HandleNetworkConnectivityChange = "vpn.handleNetworkConnectivityChange", 
  VpnActionTypes.SetBrowserApiAvailability = "vpn.setBrowserApiAvailability", VpnActionTypes.SetIsInitialized = "vpn.setIsInitialized", 
  VpnActionTypes.SetNativeMessagingHostFound = "vpn.setNativeMessagingHostFound", 
  VpnActionTypes.VpnClientApiVersionUpdated = "vpn.VpnClientApiVersionUpdated", VpnActionTypes.ShowLicenseUpgradePage = "vpn.showLicenseUpgradePage", 
  VpnActionTypes.ShowMainWindow = "vpn.ShowMainWindow", VpnActionTypes.ShowNag = "vpn.ShowNag", 
  VpnActionTypes.VpnClientApiEditionUpdated = "vpn.VpnClientApiEditionUpdated", VpnActionTypes.SetIsAvastOne = "vpn.setIsAvastOne", 
  VpnActionTypes.PublicIpInfoUpdated = "vpn.publicIpInfoUpdated", VpnActionTypes.ConnectionInfoUpdated = "vpn.connectionInfoUpdated", 
  VpnActionTypes.LastActivePageUpdated = "vpn.lastActivePageUpdated";
 }(VpnActionTypes || (VpnActionTypes = {}));
 const vpnActions_connect = () => createAction(VpnActionTypes.Connect), vpnActions_disconnect = () => createAction(VpnActionTypes.Disconnect), vpnActions_errorOccurred = value => createAction(VpnActionTypes.ErrorOccurred, value), vpnActions_gatewaySelected = value => createAction(VpnActionTypes.SelectGateway, value), vpnActions_showLicenseUpgradePage = () => createAction(VpnActionTypes.ShowLicenseUpgradePage), vpnActions_updateLastActivePage = value => createAction(VpnActionTypes.LastActivePageUpdated, value), vpnActions_vpnApiReturnedError = value => createAction(VpnActionTypes.VpnApiReturnedError, value);
 function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  "boolean" != typeof shadowMode && (createInjectorSSR = createInjector, createInjector = shadowMode, 
  shadowMode = !1);
  const options = "function" == typeof script ? script.options : script;
  let hook;
  if (template && template.render && (options.render = template.render, options.staticRenderFns = template.staticRenderFns, 
  options._compiled = !0, isFunctionalTemplate && (options.functional = !0)), scopeId && (options._scopeId = scopeId), 
  moduleIdentifier ? (hook = function(context) {
   (context = context || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) || "undefined" == typeof __VUE_SSR_CONTEXT__ || (context = __VUE_SSR_CONTEXT__), 
   style && style.call(this, createInjectorSSR(context)), context && context._registeredComponents && context._registeredComponents.add(moduleIdentifier);
  }, options._ssrRegister = hook) : style && (hook = shadowMode ? function(context) {
   style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
  } : function(context) {
   style.call(this, createInjector(context));
  }), hook) if (options.functional) {
   const originalRender = options.render;
   options.render = function(h, context) {
    return hook.call(context), originalRender(h, context);
   };
  } else {
   const existing = options.beforeCreate;
   options.beforeCreate = existing ? [].concat(existing, hook) : [ hook ];
  }
  return script;
 }
 const __vue_component__$1 = normalizeComponent({
  render: function() {
   var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
   return _c("div", {
    staticClass: "connection-status"
   }, [ _vm.getTitleText ? _c("div", {
    staticClass: "connection-status-title",
    domProps: {
     innerHTML: _vm._s(_vm.getTitleText)
    }
   }) : _vm._e(), _vm._v(" "), _vm.getDescriptionText ? _c("div", {
    staticClass: "connection-status-description",
    domProps: {
     innerHTML: _vm._s(_vm.getDescriptionText)
    }
   }) : _vm._e(), _vm._v(" "), _vm.promotion ? _c("promotion") : _vm._e() ], 1);
  },
  staticRenderFns: []
 }, void 0, {
  components: {
   Promotion: normalizeComponent({
    render: function() {
     var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
     return _c("div", {
      staticClass: "promotion-items"
     }, [ _c("div", {
      staticClass: "connection-status-promotion-text"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("connection_status_limit_reached_promotion_text")) + "\n\t") ]), _vm._v(" "), _c("img", {
      staticClass: "connection-status-item-img",
      attrs: {
       src: "/img/eye.svg"
      }
     }), _vm._v(" "), _c("div", {
      staticClass: "connection-status-item-text"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("connection_status_limit_reached_promotion_list_item_1")) + "\n\t") ]), _vm._v(" "), _c("img", {
      staticClass: "connection-status-item-img",
      attrs: {
       src: "/img/lock.svg"
      }
     }), _vm._v(" "), _c("div", {
      staticClass: "connection-status-item-text"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("connection_status_limit_reached_promotion_list_item_2")) + "\n\t") ]), _vm._v(" "), _c("img", {
      staticClass: "connection-status-item-img",
      attrs: {
       src: "/img/fingerprint.svg"
      }
     }), _vm._v(" "), _c("div", {
      staticClass: "connection-status-item-text"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("connection_status_limit_reached_promotion_list_item_3")) + "\n\t") ]), _vm._v(" "), _c("button", {
      staticClass: "connection-status-button",
      on: {
       click: _vm.onBtnClicked
      }
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("promotion_button")) + "\n\t") ]) ]);
    },
    staticRenderFns: []
   }, void 0, {
    methods: {
     onBtnClicked() {
      sendActionToBg$1(vpnActions_showLicenseUpgradePage()), sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Cta));
     }
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0)
  },
  props: {
   titleStrId: String,
   descriptionStrId: String,
   promotion: {
    type: Boolean,
    default: !1
   }
  },
  computed: {
   getTitleText() {
    return this.translatei18n(this.titleStrId);
   },
   getDescriptionText() {
    return this.translatei18n(this.descriptionStrId);
   }
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0);
 const __vue_component__$2 = normalizeComponent({
  render: function() {
   var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
   return _c("div", {
    attrs: {
     id: "toggle-container"
    }
   }, [ _c("div", {
    class: _vm.actionClass,
    attrs: {
     id: "toggle"
    },
    on: {
     click: function($event) {
      return _vm.$emit("toggle-clicked");
     }
    }
   }, [ _c("span", {
    attrs: {
     id: "toggle-hover"
    }
   }), _vm._v(" "), _vm._m(0) ]) ]);
  },
  staticRenderFns: [ function() {
   var _h = this.$createElement, _c = this._self._c || _h;
   return _c("span", {
    attrs: {
     id: "bar"
    }
   }, [ _c("span", {
    attrs: {
     id: "knob"
    }
   }) ]);
  } ]
 }, void 0, {
  props: {
   actionClass: String
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0);
 const __vue_component__$3 = normalizeComponent({
  render: function() {
   var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
   return _c("div", {
    staticClass: "error-wrapper"
   }, [ _c("div", {
    staticClass: "secure-connection"
   }, [ _vm._v("\n\t\t" + _vm._s(_vm.translate("secure_connection")) + "\n\t") ]), _vm._v(" "), _c("status", {
    attrs: {
     "title-str-id": "connection_status_disconnected_title"
    }
   }), _vm._v(" "), _vm.errorItems ? _vm._l(_vm.errorItems, (function(error, index) {
    return _c("div", {
     key: index,
     staticClass: "error-notification-text"
    }, [ _vm._v("\n\t\t" + _vm._s(_vm.translate(error.errorStrId)) + "\n\t\t"), _c("a", {
     staticClass: "error-notification-link",
     attrs: {
      target: "_blank",
      href: error.link
     }
    }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translate(error.linkStrId)) + "\n\t\t") ]) ]);
   })) : _c("div", {
    staticClass: "error-notification-text"
   }, [ _vm._v("\n\t\t" + _vm._s(_vm.getErrorText()) + "\n\t") ]), _vm._v(" "), _vm.hideButton ? _c("toggle", {
    attrs: {
     "action-class": "disabled"
    }
   }) : _c("button", {
    staticClass: "ripple",
    attrs: {
     id: "error-notification-button"
    },
    on: {
     click: function($event) {
      return _vm.$emit("error-button-clicked");
     }
    }
   }, [ _vm._v("\n\t\t" + _vm._s(_vm.getButtonText()) + "\n\t") ]) ], 2);
  },
  staticRenderFns: []
 }, void 0, {
  components: {
   Status: __vue_component__$1,
   Toggle: __vue_component__$2
  },
  props: {
   errorStrId: String,
   errorItems: Array,
   buttonStrId: String,
   hideButton: Boolean
  },
  methods: {
   getErrorText() {
    return this.translatei18n(this.errorStrId);
   },
   getButtonText() {
    return this.translatei18n(this.buttonStrId);
   }
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0);
 const __vue_component__$4 = normalizeComponent({
  render: function() {
   var _h = this.$createElement, _c = this._self._c || _h;
   return _c("div", {
    staticClass: "wrapper"
   }, [ _c("error", {
    attrs: {
     "error-str-id": this.activateStrId,
     "hide-button": !1,
     "button-str-id": "learn_more"
    },
    on: {
     "error-button-clicked": this.onBtnClicked
    }
   }) ], 1);
  },
  staticRenderFns: []
 }, void 0, {
  components: {
   Error: __vue_component__$3
  },
  props: {
   isAvastOne: Boolean
  },
  computed: {
   activateStrId() {
    return this.isAvastOne ? "activate_vpn_product_avast_one" : "activate_vpn_product";
   }
  },
  methods: {
   onBtnClicked() {
    sendActionToBg$1(vpnActions_showLicenseUpgradePage()), sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Cta));
   }
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0);
 const __vue_component__$5 = normalizeComponent({
  render: function() {
   var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
   return _c("div", {
    staticClass: "location-item"
   }, [ _c("div", {
    staticClass: "location-flag-container"
   }, [ _c("img", {
    staticClass: "location-flag",
    attrs: {
     src: _vm.selectedGatewayFlag
    }
   }), _vm._v(" "), _vm.isSelected ? _c("span", {
    staticClass: "selected"
   }) : _vm._e() ]), _vm._v(" "), _c("div", {
    staticClass: "location-data"
   }, [ _c("div", {
    staticClass: "location-country-city-pair"
   }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.gatewayDisplayName) + "\n\t\t") ]), _vm._v(" "), _vm.isOptimal ? _c("div", {
    staticClass: "location-optimal-text"
   }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translatei18n("fastest_location")) + "\n\t\t") ]) : _vm._e() ]), _vm._v(" "), _c("img", {
    staticClass: "location-arrow-right",
    attrs: {
     src: "/img/arrowRight.svg"
    }
   }) ]);
  },
  staticRenderFns: []
 }, void 0, {
  props: {
   gateway: Object,
   isOptimal: Boolean,
   isSelected: Boolean
  },
  data() {
   return {
    showDropdown: !1,
    selectedGateway: this.gateway
   };
  },
  computed: {
   gatewayDisplayName() {
    return this.gateway.city.name + ", " + this.gateway.country.name;
   },
   selectedGatewayFlag() {
    return "/img/flags/" + this.gateway.country.id + ".svg";
   }
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0), log$3 = browser$1("vpn-dashboard-location-menu");
 const __vue_component__$d = normalizeComponent({
  render: function() {
   var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
   return _c("div", {
    staticClass: "wrapper",
    attrs: {
     page: _vm.dashboardActivePage
    }
   }, [ _c("connection-status", {
    attrs: {
     "bg-state": _vm.bgState,
     "is-connected": _vm.isConnected,
     "is-disabled": _vm.isDisabled,
     "is-not-used": _vm.isNotUsed,
     "has-limit-reached": _vm.hasLimitReached
    }
   }), _vm._v(" "), _c("connection-toggle", {
    directives: [ {
     name: "show",
     rawName: "v-show",
     value: _vm.showToggle,
     expression: "showToggle"
    } ],
    attrs: {
     "bg-state": _vm.bgState,
     disabled: _vm.isDisabled
    }
   }), _vm._v(" "), _c("location-selected", {
    directives: [ {
     name: "show",
     rawName: "v-show",
     value: _vm.showLocations,
     expression: "showLocations"
    } ],
    attrs: {
     "bg-state": _vm.bgState,
     connected: _vm.isConnected
    }
   }), _vm._v(" "), _c("IpInfoBase", {
    attrs: {
     connected: _vm.isConnected,
     "public-ip-info": _vm.publicIpInfo,
     "connection-info": _vm.connectionInfo
    }
   }), _vm._v(" "), _c("free-data", {
    directives: [ {
     name: "show",
     rawName: "v-show",
     value: _vm.showFreeData,
     expression: "showFreeData"
    } ],
    attrs: {
     "license-info": _vm.licenseInfo
    }
   }), _vm._v(" "), _c("upgrade-promotion", {
    directives: [ {
     name: "show",
     rawName: "v-show",
     value: _vm.showBottomPromotion,
     expression: "showBottomPromotion"
    } ]
   }) ], 1);
  },
  staticRenderFns: []
 }, void 0, {
  components: {
   LocationSelected: normalizeComponent({
    render: function() {
     var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
     return _c("div", {
      staticClass: "test"
     }, [ _c("div", {
      staticClass: "location-selected"
     }, [ _vm.connected ? _c("div", {
      staticClass: "location-your-location-text"
     }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translatei18n("your_location_connected")) + "\n\t\t") ]) : _c("div", {
      staticClass: "location-your-location-text"
     }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translatei18n("your_location_disconnected")) + "\n\t\t") ]), _vm._v(" "), _c("location-item", {
      attrs: {
       gateway: _vm.gateway,
       "is-optimal": _vm.isOptimal,
       "is-selected": !0
      },
      nativeOn: {
       click: function($event) {
        return _vm.toggleLocationsList.apply(null, arguments);
       }
      }
     }) ], 1), _vm._v(" "), _c("locations-list", {
      directives: [ {
       name: "show",
       rawName: "v-show",
       value: _vm.showLocationsList,
       expression: "showLocationsList"
      } ],
      attrs: {
       "bg-state": _vm.bgState
      },
      on: {
       toggleLocationsList: _vm.toggleLocationsList
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, {
    components: {
     LocationItem: __vue_component__$5,
     LocationsList: normalizeComponent({
      render: function() {
       var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
       return _c("div", {
        staticClass: "locations-list"
       }, [ _c("div", {
        staticClass: "locations-list-select"
       }, [ _c("img", {
        staticClass: "locations-list-arrow-left",
        attrs: {
         src: "/img/arrowLeft.svg"
        },
        on: {
         click: _vm.goBack
        }
       }), _vm._v(" "), _c("div", {
        staticClass: "locations-list-select-location-msg"
       }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translatei18n("select_location")) + "\n\t\t") ]) ]), _vm._v(" "), _c("div", {
        staticClass: "locations-container"
       }, [ _c("div", {
        staticClass: "locations"
       }, [ _c("location-item", {
        attrs: {
         gateway: _vm.optimalGateway,
         "is-optimal": !0,
         "is-selected": _vm.optimalGateway.id === _vm.selectedGateway.id
        },
        nativeOn: {
         click: function($event) {
          return _vm.onLocationItemClicked(_vm.gateway);
         }
        }
       }), _vm._v(" "), _vm._l(_vm.gateways, (function(gateway) {
        return _c("location-item", {
         key: gateway.id,
         attrs: {
          gateway: gateway,
          "is-optimal": !1,
          "is-selected": gateway.id === _vm.selectedGateway.id
         },
         nativeOn: {
          click: function($event) {
           return _vm.onLocationItemClicked(gateway);
          }
         }
        });
       })) ], 2) ]) ]);
      },
      staticRenderFns: []
     }, void 0, {
      components: {
       LocationItem: __vue_component__$5
      },
      props: {
       bgState: Object
      },
      data() {
       return {
        selectedGateway: this.bgState.vpn.selectedGateway,
        optimalGateway: this.bgState.vpn.optimalGateway
       };
      },
      computed: {
       gateways() {
        return this.bgState.vpn.gateways;
       },
       filteredGateways() {
        return log$3(this.bgState), this.bgState.vpn.gateways.filter(v => "optimal_unknown" !== v.id);
       }
      },
      methods: {
       goBack() {
        this.$emit("toggleLocationsList");
       },
       onLocationItemClicked(gateway) {
        log$3("onLocationItemClicked %O", gateway), sendActionToBg$1(vpnActions_gatewaySelected(gateway)), 
        sendActionToBg$1(vpnActions_connect()), this.goBack();
       }
      }
     }, void 0, !1, void 0, !1, void 0, void 0, void 0)
    },
    props: {
     bgState: Object,
     connected: Boolean
    },
    data: () => ({
     showLocationsList: !1
    }),
    computed: {
     gateway() {
      return this.bgState.vpn.selectedGateway;
     },
     isOptimal() {
      return this.bgState.vpn.selectedGateway.id === this.bgState.vpn.optimalGateway.id;
     }
    },
    methods: {
     toggleLocationsList() {
      this.showLocationsList = !this.showLocationsList;
     }
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   ConnectionToggle: normalizeComponent({
    render: function() {
     var _h = this.$createElement;
     return (this._self._c || _h)("toggle", {
      attrs: {
       "action-class": this.actionClass
      },
      on: {
       "toggle-clicked": this.onConnectToggleClicked
      }
     });
    },
    staticRenderFns: []
   }, void 0, {
    components: {
     Toggle: __vue_component__$2
    },
    props: {
     bgState: Object,
     disabled: Boolean
    },
    computed: {
     status() {
      return this.bgState.vpn.vpnStatus;
     },
     isConnected() {
      return this.bgState.vpn.vpnStatus === VpnStatus.Connected;
     },
     isConnecting() {
      return this.bgState.vpn.vpnStatus === VpnStatus.Connecting || this.bgState.vpn.isReconnectingToAnotherGateway || this.bgState.vpn.vpnStatus === VpnStatus.Reconnecting;
     },
     isDisconnecting() {
      return this.bgState.vpn.vpnStatus === VpnStatus.Disconnecting;
     },
     actionClass() {
      return this.disabled ? "disabled" : this.isConnected ? "checked" : this.isConnecting ? "connecting" : this.isDisconnecting ? "disconnecting" : "";
     }
    },
    methods: {
     onConnectToggleClicked() {
      if (this.disabled) return;
      let action = AsbEventAction.None;
      switch (this.status) {
      case VpnStatus.Disconnected:
       sendActionToBg$1(vpnActions_connect()), action = AsbEventAction.On;
       break;

      case VpnStatus.Connected:
       sendActionToBg$1(vpnActions_disconnect()), action = AsbEventAction.Off;
      }
      action !== AsbEventAction.None && sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Click, action));
     }
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   ConnectionStatus: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "connection-status-container"
     }, [ _c("div", {
      staticClass: "secure-connection"
     }, [ this._v("\n\t\t" + this._s(this.translate("secure_connection")) + "\n\t") ]), this._v(" "), this.isConnected ? _c("status", {
      attrs: {
       "title-str-id": "connection_status_connected_title",
       "description-str-id": "connection_status_connected_text"
      }
     }) : this.isNotUsed ? _c("status", {
      attrs: {
       "title-str-id": "connection_status_disconnected_free_title",
       "description-str-id": "connection_status_disconnected_free_text"
      }
     }) : this.hasLimitReached ? _c("status", {
      attrs: {
       "title-str-id": "connection_status_limit_reached_title",
       "description-str-id": "connection_status_limit_reached_text",
       promotion: !0
      }
     }) : _c("status", {
      attrs: {
       "title-str-id": "connection_status_disconnected_title",
       "description-str-id": "connection_status_disconnected_text"
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, {
    components: {
     Status: __vue_component__$1
    },
    props: {
     bgState: Object,
     isConnected: Boolean,
     isDisabled: Boolean,
     isNotUsed: Boolean,
     hasLimitReached: Boolean
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   FreeData: normalizeComponent({
    render: function() {
     var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
     return _c("div", {
      staticClass: "free-data-container"
     }, [ _c("div", {
      staticClass: "free-data-free-title"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("free_data_free")) + "\n\t") ]), _vm._v(" "), _c("div", {
      staticClass: "free-data-renew-in-title"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("free_data_renew_in", [ _vm.renewIn ])) + "\n\t") ]), _vm._v(" "), _c("div", {
      staticClass: "free-data-bar"
     }), _vm._v(" "), _c("div", {
      staticClass: "free-data-bar-progress",
      style: {
       width: _vm.blueBarStyle + "%"
      }
     }), _vm._v(" "), _c("div", {
      staticClass: "free-data-used-text"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("free_data_used", [ _vm.dataUsed ])) + "\n\t") ]), _vm._v(" "), _c("div", {
      staticClass: "free-data-allowed-text"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.dataAllowedText) + "\n\t") ]) ]);
    },
    staticRenderFns: []
   }, void 0, {
    props: {
     licenseInfo: Object
    },
    computed: {
     hasDataCap() {
      return this.licenseInfo && this.licenseInfo.dataCap;
     },
     renewIn() {
      if (!this.hasDataCap || "number" != typeof this.licenseInfo.dataCap.limitRenewalPeriod || "number" != typeof this.licenseInfo.creationTimestamp) return;
      const now = new Date, period = 86400 * this.licenseInfo.dataCap.limitRenewalPeriod, elapsed = (now.getTime() / 1e3 - this.licenseInfo.creationTimestamp) % period;
      return Math.round((period - elapsed) / 86400);
     },
     blueBarStyle() {
      if (!this.hasDataCap || "number" != typeof this.licenseInfo.dataCap.usedBytes || "number" != typeof this.licenseInfo.dataCap.limitBytes) return 0;
      return (100 * this.licenseInfo.dataCap.usedBytes / this.licenseInfo.dataCap.limitBytes).toString();
     },
     dataLimit() {
      return this.hasDataCap && "number" == typeof this.licenseInfo.dataCap.limitBytes ? this.formatBytes(this.licenseInfo.dataCap.limitBytes) : 0;
     },
     dataUsed() {
      return this.hasDataCap && "number" == typeof this.licenseInfo.dataCap.usedBytes ? this.formatBytes(this.licenseInfo.dataCap.usedBytes) : 0;
     },
     dataAllowedText() {
      if (!this.hasDataCap || "number" != typeof this.licenseInfo.dataCap.limitRenewalPeriod) return "";
      const text_id = "free_data_allowed_" + this.period(this.licenseInfo.dataCap.limitRenewalPeriod);
      return this.translatei18n(text_id, [ this.dataLimit ]);
     }
    },
    methods: {
     formatBytes(bytes) {
      if (0 === bytes) return "0 Bytes";
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + [ "Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB" ][i];
     },
     period: days => parseInt(days / 360) > 0 ? "year" : parseInt(days / 30) > 0 ? "month" : parseInt(days / 7) > 0 ? "week" : "day"
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   IpInfoBase: normalizeComponent({
    render: function() {
     var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
     return _c("div", {
      staticClass: "ip-info-container"
     }, [ _vm.connected ? _c("div", {
      staticClass: "ip-info-msg"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("ip_info_connected")) + "\n\t\t"), _c("img", {
      staticClass: "ip-info-image",
      attrs: {
       src: "/img/ipInfo.svg"
      },
      on: {
       mouseover: _vm.toggleTooltip,
       mouseleave: _vm.toggleTooltip
      }
     }) ]) : _c("div", {
      staticClass: "ip-info-msg"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("ip_info_disconnected")) + "\n\t") ]), _vm._v(" "), _c("div", {
      directives: [ {
       name: "show",
       rawName: "v-show",
       value: _vm.showFullInfo,
       expression: "showFullInfo"
      } ],
      staticClass: "ip-full-info",
      on: {
       mouseover: function($event) {
        _vm.showFullInfo = !0;
       },
       mouseleave: function($event) {
        _vm.showFullInfo = !1;
       }
      }
     }, [ _c("div", {
      staticClass: "ip-full-info-title"
     }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translatei18n("information")) + "\n\t\t") ]), _vm._v(" "), _c("div", {
      staticClass: "ip-full-info-texts"
     }, [ _vm.ipAddress ? _c("div", {
      staticClass: "ip-full-info-text"
     }, [ _vm._v("\n\t\t\t\t" + _vm._s(_vm.translatei18n("ip_address", [ _vm.ipAddress ])) + "\n\t\t\t") ]) : _vm._e(), _vm._v(" "), _vm.virtualIp ? _c("div", {
      staticClass: "ip-full-info-text"
     }, [ _vm._v("\n\t\t\t\t" + _vm._s(_vm.translatei18n("virtual_ip", [ _vm.virtualIp ])) + "\n\t\t\t") ]) : _vm._e(), _vm._v(" "), _vm.timeConnected ? _c("div", {
      staticClass: "ip-full-info-text"
     }, [ _vm._v("\n\t\t\t\t" + _vm._s(_vm.translatei18n("time_connected", [ _vm.timeConnected ])) + "\n\t\t\t") ]) : _vm._e(), _vm._v(" "), _vm.location ? _c("div", {
      staticClass: "ip-full-info-text"
     }, [ _vm._v("\n\t\t\t\t" + _vm._s(_vm.translatei18n("location", [ _vm.location ])) + "\n\t\t\t") ]) : _vm._e() ]) ]) ]);
    },
    staticRenderFns: []
   }, void 0, {
    props: {
     connected: Boolean,
     publicIpInfo: Object,
     connectionInfo: Object
    },
    data: () => ({
     showFullInfo: !1
    }),
    computed: {
     ipAddress() {
      return this.publicIpInfo && this.publicIpInfo.original && this.publicIpInfo.original.ip ? this.publicIpInfo.original.ip : "";
     },
     virtualIp() {
      return this.publicIpInfo && this.publicIpInfo.current && this.publicIpInfo.current.ip ? this.publicIpInfo.current.ip : "";
     },
     timeConnected() {
      if (!this.connectionInfo || !this.connectionInfo.connectedTime) return "00:00:00";
      let elapsed = new Date - 1e3 * this.connectionInfo.connectedTime;
      return new Date(elapsed).toISOString().substr(11, 8);
     },
     location() {
      return this.publicIpInfo && this.publicIpInfo.current ? this.publicIpInfo.current.country.name + ", " + this.publicIpInfo.current.city.name : "";
     }
    },
    methods: {
     toggleTooltip() {
      this.showFullInfo = !this.showFullInfo;
     }
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   UpgradePromotion: normalizeComponent({
    render: function() {
     var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
     return _c("div", {
      staticClass: "upgrade-promotion"
     }, [ _c("img", {
      staticClass: "upgrade-promotion-img",
      attrs: {
       src: "/img/upgrade.svg"
      }
     }), _vm._v(" "), _c("div", {
      staticClass: "upgrade-promotion-texts"
     }, [ _c("div", {
      staticClass: "upgrade-promotion-title"
     }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translatei18n("promotion_title")) + "\n\t\t") ]), _vm._v(" "), _c("div", {
      staticClass: "upgrade-promotion-text"
     }, [ _vm._v("\n\t\t\t" + _vm._s(_vm.translatei18n("promotion_text")) + "\n\t\t") ]) ]), _vm._v(" "), _c("button", {
      staticClass: "upgrade-promotion-button",
      on: {
       click: _vm.onBtnClicked
      }
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("promotion_button")) + "\n\t") ]) ]);
    },
    staticRenderFns: []
   }, void 0, {
    methods: {
     onBtnClicked() {
      sendActionToBg$1(vpnActions_showLicenseUpgradePage()), sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Cta));
     }
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0)
  },
  props: {
   bgState: Object,
   isAvastOne: Boolean,
   isLoading: Boolean
  },
  computed: {
   isConnected() {
    return this.bgState.vpn.vpnStatus === VpnStatus.Connected;
   },
   isDisabled() {
    return this.isLoading || this.bgState.vpn.vpnStatus === VpnStatus.Initializing;
   },
   hasDataCap() {
    return this.bgState.vpn.licenseInfo && this.bgState.vpn.licenseInfo.dataCap;
   },
   licenseInfo() {
    return this.bgState.vpn.licenseInfo;
   },
   isNotUsed() {
    return !!this.hasDataCap && 0 === this.bgState.vpn.licenseInfo.dataCap.usedBytes;
   },
   hasLimitReached() {
    return !!this.hasDataCap && this.bgState.vpn.licenseInfo.dataCap.usedBytes >= this.bgState.vpn.licenseInfo.dataCap.limitBytes;
   },
   showBottomPromotion() {
    return this.isAvastOne && this.hasDataCap && !this.hasLimitReached;
   },
   showToggle() {
    return !this.hasLimitReached;
   },
   showLocations() {
    return !this.isLoading && !this.hasDataCap;
   },
   showFreeData() {
    return this.isAvastOne && this.hasDataCap && !this.isNotUsed && !this.hasLimitReached;
   },
   publicIpInfo() {
    return this.bgState.vpn.publicIpInfo;
   },
   connectionInfo() {
    return this.bgState.vpn.connectionInfo;
   },
   dashboardActivePage() {
    let page = AsbActivePageTypes.None;
    return this.licenseInfo && this.licenseInfo.status === VpnLicenseStatus.Valid && this.licenseInfo.type === VpnLicenseType.Subscription ? page = AsbActivePageTypes.Paid : this.isNotUsed ? page = AsbActivePageTypes.FreeDataNotUsed : this.hasLimitReached ? page = AsbActivePageTypes.FreeDataUsed : this.showFreeData && (page = AsbActivePageTypes.FreeDataAvailable), 
    page !== AsbActivePageTypes.None && page !== this.bgState.vpn.lastActivePage && this.notifyDashboardPageChange(page), 
    page;
   }
  },
  methods: {
   notifyDashboardPageChange(newPage) {
    sendActionToBg$1(vpnActions_updateLastActivePage(newPage)), sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Page, AsbEventAction.None));
   }
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0);
 const __vue_component__$e = normalizeComponent({
  render: function() {
   var _h = this.$createElement, _c = this._self._c || _h;
   return _c("div", {
    staticClass: "wrapper"
   }, [ _c("error", {
    attrs: {
     "error-str-id": "something_is_not_right",
     "hide-button": !1,
     "button-str-id": "dismiss"
    },
    on: {
     "error-button-clicked": this.onBtnClicked
    }
   }) ], 1);
  },
  staticRenderFns: []
 }, void 0, {
  components: {
   Error: __vue_component__$3
  },
  methods: {
   onBtnClicked() {
    sendActionToBg$1(vpnActions_errorOccurred(null)), sendActionToBg$1(vpnActions_vpnApiReturnedError(null)), 
    sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Cta));
   }
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0);
 var buildTimeInfoData = {
  PRODUCT_ID: "AvastVpn"
 };
 let ProductId;
 !function(ProductId) {
  ProductId.AvastVpn = "AvastVpn", ProductId.AvastVpnStandalone = "AvastVpnStandalone", 
  ProductId.AvgVpn = "AvgVpn", ProductId.AvgVpnStandalone = "AvgVpnStandalone", ProductId.HmaProxy = "HmaProxy", 
  ProductId.Unknown = "Unknown";
 }(ProductId || (ProductId = {}));
 const buildTimeInfo = new class {
  constructor() {
   _defineProperty(this, "_shepherdId", void 0), _defineProperty(this, "_burgerId", void 0), 
   _defineProperty(this, "_productId", void 0), _defineProperty(this, "_productBrand", void 0);
   const shepherdId = buildTimeInfoData.SHEPHERD_ID, productId = buildTimeInfoData.PRODUCT_ID, burgerId = buildTimeInfoData.BURGER_ID;
   switch (this._shepherdId = Number.isInteger(shepherdId) ? shepherdId : null, this._burgerId = Number.isInteger(burgerId) ? burgerId : null, 
   this._productId = ProductId[productId] ? ProductId[productId] : ProductId.Unknown, 
   this._productId) {
   case ProductId.AvastVpn:
   case ProductId.AvastVpnStandalone:
    this._productBrand = "SecureLine";
    break;

   case ProductId.AvgVpn:
   case ProductId.AvgVpnStandalone:
    this._productBrand = "SecureVpn";
    break;

   default:
    this._productBrand = this._productId;
   }
  }
  get shepherdId() {
   return this._shepherdId;
  }
  get burgerId() {
   return this._burgerId;
  }
  get productId() {
   return this._productId;
  }
  get isProduction() {
   return !0;
  }
  get productBrand() {
   return this._productBrand;
  }
 };
 var script$f = {
  props: {
   isShowDashboard: Boolean,
   isAvastOne: Boolean
  },
  computed: {
   vpnProductInfoLink: () => VpnProductInstallationInfoLink[buildTimeInfo.productBrand]
  },
  methods: {
   onCloseClick() {
    sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Close)), 
    window.close();
   }
  }
 };
 function openUrlInNewTab(url) {
  chrome.tabs.create({
   url: url
  });
 }
 var script$g = {
  components: {
   Error: __vue_component__$3
  },
  props: {
   isAvast: Boolean
  },
  computed: {
   installVpnStrId: () => "SecureLine" === buildTimeInfo.productBrand ? "install_vpn_product_avast_one" : "install_vpn_product"
  },
  methods: {
   onBtnClicked() {
    openUrlInNewTab(VpnProductInstallationInfoLink[buildTimeInfo.productBrand]), sendActionToBg(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Cta));
   }
  }
 };
 var script$j = {
  components: {
   Error: __vue_component__$3
  },
  props: {
   isAvastOne: Boolean
  },
  computed: {
   reinstallVpnProductHelpPageUrl: () => VpnProductInstallationInfoLink[buildTimeInfo.productBrand],
   reinstallBrowserHelpPageUrl: () => SecureBrowserFaqLink[buildTimeInfo.productBrand],
   reinstallVpnStrId() {
    return this.isAvastOne ? "please_try_reinstalling_vpn_product_avast_one" : "please_try_reinstalling_vpn_product";
   },
   errorItems() {
    return Array({
     errorStrId: "something_is_not_right",
     link: "",
     linkStrId: ""
    }, {
     errorStrId: this.reinstallVpnStrId,
     link: this.reinstallVpnProductHelpPageUrl,
     linkStrId: "see_how"
    }, {
     errorStrId: "if_that_does_not_work_try_reinstalling_browser_product",
     link: this.reinstallBrowserHelpPageUrl,
     linkStrId: "see_how"
    });
   }
  }
 };
 var script$k = {
  components: {
   Error: __vue_component__$3
  },
  props: {
   isAvastOne: Boolean
  },
  computed: {
   restartStrId() {
    return this.isAvastOne ? "something_not_right_please_restart_avast_one" : "something_not_right_please_restart";
   }
  }
 };
 var script$n = {
  components: {
   Error: __vue_component__$3
  },
  props: {
   isAvastOne: Boolean
  },
  computed: {
   updateVpnStrId() {
    return this.isAvastOne ? "update_vpn_product_to_use_this_feature_avast_one" : "update_vpn_product_to_use_this_feature";
   }
  },
  methods: {
   onBtnClicked() {
    openUrlInNewTab(VpnProductDownloadLink[runtimeInfo.brand]);
   }
  }
 };
 var rootComponent, extraOptions;
 rootComponent = normalizeComponent({
  render: function() {
   var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
   return _c("div", {
    class: {
     "container-avast-one": _vm.isAvastOne,
     container: !_vm.isAvastOne
    },
    attrs: {
     page: _vm.popupActivePage
    }
   }, [ _c("HeaderBase", {
    attrs: {
     "is-avast-one": _vm.isAvastOne,
     "is-show-dashboard": _vm.isShowDashboard
    }
   }), _vm._v(" "), _vm.isConnectedToNetwork ? _vm.isErrorOccurred ? _c("ErrorBase") : _vm.isShowUpdateBrowser ? _c("UpdateBrowserBase") : _vm.isNativeMessagingHostFound ? _vm.isLoading ? _c("LoadingBase") : _vm.isExtensionOld ? _c("UpdateExtensionBase") : _vm.isVpnClientOld ? _c("UpdateVpnClientBase", {
    attrs: {
     "is-avast-one": _vm.isAvastOne
    }
   }) : _vm.isVpnLicenseActive ? _vm.isReinstallRequired ? _c("ReinstallBase", {
    attrs: {
     "is-avast-one": _vm.isAvastOne
    }
   }) : _vm.isRestartRequired ? _c("RestartBase", {
    attrs: {
     "is-avast-one": _vm.isAvastOne
    }
   }) : _c("DashboardBase", {
    attrs: {
     "bg-state": _vm.bgState,
     "is-avast-one": _vm.isAvastOne,
     "is-loading": _vm.isLoading
    }
   }) : _c("ActivateVpnLicenseBase", {
    attrs: {
     "is-avast-one": _vm.isAvastOne
    }
   }) : _c("InstallVpnClientBase") : _c("OfflineBase") ], 1);
  },
  staticRenderFns: []
 }, void 0, {
  components: {
   ActivateVpnLicenseBase: __vue_component__$4,
   DashboardBase: __vue_component__$d,
   ErrorBase: __vue_component__$e,
   HeaderBase: normalizeComponent({
    render: function() {
     var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
     return _c("header", {
      staticClass: "header"
     }, [ _c("div", {
      class: {
       "header-product-image-a1": _vm.isAvastOne,
       "header-product-image": !_vm.isAvastOne
      }
     }), _vm._v(" "), _vm.isAvastOne ? _vm._e() : _c("div", {
      staticClass: "header-product-name-text"
     }, [ _vm._v("\n\t\t" + _vm._s(_vm.translatei18n("product_name")) + "\n\t") ]), _vm._v(" "), _c("img", {
      staticClass: "header-close-image",
      attrs: {
       src: "/img/close.svg"
      },
      on: {
       click: _vm.onCloseClick
      }
     }) ]);
    },
    staticRenderFns: []
   }, void 0, script$f, void 0, !1, void 0, !1, void 0, void 0, void 0),
   InstallVpnClientBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-str-id": this.installVpnStrId,
       "hide-button": !1,
       "button-str-id": "learn_more"
      },
      on: {
       "error-button-clicked": this.onBtnClicked
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, script$g, void 0, !1, void 0, !1, void 0, void 0, void 0),
   LoadingBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-str-id": "loading",
       "hide-button": !0
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, {
    components: {
     Error: __vue_component__$3
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   OfflineBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-str-id": "make_sure_your_internet_connection_works_properly",
       "hide-button": !0
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, {
    components: {
     Error: __vue_component__$3
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   ReinstallBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-items": this.errorItems,
       "hide-button": !0
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, script$j, void 0, !1, void 0, !1, void 0, void 0, void 0),
   RestartBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-str-id": this.restartStrId,
       "hide-button": !0
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, script$k, void 0, !1, void 0, !1, void 0, void 0, void 0),
   UpdateBrowserBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-str-id": "update_browser_product_to_use_this_feature",
       "hide-button": !1,
       "button-str-id": "update_now"
      },
      on: {
       "error-button-clicked": this.onBtnClicked
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, {
    components: {
     Error: __vue_component__$3
    },
    methods: {
     onBtnClicked() {
      openUrlInNewTab("secure://settings/help"), sendActionToBg(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Cta));
     }
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   UpdateExtensionBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-str-id": "you_need_to_update_your_vpn_product_extension",
       "hide-button": !1,
       "button-str-id": "update_now"
      },
      on: {
       "error-button-clicked": this.onBtnClicked
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, {
    components: {
     Error: __vue_component__$3
    },
    methods: {
     onBtnClicked() {
      openUrlInNewTab("secure://extensions/?id=" + chrome.runtime.id), sendActionToBg(analyticsActions_asbTrack(AsbEventType.Click, AsbEventAction.Cta));
     }
    }
   }, void 0, !1, void 0, !1, void 0, void 0, void 0),
   UpdateVpnClientBase: normalizeComponent({
    render: function() {
     var _h = this.$createElement, _c = this._self._c || _h;
     return _c("div", {
      staticClass: "wrapper"
     }, [ _c("error", {
      attrs: {
       "error-str-id": this.updateVpnStrId,
       "hide-button": !1,
       "button-str-id": "update_now"
      },
      on: {
       "error-button-clicked": this.onBtnClicked
      }
     }) ], 1);
    },
    staticRenderFns: []
   }, void 0, script$n, void 0, !1, void 0, !1, void 0, void 0, void 0)
  },
  props: {
   bgState: Object
  },
  computed: {
   isConnectedToNetwork() {
    return this.bgState.vpn.isConnectedToNetwork;
   },
   isExtensionOld() {
    return this.bgState.vpn.apiCompatibility === ApiCompatibility.ExtensionOld;
   },
   isVpnClientOld() {
    return this.bgState.vpn.apiCompatibility === ApiCompatibility.VpnClientOld;
   },
   isShowUpdateBrowser() {
    return !!this.bgState.spc && !this.bgState.spc.isBrowserApiAvailable;
   },
   isNativeMessagingHostFound() {
    return this.bgState.vpn.isNativeMessagingHostFound;
   },
   isVpnLicenseActive() {
    return this.bgState.vpn.licenseInfo && this.bgState.vpn.licenseInfo.status === VpnLicenseStatus.Valid;
   },
   isReinstallRequired: () => !1,
   isRestartRequired: () => !1,
   isErrorOccurred() {
    return this.bgState.vpn.errorInfo || this.bgState.vpn.vpnApiError;
   },
   isShowDashboard() {
    return this.isConnectedToNetwork && !this.isExtensionOld && !this.isVpnClientOld && this.isBrowserApiAvailable && this.isNativeMessagingHostFound && this.isVpnLicenseActive && !this.isReinstallRequired && !this.isRestartRequired && !this.isErrorOccurred;
   },
   isLoading() {
    const somethingNotLoaded = !(this.bgState.vpn.licenseInfo && this.bgState.vpn.selectedGateway && this.bgState.vpn.optimalGateway && this.bgState.vpn.gateways.length);
    return !this.isErrorOccurred && somethingNotLoaded;
   },
   isAvastOne() {
    return this.bgState.vpn.isAvastOne;
   },
   popupActivePage() {
    let page = AsbActivePageTypes.None;
    return this.isConnectedToNetwork ? this.isErrorOccurred ? page = AsbActivePageTypes.General : this.isShowUpdateBrowser ? page = AsbActivePageTypes.UpdateBrowser : this.isNativeMessagingHostFound ? this.isLoading ? page = AsbActivePageTypes.Loading : this.isExtensionOld ? page = AsbActivePageTypes.UpdateExtension : this.isVpnClientOld ? page = AsbActivePageTypes.UpdateApp : this.isVpnLicenseActive ? this.isReinstallRequired ? page = AsbActivePageTypes.Reinstall : this.isRestartRequired && (page = AsbActivePageTypes.Restart) : page = AsbActivePageTypes.LicenseStatusNotValid : page = AsbActivePageTypes.InstallApp : page = AsbActivePageTypes.Offline, 
    page !== AsbActivePageTypes.None && page !== this.bgState.vpn.lastActivePage && this.notifyPopupPageChange(page), 
    page;
   }
  },
  methods: {
   notifyPopupPageChange(newPage) {
    sendActionToBg$1(vpnActions_updateLastActivePage(newPage)), sendActionToBg$1(analyticsActions_asbTrack(AsbEventType.Page, AsbEventAction.None));
   }
  }
 }, void 0, !1, void 0, !1, void 0, void 0, void 0), function() {
  const title = document.createElement("title");
  title.textContent = getMessage("product_name"), document.head.appendChild(title);
 }(), browserStorage.init().then(tabNavigation).then(connectToBackground).then(bgState => {
  initVue(bgState, rootComponent, extraOptions);
 });
}(Vue);
