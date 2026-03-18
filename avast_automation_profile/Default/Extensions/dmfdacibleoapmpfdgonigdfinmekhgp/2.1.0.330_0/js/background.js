!function() {
 "use strict";
 function createAction(type, value) {
  return void 0 === value ? {
   type: type
  } : {
   type: type,
   value: value
  };
 }
 let ProxyActionTypes, ProxyState, ChromeProxyConfigMode, IFirefoxProxyInfoType, UninstallTabType;
 function _defineProperty(obj, key, value) {
  return key in obj ? Object.defineProperty(obj, key, {
   value: value,
   enumerable: !0,
   configurable: !0,
   writable: !0
  }) : obj[key] = value, obj;
 }
 !function(ProxyActionTypes) {
  ProxyActionTypes.IsAvailableChange = "proxy.isAvailable", ProxyActionTypes.StateChange = "proxy.stateChange", 
  ProxyActionTypes.SelectedLocationChange = "proxy.selectedLocationChange", ProxyActionTypes.Connect = "proxy.connect", 
  ProxyActionTypes.Disconnect = "proxy.disconnect", ProxyActionTypes.CredentialsConfigInvalid = "proxy.credentialsConfigInvalid", 
  ProxyActionTypes.CredentialsConfigReceived = "proxy.credentialsConfigReceived", 
  ProxyActionTypes.LocationsConfigReceived = "proxy.locationsConfigReceived", ProxyActionTypes.AutoConnectEnabledChange = "proxy.autoConnectEnabledChange", 
  ProxyActionTypes.AutoConnectSiteAdd = "proxy.autoConnectSiteAdd", ProxyActionTypes.AutoConnectSiteRemove = "proxy.autoConnectSiteRemove", 
  ProxyActionTypes.AutoConnectSiteChange = "proxy.autoConnectSiteChange", ProxyActionTypes.DisableConflictingExtensions = "proxy.disableConflictingExtensions", 
  ProxyActionTypes.GetState = "proxy.getState", ProxyActionTypes.GetProductInfo = "proxy.getProductInfo";
 }(ProxyActionTypes || (ProxyActionTypes = {})), function(ProxyState) {
  ProxyState.Connecting = "connecting", ProxyState.Connected = "connected", ProxyState.Disconnected = "disconnected", 
  ProxyState.Disconnecting = "disconnecting";
 }(ProxyState || (ProxyState = {})), function(ChromeProxyConfigMode) {
  ChromeProxyConfigMode.FixedServers = "fixed_servers", ChromeProxyConfigMode.PacScript = "pac_script", 
  ChromeProxyConfigMode.Direct = "direct";
 }(ChromeProxyConfigMode || (ChromeProxyConfigMode = {})), function(IFirefoxProxyInfoType) {
  IFirefoxProxyInfoType.Direct = "direct", IFirefoxProxyInfoType.Https = "https";
 }(IFirefoxProxyInfoType || (IFirefoxProxyInfoType = {})), function(UninstallTabType) {
  UninstallTabType.Ga = "ga", UninstallTabType.Burger = "burger";
 }(UninstallTabType || (UninstallTabType = {}));
 var commonjsGlobal = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
 function unwrapExports(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x.default : x;
 }
 function createCommonjsModule(fn, module) {
  return fn(module = {
   exports: {}
  }, module.exports), module.exports;
 }
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
 }, browser = createCommonjsModule((function(module, exports) {
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
 browser.formatArgs, browser.save, browser.load, browser.useColors, browser.storage, 
 browser.destroy, browser.colors, browser.log;
 const log = browser("runtimeInfo");
 let OperatingSystem, PlatformArchitecture, Browser;
 !function(OperatingSystem) {
  OperatingSystem.Win = "win", OperatingSystem.Mac = "mac", OperatingSystem.Unknown = "unknown";
 }(OperatingSystem || (OperatingSystem = {})), function(PlatformArchitecture) {
  PlatformArchitecture.Arm = "arm", PlatformArchitecture.X86 = "x86-32", PlatformArchitecture.X64 = "x86-64", 
  PlatformArchitecture.Unknown = "unknown";
 }(PlatformArchitecture || (PlatformArchitecture = {})), function(Browser) {
  Browser.Chrome = "chrome", Browser.Firefox = "firefox", Browser.Other = "other";
 }(Browser || (Browser = {}));
 const runtimeInfo = new class {
  constructor(manifest) {
   _defineProperty(this, "_brand", void 0), _defineProperty(this, "_extensionId", void 0), 
   _defineProperty(this, "_extensionVersion", void 0), _defineProperty(this, "_permissions", void 0), 
   _defineProperty(this, "_optionalPermissions", void 0), _defineProperty(this, "_contentScriptPaths", void 0), 
   _defineProperty(this, "_browser", void 0), _defineProperty(this, "_name", void 0), 
   _defineProperty(this, "_shortName", void 0), _defineProperty(this, "_platformInfoResolvedCallbacks", void 0), 
   _defineProperty(this, "_os", void 0), _defineProperty(this, "_arch", void 0), manifest.short_name || log("short_name not defined in manifest"), 
   this._brand = manifest.short_name, this._extensionId = chrome.i18n.getMessage("@@extension_id"), 
   this._extensionVersion = manifest.version, this._permissions = manifest.permissions, 
   this._optionalPermissions = manifest.optional_permissions || [], this._name = manifest.name, 
   this._shortName = manifest.short_name, this._contentScriptPaths = this.extractPathsFromContentScripts(manifest.content_scripts), 
   this._platformInfoResolvedCallbacks = [], navigator.userAgent.includes("Chrome") ? this._browser = Browser.Chrome : navigator.userAgent.includes("Firefox") ? this._browser = Browser.Firefox : this._browser = Browser.Other, 
   log("extension version: %s", this._extensionVersion);
  }
  get brand() {
   if (!this._brand) throw new Error("Invalid runtime info brand value.");
   return this._brand;
  }
  get extensionId() {
   return this._extensionId;
  }
  get extensionVersion() {
   return this._extensionVersion;
  }
  get permissions() {
   return this._permissions;
  }
  get optionalPermissions() {
   return this._optionalPermissions;
  }
  get contentScriptPaths() {
   return this._contentScriptPaths;
  }
  get os() {
   switch (this._os) {
   case OperatingSystem.Mac:
   case OperatingSystem.Win:
    return this._os;

   default:
    return OperatingSystem.Unknown;
   }
  }
  get arch() {
   switch (this._arch) {
   case PlatformArchitecture.Arm:
   case PlatformArchitecture.X86:
   case PlatformArchitecture.X64:
    return this._arch;

   default:
    return PlatformArchitecture.Unknown;
   }
  }
  get browser() {
   return this._browser;
  }
  get name() {
   return this._name;
  }
  get shortName() {
   return this._shortName;
  }
  handleGetPlatformInfo(platformInfo) {
   if (platformInfo) for (this._os = platformInfo.os, this._arch = platformInfo.arch; this._platformInfoResolvedCallbacks.length; ) this._platformInfoResolvedCallbacks.pop()();
  }
  addPlatformInfoResolvedCallback(callback) {
   this._platformInfoResolvedCallbacks.push(callback);
  }
  extractPathsFromContentScripts(contentScripts) {
   if (!contentScripts) return [];
   const paths = contentScripts.reduce((function(result, contentScript) {
    return contentScript.js.forEach(path => {
     const components = path.split("/");
     result.add(components[components.length - 1]);
    }), result;
   }), new Set);
   return Array.from(paths);
  }
 }(chrome.runtime.getManifest());
 let ShepherdActionTypes, GlobalActionTypes;
 chrome.runtime.getPlatformInfo(runtimeInfo.handleGetPlatformInfo.bind(runtimeInfo)), 
 function(ShepherdActionTypes) {
  ShepherdActionTypes.ConfigReceived = "shepherd.configReceived";
 }(ShepherdActionTypes || (ShepherdActionTypes = {})), function(GlobalActionTypes) {
  GlobalActionTypes.Startup = "startup", GlobalActionTypes.GetState = "getState", 
  GlobalActionTypes.StateChange = "stateChange", GlobalActionTypes.Installed = "installed", 
  GlobalActionTypes.Updated = "updated";
 }(GlobalActionTypes || (GlobalActionTypes = {}));
 const globalActions_installed = () => createAction(GlobalActionTypes.Installed), globalActions_startup = () => createAction(GlobalActionTypes.Startup), globalActions_updated = previousVersion => createAction(GlobalActionTypes.Updated, {
  previousVersion: previousVersion
 });
 let EventCategory, EventAction, EventLabel, ScreenView, AsbEventType, AsbActivePageTypes, AsbEventAction, AsbEventPage, AsbEventCategory, UserConsentSource;
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
 }(UserConsentSource || (UserConsentSource = {}));
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
 }(VpnApiErrorType || (VpnApiErrorType = {}));
 class NativeMessagingHostNotFoundError extends Error {
  constructor(...params) {
   super(...params), Error.captureStackTrace && Error.captureStackTrace(this, NativeMessagingHostNotFoundError);
  }
 }
 class NativeMessagingError extends Error {
  constructor(...params) {
   super(...params), Error.captureStackTrace && Error.captureStackTrace(this, NativeMessagingError);
  }
 }
 class ObjectValidationError extends Error {
  constructor(...params) {
   super(...params), Error.captureStackTrace && Error.captureStackTrace(this, ObjectValidationError);
  }
 }
 function getApiVersionAction() {
  return "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.GetApiVersion : SecureVpnVpnAction.GetApiVersion;
 }
 function getGetStateAction() {
  return "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.GetState : SecureVpnVpnAction.GetState;
 }
 function getGetOptimalGatewayAction() {
  return "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.GetOptimalGateway : SecureVpnVpnAction.GetOptimalGateway;
 }
 function getGetProductInfoAction() {
  return "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.GetProductInfo : SecureVpnVpnAction.GetProductInfo;
 }
 !function(AvastOneAction) {
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
 const analyticsActions_createSession = () => createAction(AnalyticsActionTypes.CreateSession), analyticsActions_heartbeatTracked = () => createAction(AnalyticsActionTypes.HeartbeatTracked), analyticsActions_uninstallUrlDirty = () => createAction(AnalyticsActionTypes.UninstallUrlDirty);
 function createAnalyticsActionGenerator(analytics) {
  const generators = {};
  return generators[GlobalActionTypes.Startup] = dispatch => {
   analytics.init(), analytics.setUpOrTearDown(), dispatch(analyticsActions_createSession()), 
   dispatch(analyticsActions_uninstallUrlDirty());
  }, generators[GlobalActionTypes.GetState] = dispatch => {
   dispatch(analyticsActions_createSession());
  }, generators[GlobalActionTypes.Installed] = () => {
   analytics.trackLifecycleEvent(EventAction.Installation), analytics.refreshClientCountryCode();
  }, generators[GlobalActionTypes.Updated] = () => {
   analytics.trackLifecycleEvent(EventAction.Update);
  }, generators[ShepherdActionTypes.ConfigReceived] = dispatch => {
   analytics.setUpOrTearDown(), dispatch(analyticsActions_uninstallUrlDirty());
  }, generators[ProxyActionTypes.StateChange] = (dispatch, getState, action) => {
   action.value === ProxyState.Disconnected && analytics.refreshClientCountryCode();
  }, generators[AnalyticsActionTypes.TrackEvent] = (dispatch, getState, action) => {
   analytics.trackEvent(action.value.category, action.value.action, action.value.label, action.value.view);
  }, generators[AnalyticsActionTypes.TrackInstall] = () => {
   analytics.trackLifecycleEvent(EventAction.Installation);
  }, generators[AnalyticsActionTypes.TrackView] = (dispatch, getState, action) => {
   analytics.trackView(action.value.view, action.value.label);
  }, generators[AnalyticsActionTypes.UninstallUrlDirty] = () => {
   analytics.updateUninstallUrl();
  }, generators[AnalyticsActionTypes.AnalyticsUserConsent] = () => {
   analytics.setUpOrTearDown();
  }, generators[AnalyticsActionTypes.UserConsentChange] = dispatch => {
   analytics.setUpOrTearDown(), dispatch(analyticsActions_uninstallUrlDirty());
  }, generators[AnalyticsActionTypes.AsbTrack] = (dispatch, getState, action) => {
   const categoryPage = function(page) {
    switch (page) {
    case AsbActivePageTypes.FreeDataAvailable:
     return {
      category: AsbEventCategory.Upsell,
      page: AsbEventPage.FreeDataAvailablePage
     };

    case AsbActivePageTypes.FreeDataNotUsed:
     return {
      category: AsbEventCategory.Upsell,
      page: AsbEventPage.FreeDataNotUsedPage
     };

    case AsbActivePageTypes.FreeDataUsed:
     return {
      category: AsbEventCategory.Upsell,
      page: AsbEventPage.FreeDataUsedPage
     };

    case AsbActivePageTypes.Paid:
     return {
      category: AsbEventCategory.Paid,
      page: AsbEventPage.PaidPage
     };

    case AsbActivePageTypes.Offline:
     return {
      category: AsbEventCategory.OfflineError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.General:
     return {
      category: AsbEventCategory.GeneralError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.UpdateBrowser:
     return {
      category: AsbEventCategory.UpdateBrowserError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.InstallApp:
     return {
      category: AsbEventCategory.InstallAppError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.Loading:
     return {
      category: AsbEventCategory.LoadingError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.UpdateExtension:
     return {
      category: AsbEventCategory.UpdateExtensionError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.UpdateApp:
     return {
      category: AsbEventCategory.UpdateAppError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.LicenseStatusNotValid:
     return {
      category: AsbEventCategory.LicenseStatusNotValidError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.Reinstall:
     return {
      category: AsbEventCategory.ReinstallError,
      page: AsbEventPage.ErrorPage
     };

    case AsbActivePageTypes.Restart:
     return {
      category: AsbEventCategory.RestartError,
      page: AsbEventPage.ErrorPage
     };
    }
    return {
     category: AsbEventCategory.None,
     page: AsbEventPage.None
    };
   }(getState().vpn.lastActivePage), edition = getState().vpn.vpnClientApiEdition, data = {
    event_action: action.value.action,
    event_category: categoryPage.category,
    event_value: edition ? edition.toString() : "",
    "group.extension.id": runtimeInfo.extensionId,
    "group.extension.version": runtimeInfo.extensionVersion,
    "group.page.page_name": categoryPage.page,
    page_domain: "vpn-extension",
    page_location: "secure://vpn-extension"
   };
   analytics.asbTrack(action.value.type, data);
  }, generators;
 }
 function shallowCopy(original, ...mutations) {
  return Object.assign.apply(this, [].concat({}, original, ...mutations));
 }
 function randHex(digits) {
  let r = "";
  for (;digits-- > 0; ) r += Math.floor(16 * Math.random()).toString(16);
  return r;
 }
 function analyticsReducer(state, action) {
  switch (state = void 0 === state ? {} : state, action.type) {
  case GlobalActionTypes.Updated:
   return shallowCopy(state, {
    currentVersion: runtimeInfo.extensionVersion,
    updateTime: Date.now()
   });

  case AnalyticsActionTypes.HeartbeatTracked:
   return shallowCopy(state, {
    lastHeartbeat: Date.now()
   });

  case AnalyticsActionTypes.ClientCountryCodeChange:
   return shallowCopy(state, {
    clientCountryCode: action.value
   });

  case AnalyticsActionTypes.CreateSession:
   return shallowCopy(state, {
    sessionId: randHex(24),
    sessionStart: Date.now()
   });

  case AnalyticsActionTypes.UserConsentChange:
   return shallowCopy(state, {
    userConsent: action.value,
    userConsentSource: UserConsentSource.User
   });
  }
  return state;
 }
 const initialAnalyticsState = {
  guid: randHex(8) + "-" + randHex(4) + "-" + randHex(4) + "-" + randHex(4) + "-" + randHex(12),
  installationTime: Date.now(),
  installationVersion: runtimeInfo.extensionVersion,
  updateTime: null,
  currentVersion: runtimeInfo.extensionVersion,
  currentVersionBuild: Number(runtimeInfo.extensionVersion.split(".").pop()),
  lastHeartbeat: 0,
  clientCountryCode: null,
  sessionId: null,
  sessionStart: null,
  startupTime: Date.now(),
  userConsent: null,
  userConsentSource: null
 }, analyticsPersistedPaths = [ "guid", "installationTime", "installationVersion", "updateTime", "currentVersion", "lastHeartbeat", "clientCountryCode", "userConsent", "userConsentSource" ];
 const dispatcher = new class {
  constructor() {
   _defineProperty(this, "store", void 0);
  }
  setStore(store) {
   this.store = store;
  }
  dispatch(action) {
   return this.store.dispatch(action);
  }
  getState() {
   return this.store.getState();
  }
 };
 function addUtmParams(link, params) {
  const source = runtimeInfo.browser === Browser.Firefox ? "extension_firefox" : "extension_chrome", url = new URL(link);
  return url.searchParams.append("utm_medium", "prg_link"), url.searchParams.append("utm_source", source), 
  url.searchParams.append("utm_campaign", params.campaign), params.content && url.searchParams.append("utm_content", params.content), 
  params.term && url.searchParams.append("utm_term", params.term), params.otherParams && Object.keys(params.otherParams).forEach(key => {
   url.searchParams.append(key, params.otherParams[key]);
  }), url.href;
 }
 const log$1 = browser("analytics");
 class Analytics {
  init() {
   log$1("initializing"), chrome.alarms && (chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this)), 
   chrome.alarms.create(Analytics.alarmName, {
    periodInMinutes: Analytics.alarmInterval
   })), window.addEventListener("online", this.handleConnectivityChange.bind(this));
  }
  updateUninstallUrl() {
   const state = dispatcher.getState();
   if (!state.shepherd || !state.shepherd.config) return void log$1("not updating uninstall url, no shepherd config");
   const campaign = state.shepherd.config.analytics.utmCampaignUninstall || state.shepherd.config.analytics.utmCampaign, url = state.shepherd.config.analytics.uninstallUrl;
   if (!url) return void log$1("not updating uninstall url, analytics.uninstallUrl not set in shepherd config");
   let urlWithParams = addUtmParams(url, {
    campaign: campaign,
    otherParams: this.getParamsForUninstallUrl()
   });
   urlWithParams.length > 255 && (urlWithParams = addUtmParams(url, {
    campaign: campaign
   }), log$1("uninstall url too long, stripping otherParams")), log$1("updating uninstall url: %s (%d)", urlWithParams, urlWithParams.length), 
   chrome.runtime.setUninstallURL(urlWithParams);
  }
  trackHeartbeat() {
   dispatcher.dispatch(analyticsActions_heartbeatTracked());
  }
  trackHeartbeatIfNecessary() {
   log$1("checking if heartbeat should be tracked");
   const state = dispatcher.getState(), now = Date.now(), intervalMilliseconds = 60 * state.shepherd.config.analytics.heartbeatIntervalHours * 60 * 1e3;
   state.analytics.lastHeartbeat + intervalMilliseconds > now || this.trackHeartbeat();
  }
  handleAlarm(alarm) {
   alarm.name === Analytics.alarmName && this.trackHeartbeatIfNecessary();
  }
  handleConnectivityChange() {
   this.trackHeartbeatIfNecessary(), this.refreshClientCountryCode();
  }
 }
 _defineProperty(Analytics, "alarmName", "analytics/heartbeat"), _defineProperty(Analytics, "alarmInterval", 15);
 const log$2 = browser("analytics/asb");
 class AnalyticsAsb extends Analytics {
  constructor() {
   super();
  }
  asbTrack(eventType, data) {
   AnalyticsAsb.asbTrackingAvailable && (eventType === AsbEventType.Page ? chrome.avast.stats.add(chrome.avast.stats.EventType.PAGE, data) : eventType === AsbEventType.Click && chrome.avast.stats.add(chrome.avast.stats.EventType.CLICK, data));
  }
  async setUpOrTearDown() {
   log$2("setUpOrTearDown Method not implemented.");
  }
  trackView(view) {
   log$2("trackView Method not implemented.");
  }
  trackEvent(category, action, label) {
   log$2("trackView Method not implemented.");
  }
  trackLifecycleEvent(action) {
   log$2("trackLifecycleEvent Method not implemented.");
  }
  trackHeartbeat() {
   log$2("trackHeartbeat Method not implemented.");
  }
  async refreshClientCountryCode() {
   log$2("refreshClientCountryCode Method not implemented.");
  }
  getParamsForUninstallUrl() {
   log$2("getParamsForUninstallUrl Method not implemented.");
  }
 }
 _defineProperty(AnalyticsAsb, "asbTrackingAvailable", !(!chrome.avast || !chrome.avast.stats) || !1);
 const log$3 = browser("browserStorage");
 var isArray = Array.isArray, keyList = Object.keys, hasProp = Object.prototype.hasOwnProperty, fastDeepEqual = function equal(a, b) {
  if (a === b) return !0;
  if (a && b && "object" == typeof a && "object" == typeof b) {
   var i, length, key, arrA = isArray(a), arrB = isArray(b);
   if (arrA && arrB) {
    if ((length = a.length) != b.length) return !1;
    for (i = length; 0 != i--; ) if (!equal(a[i], b[i])) return !1;
    return !0;
   }
   if (arrA != arrB) return !1;
   var dateA = a instanceof Date, dateB = b instanceof Date;
   if (dateA != dateB) return !1;
   if (dateA && dateB) return a.getTime() == b.getTime();
   var regexpA = a instanceof RegExp, regexpB = b instanceof RegExp;
   if (regexpA != regexpB) return !1;
   if (regexpA && regexpB) return a.toString() == b.toString();
   var keys = keyList(a);
   if ((length = keys.length) !== keyList(b).length) return !1;
   for (i = length; 0 != i--; ) if (!hasProp.call(b, keys[i])) return !1;
   for (i = length; 0 != i--; ) if (!equal(a[key = keys[i]], b[key])) return !1;
   return !0;
  }
  return a != a && b != b;
 };
 const log$4 = browser("statePersist");
 class StatePersist {
  constructor(browserStorage, pathMap) {
   _defineProperty(this, "browserStorage", void 0), _defineProperty(this, "paths", void 0);
   const paths = [];
   Object.keys(pathMap).forEach((function(key) {
    pathMap[key].forEach((function(path) {
     path.includes(".") ? log$4("no support for persisting nested properties: %s:%s", key, path) : paths.push({
      root: key,
      subpath: path
     });
    }));
   })), this.browserStorage = browserStorage, this.paths = paths;
  }
  load() {
   const stored = this.browserStorage.get("_state");
   return stored || null;
  }
  clear() {
   this.browserStorage.set("_state", null);
  }
  buildMiddleware() {
   let previousState = null;
   return ref => next => action => {
    let toPersist;
    const nextAction = next(action), nextState = ref.getState();
    return nextState !== previousState && (toPersist = this.paths.reduce((result, path) => (result[path.root] = result[path.root] || {}, 
    result[path.root][path.subpath] = nextState[path.root][path.subpath], result), {})), 
    previousState = nextState, !toPersist || fastDeepEqual(this.browserStorage.get("_state"), toPersist) || this.browserStorage.set("_state", toPersist), 
    nextAction;
   };
  }
 }
 function _defineProperty$1(obj, key, value) {
  return key in obj ? Object.defineProperty(obj, key, {
   value: value,
   enumerable: !0,
   configurable: !0,
   writable: !0
  }) : obj[key] = value, obj;
 }
 function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
   var symbols = Object.getOwnPropertySymbols(object);
   enumerableOnly && (symbols = symbols.filter((function(sym) {
    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
   }))), keys.push.apply(keys, symbols);
  }
  return keys;
 }
 function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
   var source = null != arguments[i] ? arguments[i] : {};
   i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
    _defineProperty$1(target, key, source[key]);
   })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
   }));
  }
  return target;
 }
 function formatProdErrorMessage(code) {
  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or use the non-minified dev environment for full errors. ";
 }
 var $$observable = "function" == typeof Symbol && Symbol.observable || "@@observable", randomString = function() {
  return Math.random().toString(36).substring(7).split("").join(".");
 }, ActionTypes = {
  INIT: "@@redux/INIT" + randomString(),
  REPLACE: "@@redux/REPLACE" + randomString(),
  PROBE_UNKNOWN_ACTION: function() {
   return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
  }
 };
 function isPlainObject(obj) {
  if ("object" != typeof obj || null === obj) return !1;
  for (var proto = obj; null !== Object.getPrototypeOf(proto); ) proto = Object.getPrototypeOf(proto);
  return Object.getPrototypeOf(obj) === proto;
 }
 function createStore(reducer, preloadedState, enhancer) {
  var _ref2;
  if ("function" == typeof preloadedState && "function" == typeof enhancer || "function" == typeof enhancer && "function" == typeof arguments[3]) throw new Error(formatProdErrorMessage(0));
  if ("function" == typeof preloadedState && void 0 === enhancer && (enhancer = preloadedState, 
  preloadedState = void 0), void 0 !== enhancer) {
   if ("function" != typeof enhancer) throw new Error(formatProdErrorMessage(1));
   return enhancer(createStore)(reducer, preloadedState);
  }
  if ("function" != typeof reducer) throw new Error(formatProdErrorMessage(2));
  var currentReducer = reducer, currentState = preloadedState, currentListeners = [], nextListeners = currentListeners, isDispatching = !1;
  function ensureCanMutateNextListeners() {
   nextListeners === currentListeners && (nextListeners = currentListeners.slice());
  }
  function getState() {
   if (isDispatching) throw new Error(formatProdErrorMessage(3));
   return currentState;
  }
  function subscribe(listener) {
   if ("function" != typeof listener) throw new Error(formatProdErrorMessage(4));
   if (isDispatching) throw new Error(formatProdErrorMessage(5));
   var isSubscribed = !0;
   return ensureCanMutateNextListeners(), nextListeners.push(listener), function() {
    if (isSubscribed) {
     if (isDispatching) throw new Error(formatProdErrorMessage(6));
     isSubscribed = !1, ensureCanMutateNextListeners();
     var index = nextListeners.indexOf(listener);
     nextListeners.splice(index, 1), currentListeners = null;
    }
   };
  }
  function dispatch(action) {
   if (!isPlainObject(action)) throw new Error(formatProdErrorMessage(7));
   if (void 0 === action.type) throw new Error(formatProdErrorMessage(8));
   if (isDispatching) throw new Error(formatProdErrorMessage(9));
   try {
    isDispatching = !0, currentState = currentReducer(currentState, action);
   } finally {
    isDispatching = !1;
   }
   for (var listeners = currentListeners = nextListeners, i = 0; i < listeners.length; i++) {
    (0, listeners[i])();
   }
   return action;
  }
  function replaceReducer(nextReducer) {
   if ("function" != typeof nextReducer) throw new Error(formatProdErrorMessage(10));
   currentReducer = nextReducer, dispatch({
    type: ActionTypes.REPLACE
   });
  }
  function observable() {
   var _ref, outerSubscribe = subscribe;
   return (_ref = {
    subscribe: function(observer) {
     if ("object" != typeof observer || null === observer) throw new Error(formatProdErrorMessage(11));
     function observeState() {
      observer.next && observer.next(getState());
     }
     return observeState(), {
      unsubscribe: outerSubscribe(observeState)
     };
    }
   })[$$observable] = function() {
    return this;
   }, _ref;
  }
  return dispatch({
   type: ActionTypes.INIT
  }), (_ref2 = {
   dispatch: dispatch,
   subscribe: subscribe,
   getState: getState,
   replaceReducer: replaceReducer
  })[$$observable] = observable, _ref2;
 }
 function combineReducers(reducers) {
  for (var reducerKeys = Object.keys(reducers), finalReducers = {}, i = 0; i < reducerKeys.length; i++) {
   var key = reducerKeys[i];
   "function" == typeof reducers[key] && (finalReducers[key] = reducers[key]);
  }
  var shapeAssertionError, finalReducerKeys = Object.keys(finalReducers);
  try {
   !function(reducers) {
    Object.keys(reducers).forEach((function(key) {
     var reducer = reducers[key];
     if (void 0 === reducer(void 0, {
      type: ActionTypes.INIT
     })) throw new Error(formatProdErrorMessage(12));
     if (void 0 === reducer(void 0, {
      type: ActionTypes.PROBE_UNKNOWN_ACTION()
     })) throw new Error(formatProdErrorMessage(13));
    }));
   }(finalReducers);
  } catch (e) {
   shapeAssertionError = e;
  }
  return function(state, action) {
   if (void 0 === state && (state = {}), shapeAssertionError) throw shapeAssertionError;
   for (var hasChanged = !1, nextState = {}, _i = 0; _i < finalReducerKeys.length; _i++) {
    var _key = finalReducerKeys[_i], reducer = finalReducers[_key], previousStateForKey = state[_key], nextStateForKey = reducer(previousStateForKey, action);
    if (void 0 === nextStateForKey) {
     action && action.type;
     throw new Error(formatProdErrorMessage(14));
    }
    nextState[_key] = nextStateForKey, hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
   }
   return (hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length) ? nextState : state;
  };
 }
 function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) funcs[_key] = arguments[_key];
  return 0 === funcs.length ? function(arg) {
   return arg;
  } : 1 === funcs.length ? funcs[0] : funcs.reduce((function(a, b) {
   return function() {
    return a(b.apply(void 0, arguments));
   };
  }));
 }
 function applyMiddleware() {
  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) middlewares[_key] = arguments[_key];
  return function(createStore) {
   return function() {
    var store = createStore.apply(void 0, arguments), _dispatch = function() {
     throw new Error(formatProdErrorMessage(15));
    }, middlewareAPI = {
     getState: store.getState,
     dispatch: function() {
      return _dispatch.apply(void 0, arguments);
     }
    }, chain = middlewares.map((function(middleware) {
     return middleware(middlewareAPI);
    }));
    return _dispatch = compose.apply(void 0, chain)(store.dispatch), _objectSpread2(_objectSpread2({}, store), {}, {
     dispatch: _dispatch
    });
   };
  };
 }
 var helpers = createCommonjsModule((function(module, exports) {
  Object.defineProperty(exports, "__esModule", {
   value: !0
  });
  var repeat = exports.repeat = function(str, times) {
   return new Array(times + 1).join(str);
  }, pad = exports.pad = function(num, maxLength) {
   return repeat("0", maxLength - num.toString().length) + num;
  };
  exports.formatTime = function(time) {
   return pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
  }, exports.timer = "undefined" != typeof performance && null !== performance && "function" == typeof performance.now ? performance : Date;
 }));
 unwrapExports(helpers);
 helpers.repeat, helpers.pad, helpers.formatTime, helpers.timer;
 var deepDiff = createCommonjsModule((function(module, exports) {
  module.exports = function(undefined$1) {
   var $scope, conflict, conflictResolution = [];
   function inherits(ctor, superCtor) {
    ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
     constructor: {
      value: ctor,
      enumerable: !1,
      writable: !0,
      configurable: !0
     }
    });
   }
   function Diff(kind, path) {
    Object.defineProperty(this, "kind", {
     value: kind,
     enumerable: !0
    }), path && path.length && Object.defineProperty(this, "path", {
     value: path,
     enumerable: !0
    });
   }
   function DiffEdit(path, origin, value) {
    DiffEdit.super_.call(this, "E", path), Object.defineProperty(this, "lhs", {
     value: origin,
     enumerable: !0
    }), Object.defineProperty(this, "rhs", {
     value: value,
     enumerable: !0
    });
   }
   function DiffNew(path, value) {
    DiffNew.super_.call(this, "N", path), Object.defineProperty(this, "rhs", {
     value: value,
     enumerable: !0
    });
   }
   function DiffDeleted(path, value) {
    DiffDeleted.super_.call(this, "D", path), Object.defineProperty(this, "lhs", {
     value: value,
     enumerable: !0
    });
   }
   function DiffArray(path, index, item) {
    DiffArray.super_.call(this, "A", path), Object.defineProperty(this, "index", {
     value: index,
     enumerable: !0
    }), Object.defineProperty(this, "item", {
     value: item,
     enumerable: !0
    });
   }
   function arrayRemove(arr, from, to) {
    var rest = arr.slice((to || from) + 1 || arr.length);
    return arr.length = from < 0 ? arr.length + from : from, arr.push.apply(arr, rest), 
    arr;
   }
   function realTypeOf(subject) {
    var type = typeof subject;
    return "object" !== type ? type : subject === Math ? "math" : null === subject ? "null" : Array.isArray(subject) ? "array" : "[object Date]" === Object.prototype.toString.call(subject) ? "date" : void 0 !== subject.toString && /^\/.*\//.test(subject.toString()) ? "regexp" : "object";
   }
   function deepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
    var currentPath = (path = path || []).slice(0);
    if (void 0 !== key) {
     if (prefilter) {
      if ("function" == typeof prefilter && prefilter(currentPath, key)) return;
      if ("object" == typeof prefilter) {
       if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) return;
       if (prefilter.normalize) {
        var alt = prefilter.normalize(currentPath, key, lhs, rhs);
        alt && (lhs = alt[0], rhs = alt[1]);
       }
      }
     }
     currentPath.push(key);
    }
    "regexp" === realTypeOf(lhs) && "regexp" === realTypeOf(rhs) && (lhs = lhs.toString(), 
    rhs = rhs.toString());
    var ltype = typeof lhs, rtype = typeof rhs;
    if ("undefined" === ltype) "undefined" !== rtype && changes(new DiffNew(currentPath, rhs)); else if ("undefined" === rtype) changes(new DiffDeleted(currentPath, lhs)); else if (realTypeOf(lhs) !== realTypeOf(rhs)) changes(new DiffEdit(currentPath, lhs, rhs)); else if ("[object Date]" === Object.prototype.toString.call(lhs) && "[object Date]" === Object.prototype.toString.call(rhs) && lhs - rhs != 0) changes(new DiffEdit(currentPath, lhs, rhs)); else if ("object" === ltype && null !== lhs && null !== rhs) {
     if ((stack = stack || []).indexOf(lhs) < 0) {
      if (stack.push(lhs), Array.isArray(lhs)) {
       var i;
       for (lhs.length, i = 0; i < lhs.length; i++) i >= rhs.length ? changes(new DiffArray(currentPath, i, new DiffDeleted(undefined$1, lhs[i]))) : deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack);
       for (;i < rhs.length; ) changes(new DiffArray(currentPath, i, new DiffNew(undefined$1, rhs[i++])));
      } else {
       var akeys = Object.keys(lhs), pkeys = Object.keys(rhs);
       akeys.forEach((function(k, i) {
        var other = pkeys.indexOf(k);
        other >= 0 ? (deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack), 
        pkeys = arrayRemove(pkeys, other)) : deepDiff(lhs[k], undefined$1, changes, prefilter, currentPath, k, stack);
       })), pkeys.forEach((function(k) {
        deepDiff(undefined$1, rhs[k], changes, prefilter, currentPath, k, stack);
       }));
      }
      stack.length = stack.length - 1;
     }
    } else lhs !== rhs && ("number" === ltype && isNaN(lhs) && isNaN(rhs) || changes(new DiffEdit(currentPath, lhs, rhs)));
   }
   function accumulateDiff(lhs, rhs, prefilter, accum) {
    return accum = accum || [], deepDiff(lhs, rhs, (function(diff) {
     diff && accum.push(diff);
    }), prefilter), accum.length ? accum : undefined$1;
   }
   function applyChange(target, source, change) {
    if (target && source && change && change.kind) {
     for (var it = target, i = -1, last = change.path ? change.path.length - 1 : 0; ++i < last; ) void 0 === it[change.path[i]] && (it[change.path[i]] = "number" == typeof change.path[i] ? [] : {}), 
     it = it[change.path[i]];
     switch (change.kind) {
     case "A":
      !function applyArrayChange(arr, index, change) {
       if (change.path && change.path.length) {
        var i, it = arr[index], u = change.path.length - 1;
        for (i = 0; i < u; i++) it = it[change.path[i]];
        switch (change.kind) {
        case "A":
         applyArrayChange(it[change.path[i]], change.index, change.item);
         break;

        case "D":
         delete it[change.path[i]];
         break;

        case "E":
        case "N":
         it[change.path[i]] = change.rhs;
        }
       } else switch (change.kind) {
       case "A":
        applyArrayChange(arr[index], change.index, change.item);
        break;

       case "D":
        arr = arrayRemove(arr, index);
        break;

       case "E":
       case "N":
        arr[index] = change.rhs;
       }
       return arr;
      }(change.path ? it[change.path[i]] : it, change.index, change.item);
      break;

     case "D":
      delete it[change.path[i]];
      break;

     case "E":
     case "N":
      it[change.path[i]] = change.rhs;
     }
    }
   }
   return $scope = "object" == typeof commonjsGlobal && commonjsGlobal ? commonjsGlobal : "undefined" != typeof window ? window : {}, 
   (conflict = $scope.DeepDiff) && conflictResolution.push((function() {
    void 0 !== conflict && $scope.DeepDiff === accumulateDiff && ($scope.DeepDiff = conflict, 
    conflict = undefined$1);
   })), inherits(DiffEdit, Diff), inherits(DiffNew, Diff), inherits(DiffDeleted, Diff), 
   inherits(DiffArray, Diff), Object.defineProperties(accumulateDiff, {
    diff: {
     value: accumulateDiff,
     enumerable: !0
    },
    observableDiff: {
     value: deepDiff,
     enumerable: !0
    },
    applyDiff: {
     value: function(target, source, filter) {
      if (target && source) {
       deepDiff(target, source, (function(change) {
        filter && !filter(target, source, change) || applyChange(target, source, change);
       }));
      }
     },
     enumerable: !0
    },
    applyChange: {
     value: applyChange,
     enumerable: !0
    },
    revertChange: {
     value: function(target, source, change) {
      if (target && source && change && change.kind) {
       var i, u, it = target;
       for (u = change.path.length - 1, i = 0; i < u; i++) void 0 === it[change.path[i]] && (it[change.path[i]] = {}), 
       it = it[change.path[i]];
       switch (change.kind) {
       case "A":
        !function revertArrayChange(arr, index, change) {
         if (change.path && change.path.length) {
          var i, it = arr[index], u = change.path.length - 1;
          for (i = 0; i < u; i++) it = it[change.path[i]];
          switch (change.kind) {
          case "A":
           revertArrayChange(it[change.path[i]], change.index, change.item);
           break;

          case "D":
          case "E":
           it[change.path[i]] = change.lhs;
           break;

          case "N":
           delete it[change.path[i]];
          }
         } else switch (change.kind) {
         case "A":
          revertArrayChange(arr[index], change.index, change.item);
          break;

         case "D":
         case "E":
          arr[index] = change.lhs;
          break;

         case "N":
          arr = arrayRemove(arr, index);
         }
         return arr;
        }(it[change.path[i]], change.index, change.item);
        break;

       case "D":
       case "E":
        it[change.path[i]] = change.lhs;
        break;

       case "N":
        delete it[change.path[i]];
       }
      }
     },
     enumerable: !0
    },
    isConflict: {
     value: function() {
      return void 0 !== conflict;
     },
     enumerable: !0
    },
    noConflict: {
     value: function() {
      return conflictResolution && (conflictResolution.forEach((function(it) {
       it();
      })), conflictResolution = null), accumulateDiff;
     },
     enumerable: !0
    }
   }), accumulateDiff;
  }();
 })), diff = createCommonjsModule((function(module, exports) {
  Object.defineProperty(exports, "__esModule", {
   value: !0
  }), exports.default = function(prevState, newState, logger, isCollapsed) {
   var diff = (0, _deepDiff2.default)(prevState, newState);
   try {
    isCollapsed ? logger.groupCollapsed("diff") : logger.group("diff");
   } catch (e) {
    logger.log("diff");
   }
   diff ? diff.forEach((function(elem) {
    var kind = elem.kind, output = function(diff) {
     var kind = diff.kind, path = diff.path, lhs = diff.lhs, rhs = diff.rhs, index = diff.index, item = diff.item;
     switch (kind) {
     case "E":
      return [ path.join("."), lhs, "→", rhs ];

     case "N":
      return [ path.join("."), rhs ];

     case "D":
      return [ path.join(".") ];

     case "A":
      return [ path.join(".") + "[" + index + "]", item ];

     default:
      return [];
     }
    }(elem);
    logger.log.apply(logger, [ "%c " + dictionary[kind].text, style(kind) ].concat(function(arr) {
     if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
      return arr2;
     }
     return Array.from(arr);
    }(output)));
   })) : logger.log("—— no diff ——");
   try {
    logger.groupEnd();
   } catch (e) {
    logger.log("—— diff end —— ");
   }
  };
  var obj, _deepDiff2 = (obj = deepDiff) && obj.__esModule ? obj : {
   default: obj
  };
  var dictionary = {
   E: {
    color: "#2196F3",
    text: "CHANGED:"
   },
   N: {
    color: "#4CAF50",
    text: "ADDED:"
   },
   D: {
    color: "#F44336",
    text: "DELETED:"
   },
   A: {
    color: "#2196F3",
    text: "ARRAY:"
   }
  };
  function style(kind) {
   return "color: " + dictionary[kind].color + "; font-weight: bold";
  }
  module.exports = exports.default;
 }));
 unwrapExports(diff);
 var core = createCommonjsModule((function(module, exports) {
  Object.defineProperty(exports, "__esModule", {
   value: !0
  });
  var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
   return typeof obj;
  } : function(obj) {
   return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };
  exports.printBuffer = function(buffer, options) {
   var logger = options.logger, actionTransformer = options.actionTransformer, _options$titleFormatt = options.titleFormatter, titleFormatter = void 0 === _options$titleFormatt ? function(options) {
    var timestamp = options.timestamp, duration = options.duration;
    return function(action, time, took) {
     var parts = [ "action" ];
     return parts.push("%c" + String(action.type)), timestamp && parts.push("%c@ " + time), 
     duration && parts.push("%c(in " + took.toFixed(2) + " ms)"), parts.join(" ");
    };
   }(options) : _options$titleFormatt, collapsed = options.collapsed, colors = options.colors, level = options.level, diff = options.diff, isUsingDefaultFormatter = void 0 === options.titleFormatter;
   buffer.forEach((function(logEntry, key) {
    var started = logEntry.started, startedTime = logEntry.startedTime, action = logEntry.action, prevState = logEntry.prevState, error = logEntry.error, took = logEntry.took, nextState = logEntry.nextState, nextEntry = buffer[key + 1];
    nextEntry && (nextState = nextEntry.prevState, took = nextEntry.started - started);
    var formattedAction = actionTransformer(action), isCollapsed = "function" == typeof collapsed ? collapsed((function() {
     return nextState;
    }), action, logEntry) : collapsed, formattedTime = (0, helpers.formatTime)(startedTime), titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : "", headerCSS = [ "color: gray; font-weight: lighter;" ];
    headerCSS.push(titleCSS), options.timestamp && headerCSS.push("color: gray; font-weight: lighter;"), 
    options.duration && headerCSS.push("color: gray; font-weight: lighter;");
    var title = titleFormatter(formattedAction, formattedTime, took);
    try {
     isCollapsed ? colors.title && isUsingDefaultFormatter ? logger.groupCollapsed.apply(logger, [ "%c " + title ].concat(headerCSS)) : logger.groupCollapsed(title) : colors.title && isUsingDefaultFormatter ? logger.group.apply(logger, [ "%c " + title ].concat(headerCSS)) : logger.group(title);
    } catch (e) {
     logger.log(title);
    }
    var prevStateLevel = getLogLevel(level, formattedAction, [ prevState ], "prevState"), actionLevel = getLogLevel(level, formattedAction, [ formattedAction ], "action"), errorLevel = getLogLevel(level, formattedAction, [ error, prevState ], "error"), nextStateLevel = getLogLevel(level, formattedAction, [ nextState ], "nextState");
    prevStateLevel && (colors.prevState ? logger[prevStateLevel]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState) : logger[prevStateLevel]("prev state", prevState)), 
    actionLevel && (colors.action ? logger[actionLevel]("%c action    ", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction) : logger[actionLevel]("action    ", formattedAction)), 
    error && errorLevel && (colors.error ? logger[errorLevel]("%c error     ", "color: " + colors.error(error, prevState) + "; font-weight: bold;", error) : logger[errorLevel]("error     ", error)), 
    nextStateLevel && (colors.nextState ? logger[nextStateLevel]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState) : logger[nextStateLevel]("next state", nextState)), 
    diff && (0, _diff2.default)(prevState, nextState, logger, isCollapsed);
    try {
     logger.groupEnd();
    } catch (e) {
     logger.log("—— log end ——");
    }
   }));
  };
  var obj, _diff2 = (obj = diff) && obj.__esModule ? obj : {
   default: obj
  };
  function getLogLevel(level, action, payload, type) {
   switch (void 0 === level ? "undefined" : _typeof(level)) {
   case "object":
    return "function" == typeof level[type] ? level[type].apply(level, function(arr) {
     if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
      return arr2;
     }
     return Array.from(arr);
    }(payload)) : level[type];

   case "function":
    return level(action);

   default:
    return level;
   }
  }
 }));
 unwrapExports(core);
 core.printBuffer;
 var defaults = createCommonjsModule((function(module, exports) {
  Object.defineProperty(exports, "__esModule", {
   value: !0
  }), exports.default = {
   level: "log",
   logger: console,
   logErrors: !0,
   collapsed: void 0,
   predicate: void 0,
   duration: !1,
   timestamp: !0,
   stateTransformer: function(state) {
    return state;
   },
   actionTransformer: function(action) {
    return action;
   },
   errorTransformer: function(error) {
    return error;
   },
   colors: {
    title: function() {
     return "inherit";
    },
    prevState: function() {
     return "#9E9E9E";
    },
    action: function() {
     return "#03A9F4";
    },
    nextState: function() {
     return "#4CAF50";
    },
    error: function() {
     return "#F20404";
    }
   },
   diff: !1,
   diffPredicate: void 0,
   transformer: void 0
  }, module.exports = exports.default;
 }));
 unwrapExports(defaults);
 var lib = createCommonjsModule((function(module, exports) {
  Object.defineProperty(exports, "__esModule", {
   value: !0
  }), exports.logger = exports.createLogger = exports.defaults = void 0;
  var obj, _extends = Object.assign || function(target) {
   for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
   }
   return target;
  }, _defaults2 = (obj = defaults) && obj.__esModule ? obj : {
   default: obj
  };
  function createLogger() {
   var options = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, loggerOptions = _extends({}, _defaults2.default, options), logger = loggerOptions.logger, stateTransformer = loggerOptions.stateTransformer, errorTransformer = loggerOptions.errorTransformer, predicate = loggerOptions.predicate, logErrors = loggerOptions.logErrors, diffPredicate = loggerOptions.diffPredicate;
   if (void 0 === logger) return function() {
    return function(next) {
     return function(action) {
      return next(action);
     };
    };
   };
   if (options.getState && options.dispatch) return console.error("[redux-logger] redux-logger not installed. Make sure to pass logger instance as middleware:\n// Logger with default options\nimport { logger } from 'redux-logger'\nconst store = createStore(\n  reducer,\n  applyMiddleware(logger)\n)\n// Or you can create your own logger with custom options http://bit.ly/redux-logger-options\nimport createLogger from 'redux-logger'\nconst logger = createLogger({\n  // ...options\n});\nconst store = createStore(\n  reducer,\n  applyMiddleware(logger)\n)\n"), 
   function() {
    return function(next) {
     return function(action) {
      return next(action);
     };
    };
   };
   var logBuffer = [];
   return function(_ref) {
    var getState = _ref.getState;
    return function(next) {
     return function(action) {
      if ("function" == typeof predicate && !predicate(getState, action)) return next(action);
      var logEntry = {};
      logBuffer.push(logEntry), logEntry.started = helpers.timer.now(), logEntry.startedTime = new Date, 
      logEntry.prevState = stateTransformer(getState()), logEntry.action = action;
      var returnedValue = void 0;
      if (logErrors) try {
       returnedValue = next(action);
      } catch (e) {
       logEntry.error = errorTransformer(e);
      } else returnedValue = next(action);
      logEntry.took = helpers.timer.now() - logEntry.started, logEntry.nextState = stateTransformer(getState());
      var diff = loggerOptions.diff && "function" == typeof diffPredicate ? diffPredicate(getState, action) : loggerOptions.diff;
      if ((0, core.printBuffer)(logBuffer, _extends({}, loggerOptions, {
       diff: diff
      })), logBuffer.length = 0, logEntry.error) throw logEntry.error;
      return returnedValue;
     };
    };
   };
  }
  var defaultLogger = function() {
   var _ref2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, dispatch = _ref2.dispatch, getState = _ref2.getState;
   if ("function" == typeof dispatch || "function" == typeof getState) return createLogger()({
    dispatch: dispatch,
    getState: getState
   });
   console.error("\n[redux-logger v3] BREAKING CHANGE\n[redux-logger v3] Since 3.0.0 redux-logger exports by default logger with default settings.\n[redux-logger v3] Change\n[redux-logger v3] import createLogger from 'redux-logger'\n[redux-logger v3] to\n[redux-logger v3] import { createLogger } from 'redux-logger'\n");
  };
  exports.defaults = _defaults2.default, exports.createLogger = createLogger, exports.logger = defaultLogger, 
  exports.default = defaultLogger;
 }));
 unwrapExports(lib);
 lib.logger;
 var lib_2 = lib.createLogger, onStateChange = (lib.defaults, unwrapExports(createCommonjsModule((function(module, exports) {
  Object.defineProperty(exports, "__esModule", {
   value: !0
  }), exports.default = function(fn) {
   return function(store) {
    return function(next) {
     return function(action) {
      var prevState = store.getState(), result = next(action), nextState = store.getState();
      return fn(prevState, nextState, action, store.dispatch, store), result;
     };
    };
   };
  };
 }))));
 const log$5 = browser("store");
 function onStateChangeHandler(prevState, nextState) {
  fastDeepEqual(prevState, nextState) || chrome.runtime.sendMessage({
   type: GlobalActionTypes.StateChange,
   value: {
    state: nextState
   }
  }, (function() {
   chrome.runtime.lastError;
  }));
 }
 function createStore$1(reducers, generators, initialState, persist) {
  const middleware = generators.map(g => {
   return actionHandlers = g, function(ref) {
    const dispatch = ref.dispatch, getState = ref.getState;
    return function(next) {
     return function(action) {
      const nextState = next(action), handler = actionHandlers[action.type];
      return handler && handler.call(actionHandlers, dispatch, getState, action), nextState;
     };
    };
   };
   var actionHandlers;
  }).concat([ onStateChange(onStateChangeHandler), log$5.enabled && lib_2({
   diff: !0,
   predicate: (getState, action) => (action.type || console.error("unknown action type", action), 
   !action.type.includes("getState")),
   collapsed: () => !0,
   duration: !0,
   timestamp: !0
  }), persist && persist.buildMiddleware() ]).filter(m => m);
  return createStore(combineReducers(reducers), initialState, applyMiddleware.apply(null, middleware));
 }
 "undefined" != typeof chrome && void 0 !== chrome.runtime || (window.chrome = window.browser);
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
    chrome.runtime.lastError && log$3('could not remove key "%s" from browser storage (%O)', path, chrome.runtime.lastError);
   }), delete this.cache[path]) : (this.usingStorage && chrome.storage.local.set({
    [path]: value
   }, () => {
    chrome.runtime.lastError && log$3('could not set key "%s" in browser storage (%O)', path, chrome.runtime.lastError);
   }), this.cache[path] = value);
  }
 }, log$6 = browser("bgLdr");
 browser("features");
 let Feature, VpnActionTypes;
 !function(Feature) {
  Feature.Proxy = "proxy", Feature.Vpn = "vpn", Feature.WebRtc = "webRtc", Feature.TabKiller = "tabKiller", 
  Feature.Shepherd = "shepherd", Feature.Analytics = "analytics", Feature.Spc = "spc", 
  Feature.Notifications = "notifications", Feature.Account = "account";
 }(Feature || (Feature = {})), function(VpnActionTypes) {
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
 const vpnActions_activeGatewayUpdated = value => createAction(VpnActionTypes.ActiveGatewayUpdated, value), vpnActions_addNotification = value => createAction(VpnActionTypes.AddNotification, value), vpnActions_apiCompatibilityResolved = value => createAction(VpnActionTypes.ApiCompatibilityResolved, value), vpnActions_connect = () => createAction(VpnActionTypes.Connect), vpnActions_connectionInfoUpdated = value => createAction(VpnActionTypes.ConnectionInfoUpdated, value), vpnActions_disconnect = () => createAction(VpnActionTypes.Disconnect), vpnActions_errorOccurred = value => createAction(VpnActionTypes.ErrorOccurred, value), vpnActions_gatewaySelected = value => createAction(VpnActionTypes.SelectGateway, value), vpnActions_gatewaysUpdated = value => createAction(VpnActionTypes.GatewaysUpdated, value), vpnActions_handleNetworkConnectivityChange = value => createAction(VpnActionTypes.HandleNetworkConnectivityChange, value), vpnActions_ipAddressChanged = value => createAction(VpnActionTypes.IpAddressChanged, value), vpnActions_lastErrorUpdated = value => createAction(VpnActionTypes.LastErrorUpdated, value), vpnActions_licenseInfoUpdated = value => createAction(VpnActionTypes.LicenseInfoUpdated, value), vpnActions_optimalGatewayUpdated = value => createAction(VpnActionTypes.OptimalGatewayUpdated, value), vpnActions_productInfoUpdated = value => createAction(VpnActionTypes.ProductInfoUpdated, value), vpnActions_publicIpChanged = value => createAction(VpnActionTypes.PublicIpChanged, value), vpnActions_publicIpInfoUpdated = value => createAction(VpnActionTypes.PublicIpInfoUpdated, value), vpnActions_removeNotification = value => createAction(VpnActionTypes.RemoveNotification, value), vpnActions_setIsAvastOne = value => createAction(VpnActionTypes.SetIsAvastOne, value), vpnActions_setIsInitialized = value => createAction(VpnActionTypes.SetIsInitialized, value), vpnActions_setNativeMessagingHostFound = value => createAction(VpnActionTypes.SetNativeMessagingHostFound, value), vpnActions_showLicenseUpgradePage = () => createAction(VpnActionTypes.ShowLicenseUpgradePage), vpnActions_statusUpdated = value => createAction(VpnActionTypes.VpnStatusUpdated, value), vpnActions_updateReconnectingToAnotherGatewayStatus = value => createAction(VpnActionTypes.ReconnectingToAnotherGatewayStatusChanged, value), vpnActions_vpnApiReturnedError = value => createAction(VpnActionTypes.VpnApiReturnedError, value), vpnActions_vpnClientApiEditionUpdated = value => createAction(VpnActionTypes.VpnClientApiEditionUpdated, value), vpnActions_vpnClientApiVersionUpdated = value => createAction(VpnActionTypes.VpnClientApiVersionUpdated, value);
 function createSpcActionGenerator(spc) {
  const generator = {};
  function action() {
   spc.updateSpcState();
  }
  return generator[GlobalActionTypes.Startup] = () => {
   spc.init();
  }, generator[VpnActionTypes.VpnStatusUpdated] = action, generator[VpnActionTypes.OptimalGatewayUpdated] = action, 
  generator[VpnActionTypes.HandleNetworkConnectivityChange] = action, generator[VpnActionTypes.GatewaysUpdated] = action, 
  generator[VpnActionTypes.LicenseInfoUpdated] = action, generator[VpnActionTypes.SetNativeMessagingHostFound] = action, 
  generator[VpnActionTypes.ApiCompatibilityResolved] = action, generator[VpnActionTypes.ErrorOccurred] = action, 
  generator[VpnActionTypes.VpnApiReturnedError] = action, generator[VpnActionTypes.SetIsAvastOne] = action, 
  generator[VpnActionTypes.SelectGateway] = (dispatch, getState) => {
   getState().spc.location.id !== getState().spc.selectedGatewayId && action();
  }, generator;
 }
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
 let ShortcutKeyModifier, SafePage, TextDirection, languageCode;
 !function(ShortcutKeyModifier) {
  ShortcutKeyModifier.None = "none", ShortcutKeyModifier.Alt = "alt", ShortcutKeyModifier.Meta = "meta", 
  ShortcutKeyModifier.Ctrl = "ctrl", ShortcutKeyModifier.Shift = "shift";
 }(ShortcutKeyModifier || (ShortcutKeyModifier = {})), function(SafePage) {
  SafePage.Blank = "blank", SafePage.NewTab = "newTab";
 }(SafePage || (SafePage = {})), function(TextDirection) {
  TextDirection.Ltr = "ltr", TextDirection.Rtl = "rtl";
 }(TextDirection || (TextDirection = {}));
 let precompiledLocale = {};
 function getMessage(messageName, messageFormatParams) {
  return precompiledLocale[messageName] ? precompiledLocale[messageName](messageFormatParams || {}) : chrome.i18n.getMessage(messageName);
 }
 function getLanguage() {
  return (languageCode || chrome.i18n.getUILanguage()).split("_")[0];
 }
 languageCode = getMessage("language_code").replace("-", "_"), languageCode && allPrecompiledLocales && allPrecompiledLocales[languageCode] && (precompiledLocale = allPrecompiledLocales[languageCode]);
 let SpcActionTypes;
 !function(SpcActionTypes) {
  SpcActionTypes.SetBrowserApiAvailability = "spc.setBrowserApiAvailability", SpcActionTypes.SetSelectedGatewayId = "spc.SetSelectedGatewayId";
 }(SpcActionTypes || (SpcActionTypes = {}));
 const spcActions_setBrowserApiAvailability = value => createAction(SpcActionTypes.SetBrowserApiAvailability, value), spcActions_setSelectedGatewayId = value => createAction(SpcActionTypes.SetSelectedGatewayId, value);
 let ExtensionCallerMethodName$1, ErrorMessage;
 function spcReducer(state, action) {
  switch (state = void 0 === state ? {} : state, action.type) {
  case SpcActionTypes.SetBrowserApiAvailability:
   return shallowCopy(state, {
    isBrowserApiAvailable: action.value
   });

  case SpcActionTypes.SetSelectedGatewayId:
   return shallowCopy(state, {
    selectedGatewayId: action.value
   });

  case VpnActionTypes.ApiCompatibilityResolved:
   let errorMessage;
   const apiCompatibility = action.value;
   return apiCompatibility === ApiCompatibility.ExtensionOld ? errorMessage = ErrorMessage.UpdateExtension : apiCompatibility === ApiCompatibility.VpnClientOld && (errorMessage = ErrorMessage.UpdateVpnClient), 
   shallowCopy(state, {
    error: errorMessage
   });

  case VpnActionTypes.OptimalGatewayUpdated:
   {
    const optimalGateway = action.value, optimalSpcGateway = {
     spcVpnLocation: optimalGatewayToSpcVpnLocation(optimalGateway),
     id: optimalGateway.id
    };
    let locations = [];
    return optimalSpcGateway && "optimal_unknown" === optimalSpcGateway.id && locations.push(optimalSpcGateway), 
    locations = locations.concat(state.locations.map(spcGateway => {
     let spcVpnLocation;
     return spcVpnLocation = spcGateway.id === optimalGateway.id ? function(optimalGateway) {
      const spcVpnLocation = {
       name: "",
       value: ""
      };
      optimalGateway && ("optimal_unknown" === optimalGateway.id ? (spcVpnLocation.name = optimalGateway.spcVpnLocation.name, 
      spcVpnLocation.value = optimalGateway.spcVpnLocation.value) : (spcVpnLocation.name = getMessage("optimal_location") + " (" + optimalGateway.spcVpnLocation.name + ")", 
      spcVpnLocation.value = "optimal_" + optimalGateway.spcVpnLocation.value));
      return spcVpnLocation;
     }(spcGateway) : spcGateway.spcVpnLocation, {
      spcVpnLocation: spcVpnLocation,
      id: spcGateway.id
     };
    })), shallowCopy(state, {
     locations: locations,
     optimalLocation: optimalSpcGateway
    });
   }

  case VpnActionTypes.GatewaysUpdated:
   {
    let locations = [];
    const optimalSpcGateway = state.optimalLocation;
    return optimalSpcGateway && "optimal_unknown" === optimalSpcGateway.id && locations.push(optimalSpcGateway), 
    locations = locations.concat(action.value.map(gw => {
     let spcVpnLocation;
     return spcVpnLocation = state.optimalLocation && gw.id === state.optimalLocation.id ? optimalGatewayToSpcVpnLocation(gw) : gatewayToSpcVpnLocation(gw), 
     {
      spcVpnLocation: spcVpnLocation,
      id: gw.id
     };
    })), shallowCopy(state, {
     locations: locations
    });
   }

  case VpnActionTypes.LicenseInfoUpdated:
   return shallowCopy(state, {
    expiresIn: getDaysTillExpiry(action.value),
    licenseStatus: action.value.status,
    licenseType: action.value.type
   });

  case VpnActionTypes.VpnStatusUpdated:
   return shallowCopy(state, {
    active: (vpnStatus = action.value, vpnStatus === VpnStatus.Connecting || vpnStatus === VpnStatus.Reconnecting || vpnStatus === VpnStatus.Connected)
   });

  case VpnActionTypes.SelectGateway:
   {
    const gateway = action.value;
    let spcVpnLocation;
    spcVpnLocation = state.optimalLocation && gateway.id === state.optimalLocation.id ? optimalGatewayToSpcVpnLocation(gateway) : gatewayToSpcVpnLocation(gateway);
    const selectedGateway = {
     spcVpnLocation: spcVpnLocation,
     id: gateway.id
    };
    return shallowCopy(state, {
     location: selectedGateway
    });
   }

  case VpnActionTypes.HandleNetworkConnectivityChange:
   return shallowCopy(state, {
    error: action.value ? null : ErrorMessage.Offline
   });

  case VpnActionTypes.SetNativeMessagingHostFound:
   return shallowCopy(state, {
    error: action.value ? null : ErrorMessage.InstallVpnClient
   });

  case VpnActionTypes.ErrorOccurred:
  case VpnActionTypes.VpnApiReturnedError:
   return shallowCopy(state, {
    error: action.value ? ErrorMessage.VpnClientError : null
   });

  case VpnActionTypes.SetIsAvastOne:
   return shallowCopy(state, {
    appName: action.value ? "AvastOne" : "SecureLine",
    isAvastOne: action.value
   });
  }
  var vpnStatus;
  return state;
 }
 function getDaysTillExpiry(licenseInfo) {
  let expiresIn;
  if (licenseInfo.status === VpnLicenseStatus.Valid) {
   if (licenseInfo.type === VpnLicenseType.Trial) {
    const currentUnixTimestamp = Math.floor(Date.now() / 1e3);
    expiresIn = Math.floor((licenseInfo.expirationTimestamp - currentUnixTimestamp) / 60 / 60 / 24);
   }
  } else expiresIn = licenseInfo.status === VpnLicenseStatus.Expired ? 0 : -1;
  return expiresIn;
 }
 function gatewayToSpcVpnLocation(gateway) {
  const spcVpnLocation = {
   name: "",
   value: ""
  };
  return gateway && (spcVpnLocation.name = getLocationNameBase(gateway), spcVpnLocation.value = getLocationValueBase(gateway)), 
  spcVpnLocation;
 }
 function optimalGatewayToSpcVpnLocation(optimalGateway) {
  const spcVpnLocation = {
   name: "",
   value: ""
  };
  if (optimalGateway) if ("optimal_unknown" === optimalGateway.id) spcVpnLocation.name = getMessage("optimal_location"), 
  spcVpnLocation.value = "optimal_optimal_unknown"; else {
   const locationNameBase = getLocationNameBase(optimalGateway), locationValueBase = getLocationValueBase(optimalGateway);
   spcVpnLocation.name = getMessage("optimal_location") + " (" + locationNameBase + ")", 
   spcVpnLocation.value = "optimal_" + locationValueBase;
  }
  return spcVpnLocation;
 }
 function getLocationNameBase(gateway) {
  return gateway.city.name + ", " + gateway.country.name;
 }
 function getLocationValueBase(gateway) {
  return gateway.country.id + "_" + gateway.city.name;
 }
 !function(ExtensionCallerMethodName) {
  ExtensionCallerMethodName.SetState = "setState", ExtensionCallerMethodName.GetState = "getState", 
  ExtensionCallerMethodName.UpgradeNow = "upgradeNow";
 }(ExtensionCallerMethodName$1 || (ExtensionCallerMethodName$1 = {})), function(ErrorMessage) {
  ErrorMessage.InstallVpnClient = "install_vpn_client", ErrorMessage.UpdateExtension = "update_extension", 
  ErrorMessage.UpdateVpnClient = "update_vpn_client", ErrorMessage.ReinstallVpnClient = "reinstall_vpn_client", 
  ErrorMessage.ReinstallBrowser = "reinstall_browser", ErrorMessage.Offline = "offline", 
  ErrorMessage.VpnClientError = "vpn_client_error";
 }(ErrorMessage || (ErrorMessage = {}));
 const log$8 = browser("spc");
 class Spc {
  constructor() {
   _defineProperty(this, "_secureBrowserApi", void 0);
  }
  static getSecureBrowserApi() {
   let secureBrowserApi;
   return "SecureVpn" === runtimeInfo.brand ? secureBrowserApi = chrome.avg : "SecureLine" === runtimeInfo.brand && (secureBrowserApi = chrome.avast), 
   secureBrowserApi;
  }
  init() {
   log$8("Spc.init()");
   const isBrowserApiAvailable = this.verifyBrowserApiAvailability();
   dispatcher.dispatch(spcActions_setBrowserApiAvailability(isBrowserApiAvailable)), 
   isBrowserApiAvailable && (this._secureBrowserApi = Spc.getSecureBrowserApi(), this._secureBrowserApi.onExtensionCall.addListener(this.onExtensionCall.bind(this)));
  }
  updateSpcState(includeLocations = !0) {
   const state = dispatcher.getState().spc, spcVpnState = {
    active: state.active,
    location: state.location ? state.location.spcVpnLocation : null,
    locations: null,
    expires_in: state.expiresIn,
    error: state.error,
    app_name: state.appName,
    license_type: state.licenseType,
    license_status: state.licenseStatus
   };
   void 0 === spcVpnState.expires_in && delete spcVpnState.expires_in, spcVpnState.error || delete spcVpnState.error, 
   includeLocations ? spcVpnState.locations = state.locations.map(loc => loc.spcVpnLocation) : delete spcVpnState.locations, 
   log$8("Vpn.updateSpcState(): Sending state %O", spcVpnState), this._secureBrowserApi.browserCall("spc", "state", spcVpnState);
  }
  verifyBrowserApiAvailability() {
   let isApiAvailable = !1;
   const createErrorMessage = apiName => `ERROR: ${apiName} is not defined`;
   let secureBrowserApi, secureBrowserApiName;
   return "SecureVpn" === runtimeInfo.brand ? (secureBrowserApi = chrome.avg, secureBrowserApiName = "chrome.avg") : "SecureLine" === runtimeInfo.brand && (secureBrowserApi = chrome.avast, 
   secureBrowserApiName = "chrome.avast"), "object" != typeof secureBrowserApi ? log$8(createErrorMessage(secureBrowserApiName)) : "function" != typeof secureBrowserApi.browserCall ? log$8(createErrorMessage(secureBrowserApiName + ".browserCall")) : "object" != typeof secureBrowserApi.onExtensionCall ? log$8(createErrorMessage(secureBrowserApiName + ".onExtensionCall")) : "function" != typeof secureBrowserApi.onExtensionCall.addListener ? log$8(createErrorMessage(secureBrowserApiName + ".onExtensionCall.addListener")) : "SecureLine" === runtimeInfo.brand && "function" != typeof secureBrowserApi.checkAVInstalled ? log$8(createErrorMessage(secureBrowserApiName + ".checkAVInstalled")) : isApiAvailable = !0, 
   isApiAvailable;
  }
  onExtensionCall(caller, methodName, args) {
   if (log$8("Vpn.onExtensionCall(): caller = %O, method = %O, args = %O", caller, methodName, args), 
   "spc" !== caller.browserPartId) return;
   const state = dispatcher.getState();
   switch (methodName) {
   case ExtensionCallerMethodName$1.SetState:
    if (args.active) dispatcher.dispatch(vpnActions_connect()); else {
     const vpnStatus = state.vpn.vpnStatus;
     vpnStatus !== VpnStatus.Connecting && vpnStatus !== VpnStatus.Connected && vpnStatus !== VpnStatus.Reconnecting || dispatcher.dispatch(vpnActions_disconnect());
    }
    if (args.location) {
     const newLocationName = args.location.name;
     log$8("SPC selected new location: %s", newLocationName);
     const spcGatewaySelected = state.spc.locations.find(gw => gw.spcVpnLocation.name === newLocationName);
     if (!spcGatewaySelected) throw new Error(`Gateway ${newLocationName} not found.`);
     {
      const gatewaySelected = state.vpn.gateways.find(gw => gw.id === spcGatewaySelected.id);
      if (!gatewaySelected) throw new Error(`Gateway with id ${gatewaySelected.id} not found.`);
      dispatcher.dispatch(spcActions_setSelectedGatewayId(gatewaySelected.id)), dispatcher.dispatch(vpnActions_gatewaySelected(gatewaySelected));
     }
    }
    break;

   case ExtensionCallerMethodName$1.GetState:
    this.updateSpcState(args.with_locations);
    break;

   case ExtensionCallerMethodName$1.UpgradeNow:
    dispatcher.dispatch(vpnActions_showLicenseUpgradePage());
   }
  }
 }
 const initialSpcState = {
  active: !1,
  error: null,
  expiresIn: null,
  isBrowserApiAvailable: !1,
  location: null,
  locations: [],
  optimalLocation: null,
  selectedGatewayId: "",
  isAvastOne: !1,
  appName: "",
  licenseStatus: "",
  licenseType: ""
 }, spcPersistedPaths = [];
 const postStartEvents = new class {
  constructor() {
   _defineProperty(this, "extensionInitialized", void 0), _defineProperty(this, "onInstalledDetails", void 0), 
   this.extensionInitialized = !1, chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));
  }
  init() {
   this.extensionInitialized = !0, this.onInstalledDetails && this.dispatchInstalled(this.onInstalledDetails);
  }
  handleInstalled(details) {
   this.extensionInitialized ? this.dispatchInstalled(details) : this.onInstalledDetails = details;
  }
  dispatchInstalled(details) {
   switch (details.reason) {
   case "install":
    dispatcher.dispatch(globalActions_installed());
    break;

   case "update":
    runtimeInfo.extensionVersion !== details.previousVersion && dispatcher.dispatch(globalActions_updated(details.previousVersion));
   }
   this.onInstalledDetails = null;
  }
 }, actionGenerators = {
  [GlobalActionTypes.Startup]() {
   postStartEvents.init();
  },
  [GlobalActionTypes.GetState](dispatch, getState, action) {
   action.meta && action.meta.callback && action.meta.callback({
    state: getState()
   });
  }
 }, log$9 = browser("avastOne");
 class AvastOne {
  static async showUpgradeNowPage(referer) {
   const getUrlRequest = AvastOne.createAvastOneGetUrlParametersRequestMessage(343);
   log$9("AvastOne.getIpmUrl(). Sending request: %O", getUrlRequest);
   const getUrlResponse = await AvastOne.sendRequest(getUrlRequest);
   if (!getUrlResponse || getUrlResponse.error || !getUrlResponse.data) return !1;
   const url = getUrlResponse.data + "&p_scr=ASB_" + referer, showStoreWindowRequest = AvastOne.createAvastOneShowStoreWindowRequestMessage(url);
   return log$9("AvastOne.showUpgradeNowPage(). Sending request: %O", showStoreWindowRequest), 
   await AvastOne.sendRequest(showStoreWindowRequest), !0;
  }
  static createAvastOneGetUrlParametersRequestMessage(elementId) {
   return {
    action: AvastOneAction.GetIpmUrl,
    x_nm_args: elementId
   };
  }
  static createAvastOneShowStoreWindowRequestMessage(urlValue) {
   return {
    action: AvastOneAction.ShowStoreWindow,
    url: urlValue
   };
  }
  static sendNativeMessageAsync(message) {
   return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(NativeMessagingEndpointName.AvastOne, message, (function(response) {
     chrome.runtime.lastError ? reject(new NativeMessagingError("chrome.runtime.sendNativeMessage failed. Error: " + chrome.runtime.lastError.message)) : (log$9("chrome.runtime.sendNativeMessage received response: %o.", response), 
     resolve(response));
    }));
   });
  }
  static async sendRequest(request) {
   let response = null;
   try {
    response = await AvastOne.sendNativeMessageAsync(request);
   } catch (e) {
    chrome.runtime.lastError ? log$9("No connection to Avast One. Runtime last error: %O", chrome.runtime.lastError) : log$9("No connection to Avast One. Error: %O", e);
   }
   return response;
  }
 }
 class Version {
  constructor(major, minor) {
   _defineProperty(this, "_major", void 0), _defineProperty(this, "_minor", void 0), 
   this._major = major, this._minor = minor;
  }
  get major() {
   return this._major;
  }
  get minor() {
   return this._minor;
  }
  toString() {
   return this.major + "." + this.minor;
  }
  compare(other) {
   return other ? this.major > other.major ? 1 : this.major === other.major ? this.minor > other.minor ? 1 : this.minor === other.minor ? 0 : -1 : -1 : 1;
  }
 }
 const log$a = browser("vpn/ipChecker");
 const log$b = browser("vpn/nativeMessagingClient");
 class NativeMessagingClient {
  constructor() {
   _defineProperty(this, "_port", void 0), _defineProperty(this, "_disconnectedHandler", void 0), 
   this._port = null, this._disconnectedHandler = null;
  }
  connect(hostName, onNativeMessage, onDisconnected) {
   log$b("connecting to %s", hostName), this._disconnectedHandler = onDisconnected, 
   this._port = chrome.runtime.connectNative(hostName), this._port.onMessage.addListener(onNativeMessage), 
   this._port.onDisconnect.addListener(this.disconnectedHandlerInner.bind(this));
  }
  postMessage(message) {
   if (!this._port) throw new NativeMessagingError("port is not open!");
   this._port.postMessage(message);
  }
  disconnectedHandlerInner(port) {
   let message;
   const error = port.error || chrome.runtime.lastError;
   log$b("port disconnected"), error && (log$b("error: %O", error), error.message && (log$b("error message: %s", error.message), 
   message = error.message)), this._disconnectedHandler(message), this._port = null;
  }
 }
 const log$c = browser("vpn/vpnNativeMessagingClient");
 class VpnNativeMessagingClient {
  constructor() {
   _defineProperty(this, "_nativeMessagingClient", void 0), this._nativeMessagingClient = new NativeMessagingClient, 
   this._nativeMessagingClient.connect(NativeMessagingEndpointName[buildTimeInfo.productBrand], this.onNativeMessagingMessage.bind(this), this.onNativeMessagingDisconnected.bind(this));
  }
  setLanguage() {
   const setLanguageRequest = {
    action: "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.SetLanguage : SecureVpnVpnAction.SetLanguage,
    languageTag: getLanguage(),
    countryTag: getLanguage()
   };
   log$c("will post message %s, %O", setLanguageRequest.action, setLanguageRequest), 
   this._nativeMessagingClient.postMessage(setLanguageRequest);
  }
  requestOptimalGateway() {
   this.postAction(getGetOptimalGatewayAction());
  }
  requestVpnState() {
   const itemMask = StateItemFlag.VpnStatus | StateItemFlag.Gateways | StateItemFlag.LicenseInfo | StateItemFlag.ActiveGateway | StateItemFlag.LastError | StateItemFlag.PublicIpInfo | StateItemFlag.ConnectionInfo;
   this.postAction(getGetStateAction(), itemMask);
  }
  requestProductInfo() {
   this.postAction(getGetProductInfoAction());
  }
  connectVpnToOptimal() {
   this.postAction("SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.ConnectToOptimal : SecureVpnVpnAction.ConnectToOptimal);
  }
  connectVpnToGateway(gatewayId) {
   const connectRequest = {
    action: "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.Connect : SecureVpnVpnAction.Connect,
    location: {
     gatewayId: gatewayId
    }
   };
   log$c("will post message %s, %O", connectRequest.action, connectRequest), this._nativeMessagingClient.postMessage(connectRequest);
  }
  disconnectVpn() {
   this.postAction("SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.Disconnect : SecureVpnVpnAction.Disconnect);
  }
  showMainWindowWithRoute(route) {
   const showMainWindowRequest = {
    action: "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.ShowMainWindow : SecureVpnVpnAction.ShowMainWindow,
    route: route
   };
   log$c("will post message %s, %O", showMainWindowRequest.action, showMainWindowRequest), 
   this._nativeMessagingClient.postMessage(showMainWindowRequest);
  }
  showNag(elementId, pScrParameter) {
   const showNagRequest = {
    action: "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.ShowNag : SecureVpnVpnAction.ShowNag,
    elementId: elementId,
    extraUrlParameters: {
     p_scr: pScrParameter
    }
   };
   log$c("will post message %s, %O", showNagRequest.action, showNagRequest), this._nativeMessagingClient.postMessage(showNagRequest);
  }
  onNativeMessagingMessage(message) {
   if (!message || !message.action) return void log$c("received message without action = %O", message);
   log$c("received %s message, %O", message.action, message), chrome.runtime.lastError && log$c("error set when message was received: %O", chrome.runtime.lastError);
   const vpnClientApiVersionWithRepeatedEvents = new Version(1, 5), isClientWithRepeatedEvents = dispatcher.getState().vpn.vpnClientApiVersion.compare(vpnClientApiVersionWithRepeatedEvents) >= 0;
   switch (message.action) {
   case getGetOptimalGatewayAction():
    this.handleGetOptimalGatewayMessage(message);
    break;

   case "Vpn_OnStateChanged_SvcNm":
    isClientWithRepeatedEvents || this.handleVpnStateMessage(message);
    break;

   case "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.OnStateChanged : SecureVpnVpnAction.OnStateChanged:
   case getGetStateAction():
    this.handleVpnStateMessage(message);
    break;

   case "Vpn_OnErrorOccurred_SvcNm":
    isClientWithRepeatedEvents || this.handleErrorOccurredMessage(message);
    break;

   case "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.OnErrorOccurred : SecureVpnVpnAction.OnErrorOccurred:
    this.handleErrorOccurredMessage(message);
    break;

   case getGetProductInfoAction():
    this.handleGetProductInfoMessage(message);
   }
  }
  onNativeMessagingDisconnected(message) {
   log$c("native messaging host disconnected, message: %s", message), ("Native host has exited." === message || !message && runtimeInfo.browser === Browser.Firefox) && dispatcher.dispatch(vpnActions_setNativeMessagingHostFound(!1));
  }
  postAction(action, itemMask) {
   const message = {
    action: action,
    itemMask: itemMask
   };
   log$c("will post message %s, %O", message.action, message), this._nativeMessagingClient.postMessage(message);
  }
  handleGetOptimalGatewayMessage(message) {
   if (message.data) dispatcher.dispatch(vpnActions_optimalGatewayUpdated(message.data)); else {
    message.error && log$c("WARNING: GetOptimalGateway response contains error: %O", message.error);
    const optimalGateway = {
     city: {
      name: ""
     },
     country: {
      id: "",
      name: ""
     },
     id: "optimal_unknown"
    };
    dispatcher.dispatch(vpnActions_optimalGatewayUpdated(optimalGateway));
   }
  }
  handleVpnStateMessage(message) {
   if (message.data) {
    const vpnClientState = message.action === getGetStateAction() ? message.data : message.data.data;
    vpnClientState.vpnStatus && dispatcher.dispatch(vpnActions_statusUpdated(vpnClientState.vpnStatus)), 
    vpnClientState.activeGateway && dispatcher.dispatch(vpnActions_activeGatewayUpdated(vpnClientState.activeGateway)), 
    vpnClientState.gateways && dispatcher.dispatch(vpnActions_gatewaysUpdated(vpnClientState.gateways)), 
    vpnClientState.lastError && dispatcher.dispatch(vpnActions_lastErrorUpdated(vpnClientState.lastError)), 
    vpnClientState.licenseInfo && dispatcher.dispatch(vpnActions_licenseInfoUpdated(vpnClientState.licenseInfo)), 
    vpnClientState.publicIpInfo && dispatcher.dispatch(vpnActions_publicIpInfoUpdated(vpnClientState.publicIpInfo)), 
    vpnClientState.connectionInfo && dispatcher.dispatch(vpnActions_connectionInfoUpdated(vpnClientState.connectionInfo));
   } else message.error && (log$c("ERROR: GetState/OnStateChanged response is error: %O", message.error), 
   dispatcher.dispatch(vpnActions_vpnApiReturnedError(message.error)));
  }
  handleErrorOccurredMessage(message) {
   message.data ? dispatcher.dispatch(vpnActions_errorOccurred(message.data)) : message.error && (log$c("ERROR: OnErrorOccurred message is error: %O", message.error), 
   dispatcher.dispatch(vpnActions_vpnApiReturnedError(message.error)));
  }
  handleGetProductInfoMessage(message) {
   message.data && dispatcher.dispatch(vpnActions_productInfoUpdated(message.data));
  }
 }
 const log$d = browser("vpn"), ExtensionIconOverlayText = {
  Connected: getMessage("extension_icon_overlay_text_connected"),
  Connecting: getMessage("extension_icon_overlay_text_connecting"),
  Disconnected: getMessage("extension_icon_overlay_text_disconnected"),
  Disconnecting: getMessage("extension_icon_overlay_text_disconnecting"),
  Reconnecting: getMessage("extension_icon_overlay_text_reconnecting")
 };
 class Vpn {
  static updateIcon(vpnStatus) {
   let path = "img/icon19-active.png", title = "";
   switch (vpnStatus) {
   case VpnStatus.Connecting:
    title = ExtensionIconOverlayText.Connecting;
    break;

   case VpnStatus.Reconnecting:
    title = ExtensionIconOverlayText.Reconnecting;
    break;

   case VpnStatus.Connected:
    title = ExtensionIconOverlayText.Connected;
    break;

   case VpnStatus.Disconnecting:
    title = ExtensionIconOverlayText.Disconnecting, path = "img/icon19.png";
    break;

   case VpnStatus.Disconnected:
   default:
    title = ExtensionIconOverlayText.Disconnected, path = "img/icon19.png";
   }
   chrome.browserAction.setIcon({
    path: path
   }, () => {
    chrome.runtime.lastError && log$d("chrome.browserAction.setIcon failed with error %O", chrome.runtime.lastError);
   }), chrome.browserAction.setTitle({
    title: title
   }, () => {
    chrome.runtime.lastError && log$d("chrome.browserAction.setTitle failed with error %O", chrome.runtime.lastError);
   });
  }
  static async checkVpnClientConnectivity() {
   try {
    const vpnClientApiVersion = await Vpn.fetchVpnClientApiVersion();
    vpnClientApiVersion && dispatcher.dispatch(vpnActions_vpnClientApiVersionUpdated(vpnClientApiVersion));
   } catch (e) {
    dispatcher.dispatch(vpnActions_setNativeMessagingHostFound(!1));
   }
  }
  static async checkVpnClientEdition() {
   try {
    const edition = await Vpn.fetchVpnEdition();
    dispatcher.dispatch(vpnActions_vpnClientApiEditionUpdated(edition));
   } catch (e) {
    dispatcher.dispatch(vpnActions_setNativeMessagingHostFound(!1));
   }
  }
  static async fetchPublicIpAddress(vpnClientApiVersion) {
   if (vpnClientApiVersion || (vpnClientApiVersion = await Vpn.fetchVpnClientApiVersion()), 
   vpnClientApiVersion.compare(new Version(1, 6)) >= 0) {
    let vpnIpAddresses = null;
    try {
     vpnIpAddresses = await Vpn.getPublicIp();
    } catch (err) {
     log$d("Retrieving public IP address from app failed. Error: %O", err);
    }
    vpnIpAddresses && vpnIpAddresses.original ? (log$d("Public IP object: %O", vpnIpAddresses), 
    dispatcher.dispatch(vpnActions_publicIpChanged(vpnIpAddresses))) : dispatcher.dispatch(vpnActions_publicIpChanged(null));
   } else {
    let ipAddress = "";
    try {
     ipAddress = await async function() {
      const response = await fetch("https://ip-info.ff.avast.com/v2/info");
      if (log$a("GeoIp service response status = %d", response.status), response.ok) {
       const ip = (await response.json()).ip;
       return log$a("Public IP: %s", ip), ip;
      }
      throw new Error("GeoIp response failed. Offline(?)");
     }();
    } catch (err) {
     log$d("Retrieving current public IP address failed. Error: %O", err);
    }
    dispatcher.dispatch(vpnActions_ipAddressChanged(ipAddress));
   }
  }
  static async getPublicIp() {
   let vpnIpAddresses = null;
   const request = this.createGetPublicIpRequest();
   try {
    vpnIpAddresses = await Vpn.sendRequest(request), vpnIpAddresses = vpnIpAddresses.data;
   } catch (err) {
    log$d("Getting IP addresses request failed. Error: %O", err);
   }
   return vpnIpAddresses;
  }
  static async fetchVpnClientApiVersion() {
   const request = Vpn.createGetApiVersionRequestMessage(), response = await Vpn.sendRequest(request);
   if (!(obj = response) || "object" != typeof obj || obj.action !== getApiVersionAction() || !function(obj) {
    return obj && "object" == typeof obj && "string" == typeof obj.publicApiVersion;
   }(obj.data)) throw new ObjectValidationError("object is not IGetApiVersionResponse");
   var obj;
   return Vpn.extractApiVersion(response.data);
  }
  static async fetchVpnEdition() {
   const request = Vpn.createGetProductInfoRequestMessage(), response = await Vpn.sendRequest(request);
   if (!(obj = response) || "object" != typeof obj || obj.action !== getGetProductInfoAction() || !function(obj) {
    return obj && "object" == typeof obj && "number" == typeof obj.edition && "string" == typeof obj.hardwareId && "string" == typeof obj.version;
   }(obj.data)) throw new ObjectValidationError("object is not IGetApiVersionResponse");
   var obj;
   return response.data.edition;
  }
  static createGetProductInfoRequestMessage() {
   return {
    action: getGetProductInfoAction()
   };
  }
  static createGetApiVersionRequestMessage() {
   return {
    action: getApiVersionAction(),
    clientApiVersion: Vpn.ClientApiVersion.toString()
   };
  }
  static createGetPublicIpRequest() {
   return {
    action: "SecureLine" === buildTimeInfo.productBrand ? SecureLineVpnAction.GetPublicIp : SecureVpnVpnAction.GetPublicIp
   };
  }
  static sendNativeMessageAsync(message) {
   return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(NativeMessagingEndpointName[buildTimeInfo.productBrand], message, (function(response) {
     chrome.runtime.lastError ? (log$d("chrome.runtime.sendNativeMessage failed with error: %O", chrome.runtime.lastError), 
     "Specified native messaging host not found." === chrome.runtime.lastError.message ? reject(new NativeMessagingHostNotFoundError) : reject(new NativeMessagingError("chrome.runtime.sendNativeMessage failed. Error: " + chrome.runtime.lastError.message))) : (log$d("chrome.runtime.sendNativeMessage received response: %o.", response), 
     resolve(response));
    }));
   });
  }
  static extractApiVersion(data) {
   const version = data.publicApiVersion;
   if (!version) throw new ObjectValidationError("Missing value for property publicApiVersion.");
   const [versionMajor, versionMinor] = version.split(".").map(s => parseInt(s, 10));
   if (isNaN(versionMajor)) throw new ObjectValidationError("Failed to parse Major part of VPN Client's public API version.");
   if (isNaN(versionMinor)) throw new ObjectValidationError("Failed to parse Minor part of VPN Client's public API version.");
   return new Version(versionMajor, versionMinor);
  }
  static async sendRequest(request) {
   let response = null;
   try {
    response = await Vpn.sendNativeMessageAsync(request);
   } catch (e) {
    log$d("Sending request to VPN client failed. Error: %O", e), dispatcher.dispatch(vpnActions_setNativeMessagingHostFound(!1));
   }
   return response;
  }
  constructor(options) {
   _defineProperty(this, "_vpnNativeMessagingClient", void 0), _defineProperty(this, "_vpnBrowserActionAdapter", void 0), 
   options && (this._vpnBrowserActionAdapter = options.vpnBrowserActionAdapter || null);
  }
  async init() {
   window.addEventListener("online", this.handleNetworkConnectivityChange.bind(this)), 
   window.addEventListener("offline", this.handleNetworkConnectivityChange.bind(this)), 
   await this.handleNetworkConnectivityChange();
  }
  async fetchInitData() {
   try {
    this._vpnNativeMessagingClient = new VpnNativeMessagingClient, this._vpnNativeMessagingClient.setLanguage(), 
    this._vpnNativeMessagingClient.requestVpnState(), this._vpnNativeMessagingClient.requestOptimalGateway(), 
    this._vpnNativeMessagingClient.requestProductInfo();
   } catch (e) {
    log$d("Failed to fetch initial data. Error: %O", e), dispatcher.dispatch(vpnActions_setNativeMessagingHostFound(!1));
   }
  }
  async connect() {
   if (!this._vpnNativeMessagingClient) return void log$d("cannot not connect without nativeMessagingClient");
   const state = dispatcher.getState().vpn;
   "optimal_unknown" === state.selectedGateway.id ? this._vpnNativeMessagingClient.connectVpnToOptimal() : this._vpnNativeMessagingClient.connectVpnToGateway(state.selectedGateway.id);
  }
  async disconnect() {
   this._vpnNativeMessagingClient ? this._vpnNativeMessagingClient.disconnectVpn() : log$d("cannot not disconnect without nativeMessagingClient");
  }
  async showMainWindow(route) {
   this._vpnNativeMessagingClient ? this._vpnNativeMessagingClient.showMainWindowWithRoute(route) : log$d("cannot not shown main window without nativeMessagingClient");
  }
  async showNag(elementId, pScrParameter) {
   this._vpnNativeMessagingClient ? this._vpnNativeMessagingClient.showNag(elementId, pScrParameter) : log$d("cannot not shown nag without nativeMessagingClient");
  }
  updateBrowserAction(vpnStatus) {
   this._vpnBrowserActionAdapter ? this._vpnBrowserActionAdapter(vpnStatus) : Vpn.updateIcon(vpnStatus);
  }
  async handleNetworkConnectivityChange() {
   const isConnectedToNetwork = navigator.onLine;
   log$d("Network connectivity: %s", isConnectedToNetwork ? "online" : "offline"), 
   dispatcher.dispatch(vpnActions_handleNetworkConnectivityChange(isConnectedToNetwork));
  }
 }
 _defineProperty(Vpn, "ClientApiVersion", new Version(1, 5));
 const log$e = browser("vpn/actionGenerator");
 function getReferer(vpn) {
  switch (vpn.lastActivePage) {
  case AsbActivePageTypes.LicenseStatusNotValid:
   return LicenseUpgradePageReferer.VpnExpired;

  case AsbActivePageTypes.FreeDataAvailable:
   return vpn.vpnStatus === VpnStatus.Connected ? LicenseUpgradePageReferer.VpnOn : LicenseUpgradePageReferer.VpnOff;

  case AsbActivePageTypes.FreeDataNotUsed:
   return LicenseUpgradePageReferer.VpnFirstLaunch;

  case AsbActivePageTypes.FreeDataUsed:
   return LicenseUpgradePageReferer.VpnLimitReached;

  case AsbActivePageTypes.Paid:
  case AsbActivePageTypes.Offline:
  case AsbActivePageTypes.General:
  case AsbActivePageTypes.UpdateBrowser:
  case AsbActivePageTypes.InstallApp:
  case AsbActivePageTypes.Loading:
  case AsbActivePageTypes.UpdateExtension:
  case AsbActivePageTypes.UpdateApp:
  case AsbActivePageTypes.Reinstall:
  case AsbActivePageTypes.Restart:
  default:
   return LicenseUpgradePageReferer.VpnGeneric;
  }
 }
 function createVpnActionGenerator(vpn) {
  const generator = {};
  return generator[GlobalActionTypes.Startup] = () => {
   vpn.init();
  }, generator[GlobalActionTypes.GetState] = async (dispatch, getState) => {
   getState().vpn.isNativeMessagingHostFound || await Vpn.checkVpnClientConnectivity();
  }, generator[VpnActionTypes.Connect] = () => {
   vpn.connect();
  }, generator[VpnActionTypes.Disconnect] = () => {
   vpn.disconnect();
  }, generator[VpnActionTypes.ShowMainWindow] = (dispatch, getState, action) => {
   vpn.showMainWindow(action.value);
  }, generator[VpnActionTypes.ShowNag] = (dispatch, getState, action) => {
   const {elementId: elementId, pScrParameter: pScrParameter} = action.value;
   vpn.showNag(elementId, pScrParameter);
  }, generator[VpnActionTypes.ShowMainWindow] = (dispatch, getState, action) => {
   vpn.showMainWindow(action.value);
  }, generator[VpnActionTypes.ShowNag] = (dispatch, getState, action) => {
   const {elementId: elementId, pScrParameter: pScrParameter} = action.value;
   vpn.showNag(elementId, pScrParameter);
  }, generator[VpnActionTypes.ShowLicenseUpgradePage] = async (dispatch, getState) => {
   const vpnClientApiVersion = getState().vpn.vpnClientApiVersion;
   if (getState().vpn.isAvastOne) {
    if (await AvastOne.showUpgradeNowPage(getReferer(getState().vpn))) return void log$e("VpnActionTypes.ShowLicenseUpgradePage Avast One API available");
   }
   var url;
   getState().vpn.isAvastOne || vpnClientApiVersion.compare(new Version(1, 5)) < 0 ? (url = VpnProductLicensePurchaseLink[buildTimeInfo.productBrand], 
   chrome.tabs.create({
    url: url
   })) : vpn.showNag(2);
  }, generator[VpnActionTypes.VpnStatusUpdated] = async (dispatch, getState) => {
   const state = getState().vpn, vpnStatus = state.vpnStatus, vpnClientApiVersion = state.vpnClientApiVersion, isReconnectingToAnotherGateway = state.isReconnectingToAnotherGateway;
   state.didConnectDuringReconnecting;
   vpn.updateBrowserAction(vpnStatus), isReconnectingToAnotherGateway && (vpnStatus === VpnStatus.Disconnected ? (log$e("reconnecting to another gateway: Connecting..."), 
   dispatcher.dispatch(vpnActions_connect())) : vpnStatus === VpnStatus.Connected && dispatcher.dispatch(vpnActions_updateReconnectingToAnotherGatewayStatus(!1))), 
   vpnStatus === VpnStatus.Connected && dispatcher.dispatch(vpnActions_errorOccurred(null)), 
   (vpnStatus === VpnStatus.Connected || vpnStatus === VpnStatus.Disconnected && !isReconnectingToAnotherGateway) && await Vpn.fetchPublicIpAddress(vpnClientApiVersion);
  }, generator[VpnActionTypes.OptimalGatewayUpdated] = (dispatch, getState) => {
   const optimalGateway = getState().vpn.optimalGateway, selectedGateway = getState().vpn.selectedGateway;
   optimalGateway && !selectedGateway && (log$e("selecting optimal gateway: %s", optimalGateway.id), 
   dispatcher.dispatch(vpnActions_gatewaySelected(optimalGateway)));
  }, generator[VpnActionTypes.ActiveGatewayUpdated] = (dispatch, getState) => {
   const activeGateway = getState().vpn.activeGateway, selectedGateway = getState().vpn.selectedGateway;
   if (activeGateway && activeGateway.id) {
    if (selectedGateway && selectedGateway.id === activeGateway.id) return;
    log$e("Selecting active gateway: %s", activeGateway.id), dispatcher.dispatch(vpnActions_gatewaySelected(activeGateway));
   }
  }, generator[VpnActionTypes.SelectGateway] = async (dispatch, getState) => {
   const vpnStatus = getState().vpn.vpnStatus;
   vpnStatus !== VpnStatus.Connected && vpnStatus !== VpnStatus.Connecting || (dispatcher.dispatch(vpnActions_updateReconnectingToAnotherGatewayStatus(!0)), 
   log$e("reconnecting to another gateway: Disconnecting..."), dispatcher.dispatch(vpnActions_disconnect()));
  }, generator[VpnActionTypes.HandleNetworkConnectivityChange] = async (dispatch, getState) => {
   const state = getState(), vpnClientApiVersion = state.vpn.vpnClientApiVersion;
   if (state.vpn.isConnectedToNetwork) {
    state.vpn.isInitialized || (await Vpn.checkVpnClientConnectivity(), await Vpn.checkVpnClientEdition(), 
    dispatcher.dispatch(vpnActions_setIsInitialized(!0))), dispatcher.dispatch(vpnActions_removeNotification(NotificationType.Offline)), 
    await Vpn.fetchPublicIpAddress(vpnClientApiVersion), vpn.updateBrowserAction(getState().vpn.vpnStatus);
   } else dispatcher.dispatch(vpnActions_addNotification(NotificationType.Offline)), 
   dispatcher.dispatch(vpnActions_publicIpChanged(null)), vpn.updateBrowserAction(VpnStatus.Disconnected);
  }, generator[VpnActionTypes.ErrorOccurred] = (dispatch, getState) => {
   const state = getState(), errorInfo = state.vpn.errorInfo;
   errorInfo ? (log$e("Error occurred. Source: %s. Code: %s", errorInfo.source, errorInfo.code), 
   dispatcher.dispatch(vpnActions_addNotification(NotificationType.Error))) : (log$e("Error cleared."), 
   dispatcher.dispatch(vpnActions_removeNotification(NotificationType.Error))), vpn.updateBrowserAction(state.vpn.vpnStatus);
  }, generator[VpnActionTypes.VpnApiReturnedError] = (dispatch, getState) => {
   const state = getState();
   state.vpn.vpnApiError ? (log$e("VPN API returned error: %O", state.vpn.vpnApiError), 
   dispatcher.dispatch(vpnActions_addNotification(NotificationType.Error))) : (log$e("VPN API error cleared."), 
   dispatcher.dispatch(vpnActions_removeNotification(NotificationType.Error))), vpn.updateBrowserAction(state.vpn.vpnStatus);
  }, generator[VpnActionTypes.VpnClientApiVersionUpdated] = (dispatch, getState) => {
   const vpnClientApiVersion = getState().vpn.vpnClientApiVersion;
   let apiCompatibility;
   log$e("vpn client API version: %d.%d", vpnClientApiVersion.major, vpnClientApiVersion.minor), 
   dispatcher.dispatch(vpnActions_removeNotification(NotificationType.InstallVpnClient)), 
   vpnClientApiVersion.major === Vpn.ClientApiVersion.major ? (apiCompatibility = ApiCompatibility.Compatible, 
   dispatcher.dispatch(vpnActions_removeNotification(NotificationType.UpdateVpnClient)), 
   dispatcher.dispatch(vpnActions_removeNotification(NotificationType.UpdateExtension))) : vpnClientApiVersion.major <= Vpn.ClientApiVersion.major ? (apiCompatibility = ApiCompatibility.VpnClientOld, 
   dispatcher.dispatch(vpnActions_addNotification(NotificationType.UpdateVpnClient))) : (apiCompatibility = ApiCompatibility.ExtensionOld, 
   dispatcher.dispatch(vpnActions_addNotification(NotificationType.UpdateExtension))), 
   dispatcher.dispatch(vpnActions_apiCompatibilityResolved(apiCompatibility));
  }, generator[VpnActionTypes.VpnClientApiEditionUpdated] = (dispatch, getState) => {
   const vpnClientApiEdition = getState().vpn.vpnClientApiEdition;
   log$e("Vpn Client API Edition: %d", vpnClientApiEdition), dispatcher.dispatch(vpnActions_setIsAvastOne(vpnClientApiEdition === IProductInfoEdition.AvastOne));
  }, generator[VpnActionTypes.ApiCompatibilityResolved] = async (dispatch, getState) => {
   const state = getState();
   if (state.vpn.apiCompatibility === ApiCompatibility.Compatible) try {
    await vpn.fetchInitData();
   } catch (e) {
    log$e("fetchInitData() failed. Error %O", e), dispatcher.dispatch(vpnActions_setNativeMessagingHostFound(!1));
   }
   vpn.updateBrowserAction(state.vpn.vpnStatus);
  }, generator[VpnActionTypes.LicenseInfoUpdated] = (dispatch, getState) => {
   const state = getState(), {licenseInfo: licenseInfo} = state.vpn;
   licenseInfo && (licenseInfo.status === VpnLicenseStatus.Expired ? licenseInfo.type === VpnLicenseType.Subscription ? dispatcher.dispatch(vpnActions_addNotification(NotificationType.SubscriptionExpired)) : licenseInfo.type === VpnLicenseType.Trial && dispatcher.dispatch(vpnActions_addNotification(NotificationType.TrialExpired)) : (licenseInfo.status !== VpnLicenseStatus.Valid ? dispatcher.dispatch(vpnActions_addNotification(NotificationType.ActivateVpnLicense)) : dispatcher.dispatch(vpnActions_removeNotification(NotificationType.ActivateVpnLicense)), 
   dispatcher.dispatch(vpnActions_removeNotification(NotificationType.SubscriptionExpired)), 
   dispatcher.dispatch(vpnActions_removeNotification(NotificationType.TrialExpired)))), 
   vpn.updateBrowserAction(state.vpn.vpnStatus);
  }, generator[VpnActionTypes.SetNativeMessagingHostFound] = (dispatch, getState) => {
   const state = getState();
   state.vpn.isNativeMessagingHostFound ? dispatcher.dispatch(vpnActions_removeNotification(NotificationType.InstallVpnClient)) : dispatcher.dispatch(vpnActions_addNotification(NotificationType.InstallVpnClient)), 
   vpn.updateBrowserAction(state.vpn.vpnStatus);
  }, generator;
 }
 function vpnReducer(state, action) {
  switch (state = void 0 === state ? {} : state, action.type) {
  case VpnActionTypes.VpnClientApiVersionUpdated:
   return shallowCopy(state, {
    isNativeMessagingHostFound: !0,
    vpnClientApiVersion: action.value
   });

  case VpnActionTypes.VpnClientApiEditionUpdated:
   return shallowCopy(state, {
    vpnClientApiEdition: action.value
   });

  case VpnActionTypes.ApiCompatibilityResolved:
   return shallowCopy(state, {
    apiCompatibility: action.value
   });

  case VpnActionTypes.OptimalGatewayUpdated:
   {
    const optimalGateway = action.value, isOptimalGatewayUnknown = optimalGateway && "optimal_unknown" === optimalGateway.id, isOptimalUnknownAlreadyAdded = void 0 !== state.gateways.find(gw => "optimal_unknown" === gw.id);
    if (isOptimalGatewayUnknown && !isOptimalUnknownAlreadyAdded) {
     let gateways = [];
     return gateways.push(optimalGateway), gateways = gateways.concat(state.gateways), 
     shallowCopy(state, {
      gateways: gateways,
      optimalGateway: action.value
     });
    }
    return shallowCopy(state, {
     optimalGateway: action.value
    });
   }

  case VpnActionTypes.ActiveGatewayUpdated:
   {
    const connectedOrConnecting = state.vpnStatus === VpnStatus.Connecting || state.vpnStatus === VpnStatus.Connected || state.vpnStatus === VpnStatus.Reconnecting, mutations = [ {
     activeGateway: action.value
    } ];
    return action.value && action.value.id && (!state.selectedGateway || connectedOrConnecting) && mutations.push({
     selectedGateway: action.value
    }), shallowCopy(state, ...mutations);
   }

  case VpnActionTypes.GatewaysUpdated:
   {
    let gateways = [];
    const optimalGateway = state.optimalGateway, sortedGateways = function(gateways) {
     return [ ...gateways ].sort((a, b) => a.city.name.localeCompare(b.city.name)).sort((a, b) => a.country.name.localeCompare(b.country.name));
    }(action.value);
    return optimalGateway && "optimal_unknown" === optimalGateway.id && gateways.push(optimalGateway), 
    gateways = gateways.concat(sortedGateways), shallowCopy(state, {
     gateways: gateways
    });
   }

  case VpnActionTypes.LastErrorUpdated:
   return shallowCopy(state, {
    lastError: action.value
   });

  case VpnActionTypes.ErrorOccurred:
   return shallowCopy(state, {
    errorInfo: action.value
   });

  case VpnActionTypes.VpnApiReturnedError:
   return shallowCopy(state, {
    vpnApiError: action.value
   });

  case VpnActionTypes.LicenseInfoUpdated:
   return shallowCopy(state, {
    licenseInfo: action.value
   });

  case VpnActionTypes.PublicIpInfoUpdated:
   return shallowCopy(state, {
    publicIpInfo: action.value
   });

  case VpnActionTypes.ConnectionInfoUpdated:
   return shallowCopy(state, {
    connectionInfo: action.value
   });

  case VpnActionTypes.VpnStatusUpdated:
   return shallowCopy(state, {
    vpnStatus: action.value
   });

  case VpnActionTypes.SelectGateway:
   return shallowCopy(state, {
    selectedGateway: action.value
   });

  case VpnActionTypes.IpAddressChanged:
   return shallowCopy(state, {
    ipAddress: action.value
   });

  case VpnActionTypes.ProductInfoUpdated:
   return shallowCopy(state, {
    productInfo: action.value
   });

  case VpnActionTypes.PublicIpChanged:
   return shallowCopy(state, {
    vpnIpAddresses: action.value
   });

  case VpnActionTypes.ReconnectingToAnotherGatewayStatusChanged:
   return shallowCopy(state, {
    didConnectDuringReconnecting: !1,
    isReconnectingToAnotherGateway: action.value
   });

  case VpnActionTypes.HandleNetworkConnectivityChange:
   return shallowCopy(state, {
    isConnectedToNetwork: action.value
   });

  case VpnActionTypes.SetNativeMessagingHostFound:
   return shallowCopy(state, {
    isNativeMessagingHostFound: action.value
   });

  case VpnActionTypes.SetIsAvastOne:
   return shallowCopy(state, {
    isAvastOne: action.value
   });

  case VpnActionTypes.SetIsInitialized:
   return shallowCopy(state, {
    isInitialized: action.value
   });

  case VpnActionTypes.Connect:
   if (state.isReconnectingToAnotherGateway) return shallowCopy(state, {
    didConnectDuringReconnecting: !0
   });
   break;

  case VpnActionTypes.AddNotification:
   return shallowCopy(state, {
    notifications: state.notifications.concat([ action.value ])
   });

  case VpnActionTypes.RemoveNotification:
   return shallowCopy(state, {
    notifications: state.notifications.filter(notification => notification !== action.value)
   });

  case VpnActionTypes.LastActivePageUpdated:
   return shallowCopy(state, {
    lastActivePage: action.value
   });
  }
  return state;
 }
 const initialVpnState = {
  apiCompatibility: null,
  optimalGateway: null,
  activeGateway: null,
  gateways: [],
  lastError: null,
  errorInfo: null,
  vpnApiError: null,
  licenseInfo: null,
  vpnStatus: null,
  selectedGateway: null,
  ipAddress: "",
  isInitialized: !1,
  isReconnectingToAnotherGateway: !1,
  didConnectDuringReconnecting: !1,
  isConnectedToNetwork: !1,
  isNativeMessagingHostFound: !0,
  vpnClientApiVersion: null,
  vpnIpAddresses: null,
  productInfo: null,
  notifications: [],
  vpnClientApiEdition: null,
  isAvastOne: !1,
  publicIpInfo: null,
  connectionInfo: null,
  lastActivePage: AsbActivePageTypes.None
 }, vpnPersistedPaths = [ "licenseInfo", "productInfo", "selectedGateway" ], log$f = browser("management");
 function disableExtension(id) {
  return new Promise(resolve => {
   chrome.management.setEnabled(id, !1, () => {
    chrome.runtime.lastError ? log$f("could not disable extension %s: %s", id, chrome.runtime.lastError) : log$f("extension %s disabled", id), 
    resolve();
   });
  });
 }
 async function disableConflictingExtension(permission) {
  log$f("going to disable all extensions with %s permission", permission);
  const extensions = await new Promise(resolve => {
   chrome.management.getAll(result => {
    resolve(result);
   });
  });
  for (const extensionInfo of extensions) extensionInfo.id !== chrome.runtime.id && extensionInfo.enabled && extensionInfo.permissions && extensionInfo.permissions.includes(permission) && (log$f("trying to disable extension: %s / %s", extensionInfo.name, extensionInfo.id), 
  await disableExtension(extensionInfo.id));
 }
 let WebRtcActionTypes;
 !function(WebRtcActionTypes) {
  WebRtcActionTypes.IsSupportedChange = "webrtc.isSupportedChange", WebRtcActionTypes.IsAvailableChange = "webrtc.isAvailableChange", 
  WebRtcActionTypes.IsEnabledChange = "webrtc.isEnabledChange", WebRtcActionTypes.Toggle = "webrtc.toggle", 
  WebRtcActionTypes.DisableConflictingExtensions = "webrtc.disableConflictingExtensions";
 }(WebRtcActionTypes || (WebRtcActionTypes = {}));
 const webRtcActions_isAvailableChange = available => createAction(WebRtcActionTypes.IsAvailableChange, available), webRtcActions_isEnabledChange = enabled => createAction(WebRtcActionTypes.IsEnabledChange, enabled), webRtcActions_isSupportedChange = supported => createAction(WebRtcActionTypes.IsSupportedChange, supported);
 function webRtcActionGenerators(webRtc) {
  const generators = {};
  return generators[GlobalActionTypes.Startup] = () => {
   webRtc.init();
  }, generators[GlobalActionTypes.Installed] = () => {
   webRtc.installed();
  }, generators[WebRtcActionTypes.Toggle] = () => {
   webRtc.toggle();
  }, generators[WebRtcActionTypes.DisableConflictingExtensions] = async () => {
   await disableConflictingExtension("privacy"), webRtc.refreshSettings();
  }, generators;
 }
 function webRtcReducer(state, action) {
  switch (state = void 0 === state ? {} : state, action.type) {
  case WebRtcActionTypes.IsSupportedChange:
   return shallowCopy(state, {
    isSupported: action.value
   });

  case WebRtcActionTypes.IsEnabledChange:
   return shallowCopy(state, {
    isEnabled: action.value
   });

  case WebRtcActionTypes.IsAvailableChange:
   return shallowCopy(state, {
    isAvailable: action.value
   });
  }
  return state;
 }
 const initialWebRtcState = {
  isSupported: null,
  isAvailable: null,
  isEnabled: null
 }, webRtcPersistedPaths = [];
 let BrowserSettingLevelOfControl, ChromeWebRtcConfigValue;
 !function(BrowserSettingLevelOfControl) {
  BrowserSettingLevelOfControl.Controllable = "controllable_by_this_extension", BrowserSettingLevelOfControl.Controlled = "controlled_by_this_extension";
 }(BrowserSettingLevelOfControl || (BrowserSettingLevelOfControl = {})), function(ChromeWebRtcConfigValue) {
  ChromeWebRtcConfigValue.DisableNonProxiedUdp = "disable_non_proxied_udp", ChromeWebRtcConfigValue.Default = "default", 
  ChromeWebRtcConfigValue.ProxyOnly = "proxy_only";
 }(ChromeWebRtcConfigValue || (ChromeWebRtcConfigValue = {}));
 const log$g = browser("webRtc");
 class WebRtc {
  constructor(enableByDefault = !1) {
   _defineProperty(this, "enableByDefault", void 0), _defineProperty(this, "webRtcIpHandlingPolicy", void 0), 
   _defineProperty(this, "enabledValue", void 0), this.enableByDefault = enableByDefault, 
   chrome.privacy && chrome.privacy.network && (this.webRtcIpHandlingPolicy = chrome.privacy.network.webRTCIPHandlingPolicy, 
   this.enabledValue = runtimeInfo.browser === Browser.Firefox ? ChromeWebRtcConfigValue.ProxyOnly : ChromeWebRtcConfigValue.DisableNonProxiedUdp, 
   log$g("enabledValue", this.enabledValue));
  }
  init() {
   log$g("initializing");
   const isSupported = !!this.webRtcIpHandlingPolicy;
   dispatcher.dispatch(webRtcActions_isSupportedChange(isSupported)), isSupported && (this.webRtcIpHandlingPolicy.get({}, this.handleConfig.bind(this)), 
   this.webRtcIpHandlingPolicy.onChange && this.webRtcIpHandlingPolicy.onChange.addListener(this.handleConfig.bind(this)));
  }
  installed() {
   const state = dispatcher.getState();
   this.enableByDefault && !state.webRtc.isEnabled && (log$g("enabling by default"), 
   this.toggle());
  }
  toggle() {
   const state = dispatcher.getState();
   if (!state.webRtc.isSupported) return;
   const nextValue = state.webRtc.isEnabled ? ChromeWebRtcConfigValue.Default : this.enabledValue;
   this.webRtcIpHandlingPolicy.set({
    value: nextValue,
    scope: "regular"
   }, () => {
    this.webRtcIpHandlingPolicy.onChange || this.webRtcIpHandlingPolicy.get({}, this.handleConfig.bind(this));
   });
  }
  refreshSettings() {
   !!this.webRtcIpHandlingPolicy && this.webRtcIpHandlingPolicy.get({}, this.handleConfig.bind(this));
  }
  handleConfig(details) {
   log$g("handling settings change: %O", details);
   const state = dispatcher.getState(), currentAvailability = function(details) {
    return details.levelOfControl === BrowserSettingLevelOfControl.Controlled || details.levelOfControl === BrowserSettingLevelOfControl.Controllable;
   }(details);
   currentAvailability !== state.webRtc.isAvailable && dispatcher.dispatch(webRtcActions_isAvailableChange(currentAvailability));
   const isInControl = function(details) {
    return details.levelOfControl === BrowserSettingLevelOfControl.Controlled;
   }(details), isSet = details.value === this.enabledValue, currentState = isInControl && isSet;
   currentState !== state.webRtc.isEnabled && dispatcher.dispatch(webRtcActions_isEnabledChange(currentState));
  }
 }
 !async function(bootstrap) {
  await browserStorage.init();
  const {reducers: reducers, generators: generators, initialState: initialState, persistedPaths: persistedPaths} = bootstrap(browserStorage), persist = new StatePersist(browserStorage, persistedPaths), persistedState = persist.load();
  persistedState && (log$6("persisted state: %O", persistedState), Object.keys(persistedState).forEach(key => {
   initialState[key] && persistedState[key] && ("function" == typeof initialState[key] ? initialState[key] = initialState[key](persistedState[key]) : initialState[key] = {
    ...initialState[key],
    ...persistedState[key]
   });
  })), Object.keys(initialState).forEach(key => {
   "function" == typeof initialState[key] && (initialState[key] = initialState[key]());
  }), log$6("initial state: %O", initialState);
  const store = createStore$1(reducers, generators, initialState, persist);
  dispatcher.setStore(store), dispatcher.dispatch(globalActions_startup()), chrome.runtime.onMessage.addListener((function(msg, sender, callback) {
   if (msg.type) return dispatcher.dispatch({
    ...msg,
    meta: {
     sender: sender,
     callback: callback
    }
   }), void 0 !== callback;
  }));
 }((function() {
  const analytics = new AnalyticsAsb, vpn = new Vpn, webRtc = new WebRtc, spc = new Spc;
  return {
   reducers: {
    [Feature.Analytics]: analyticsReducer,
    [Feature.Vpn]: vpnReducer,
    [Feature.WebRtc]: webRtcReducer,
    [Feature.Spc]: spcReducer
   },
   initialState: {
    [Feature.Analytics]: initialAnalyticsState,
    [Feature.Vpn]: initialVpnState,
    [Feature.WebRtc]: initialWebRtcState,
    [Feature.Spc]: initialSpcState
   },
   persistedPaths: {
    [Feature.Analytics]: analyticsPersistedPaths,
    [Feature.Vpn]: vpnPersistedPaths,
    [Feature.WebRtc]: webRtcPersistedPaths,
    [Feature.Spc]: spcPersistedPaths
   },
   generators: [ actionGenerators, createAnalyticsActionGenerator(analytics), createVpnActionGenerator(vpn), webRtcActionGenerators(webRtc), createSpcActionGenerator(spc) ]
  };
 }));
}();
