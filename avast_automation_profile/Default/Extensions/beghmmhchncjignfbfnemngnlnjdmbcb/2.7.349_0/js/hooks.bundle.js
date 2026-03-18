/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 29:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ 284:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ _typeof)
/* harmony export */ });
function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

/***/ }),

/***/ 424:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   P: () => (/* binding */ Browser)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(284);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(29);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(901);




var Browser = /*#__PURE__*/function () {
  function Browser() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .A)(this, Browser);
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A)(Browser, null, [{
    key: "getResource",
    value: function getResource(file) {
      return chrome.runtime.getURL(file);
    }
  }, {
    key: "getStorageSync",
    value: function getStorageSync(key) {
      return new Promise(function (resolve, reject) {
        chrome.storage.sync.get(key, function (result) {
          if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .A)(result) === "object" && result[key]) {
            resolve(result[key]);
          } else {
            resolve(null);
          }
        });
      });
    }
  }, {
    key: "setStorageSync",
    value: function setStorageSync(key, data) {
      var _object;

      var object = (_object = {}, _object[key] = data, _object);
      chrome.storage.sync.set(object);
    }
  }, {
    key: "getStorageLocal",
    value: function getStorageLocal(key) {
      return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (result) {
          if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .A)(result) === "object" && result[key]) {
            resolve(result[key]);
          } else {
            resolve(null);
          }
        });
      });
    }
  }, {
    key: "setStorageLocal",
    value: function setStorageLocal(key, data) {
      var _object2;

      var object = (_object2 = {}, _object2[key] = data, _object2);
      chrome.storage.local.set(object);
    }
  }]);

  return Browser;
}();



/***/ }),

/***/ 901:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ _createClass)
/* harmony export */ });
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
var classCallCheck = __webpack_require__(29);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js
var createClass = __webpack_require__(901);
// EXTERNAL MODULE: ./app/utils/Browser.js
var Browser = __webpack_require__(424);
;// ./app/utils/Resource.js




var Resource = /*#__PURE__*/function () {
  function Resource() {
    (0,classCallCheck/* default */.A)(this, Resource);
  }

  (0,createClass/* default */.A)(Resource, null, [{
    key: "get",
    value: function get(file) {
      return Browser/* Browser */.P.getResource(file);
    }
  }, {
    key: "image",
    value: function image(img) {
      return Resource.get("img/".concat(img));
    }
  }]);

  return Resource;
}();


;// ./webpack/customPublicPath.js
/* global __webpack_public_path__ __HOST__ __PORT__ */

/* eslint no-global-assign: 0 camelcase: 0 */

__webpack_require__.p = Resource.get('/js/');
})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
function applyHooksAndFingerprint(args) {
  function updateFingerPrintChanges(args, iframeWindow) {
    if (!iframeWindow && window['__frame_visited_already__'] || iframeWindow && iframeWindow['__frame_visited_already__']) {
      return;
    }

    var functionsHooks = function functionsHooks(_ref, iframeWindow, windowArgs) {
      var _window$funcPrefix;

      var funcPrefix = _ref.funcPrefix,
          HookedFunctionsMap = _ref.HookedFunctionsMap,
          disabledFeatures = _ref.disabledFeatures,
          _ref$canvasFp = _ref.canvasFp,
          canvasFp = _ref$canvasFp === void 0 ? false : _ref$canvasFp,
          _ref$webglFp = _ref.webglFp,
          webglFp = _ref$webglFp === void 0 ? false : _ref$webglFp,
          _ref$plugins = _ref.plugins,
          plugins = _ref$plugins === void 0 ? false : _ref$plugins;
      var randoms = {
        randomArrValue: function randomArrValue(arr) {
          return arr[Math.floor(Math.random() * arr.length)];
        },
        "float": function float(arr) {
          var tmp = [];

          for (var i = 0; i < arr.length; i++) {
            var n = Math.pow(2, arr[i]);
            tmp.push(new Float32Array([1, n]));
          }

          return randoms.randomArrValue(tmp);
        },
        "int": function int(arr) {
          var tmp = [];

          for (var i = 0; i < arr.length; i++) {
            var n = Math.pow(2, arr[i]);
            tmp.push(new Int32Array([1, n]));
          }

          return randoms.randomArrValue(tmp);
        },
        number: function number(arr) {
          var tmp = [];

          for (var i = 0; i < arr.length; i++) {
            tmp.push(Math.pow(2, arr[i]));
          }

          return randoms.randomArrValue(tmp);
        }
      };
      var window = windowArgs;

      if (iframeWindow) {
        window = iframeWindow;
      }

      window[funcPrefix] = (_window$funcPrefix = {}, _window$funcPrefix[HookedFunctionsMap.Canvas] = function (_ref2, originalArgs) {
        var proto = _ref2.proto;

        if (webglFp && (this.getContext('webgl') || this.getContext('experimental-webgl2') || this.getContext('webgl2') || this.getContext('experimental-webgl'))) {
          // Webgl hash faker. A hash is generated by websites from this returned value
          return webglFp;
        }

        if (canvasFp) {
          return canvasFp;
        }

        var width = this.width;
        var height = this.height;
        var context = this.getContext("2d");

        if (context && context.getImageData) {
          var imageData = context.getImageData(0, 0, width, height);

          for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
              var index = i * (width * 4) + j * 4;
              imageData.data[index] = imageData.data[index] + Math.ceil(Math.random() * 10);
              imageData.data[index + 1] = imageData.data[index + 1] + Math.ceil(Math.random() * 10);
              imageData.data[index + 2] = imageData.data[index + 2] + Math.ceil(Math.random() * 10);
              imageData.data[index + 3] = imageData.data[index + 3] + Math.ceil(Math.random() * 10);
            }
          }

          context.putImageData(imageData, 0, 0);
          return proto.apply(this, arguments);
        }
      }, _window$funcPrefix[HookedFunctionsMap.WebGL] = function (_ref3, originalArgs, type) {
        var proto = _ref3.proto;
        var newArgs = [type]; // const unsupportedContexts = ["experimental-webgl", "webgl", "experimental-webgl2", "webgl2"];
        // Blocks webgl completely, resulting in hash of zeroes
        // if (!webglFp && unsupportedContexts.includes((type))) {
        //     notify(name, weight);
        //     console.log("Inside original webgl null");
        //     return null;
        // }

        return proto.call(this, newArgs);
      }, _window$funcPrefix[HookedFunctionsMap.AudioBuffer] = function (_ref4) {
        var proto = _ref4.proto;
        var results = proto.apply(this, arguments);

        for (var i = 0; i < results.length; i += 100) {
          var index = Math.floor(Math.abs(Math.ceil(Math.random() * 10)) * i);
          results[index] += Math.abs(Math.ceil(Math.random() * 10)) * 0.0000001;
        }

        return results;
      }, _window$funcPrefix[HookedFunctionsMap.AudioContext] = function (_ref5, originalArgs, arr) {
        var weight = _ref5.weight,
            name = _ref5.name,
            proto = _ref5.proto,
            notify = _ref5.notify;
        var results = proto.apply(this, [arr]);

        for (var i = 0; i < arr.length; i += 100) {
          var index = Math.floor(Math.abs(Math.ceil(Math.random() * 10)) * i);
          arr[index] = arr[index] + Math.abs(Math.ceil(Math.random() * 10)) * 0.1;
        }

        return results;
      }, _window$funcPrefix[HookedFunctionsMap.Plugins] = function () {
        var allowedPlugins = ["internal-pdf-viewer", "mhjfbmdgcfjbbpaeojofohoefgiehjai", "internal-nacl-plugin", "PepperFlashPlayer.plugin", "pepflashplayer.dll"];
        var privacyPluginArray = {};
        var originalPluginsData = navigator.plugins;
        var pluginsCounter = 0;

        if (plugins !== null) {
          for (var i = 0; i < originalPluginsData.length; i++) {
            if (allowedPlugins.includes(originalPluginsData[i].filename)) {
              privacyPluginArray[pluginsCounter] = originalPluginsData[i];
              privacyPluginArray[originalPluginsData[i].name] = originalPluginsData[i];
              Object.defineProperty(privacyPluginArray, "".concat(pluginsCounter), {
                writable: false,
                enumerable: true,
                configurable: true
              });
              Object.defineProperty(privacyPluginArray, "".concat(originalPluginsData[i].name), {
                writable: false,
                enumerable: false,
                configurable: true
              });
              pluginsCounter++;
            }
          }
        }

        privacyPluginArray.length = pluginsCounter;
        privacyPluginArray.__proto__ = PluginArray.prototype;

        privacyPluginArray.namedItem = function (i) {
          return privacyPluginArray[i];
        };

        return privacyPluginArray;
      }, _window$funcPrefix[HookedFunctionsMap.MediaDevices] = function (_ref6, originalArgs) {
        var proto = _ref6.proto;
        return proto.apply(this, originalArgs).then(function (origDevices) {
          var modifiedDevices = [];
          origDevices.forEach(function (d) {
            var newDevice = {
              deviceId: d.deviceId.toLowerCase() === 'default' ? d.deviceId : d.deviceId.replace(/.$/, Math.abs(Math.ceil(Math.random() * 10))),
              kind: d.kind,
              label: d.label,
              groupId: d.groupId.replace(/.$/, Math.abs(Math.ceil(Math.random() * 10))) + ""
            };
            newDevice.__proto__ = d.__proto__;
            modifiedDevices.push(newDevice);
          });
          return modifiedDevices;
        });
      }, _window$funcPrefix[HookedFunctionsMap.ReadPixels] = function (_ref7, originalArgs) {
        var proto = _ref7.proto;
        var BUFFER_IDX = 6;

        for (var _len = arguments.length, arr = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          arr[_key - 2] = arguments[_key];
        }

        proto.call.apply(proto, [this].concat(arr)); // Altering the first pixel value within the image pixels buffer

        arr[BUFFER_IDX][0] = Math.ceil(Math.random() * 10);
      }, _window$funcPrefix[HookedFunctionsMap.GetShaderPrecisionFormat] = function (_ref8, originalArgs) {
        var proto = _ref8.proto;

        for (var _len2 = arguments.length, arr = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          arr[_key2 - 2] = arguments[_key2];
        }

        var result = proto.call.apply(proto, [this].concat(arr));
        var modifiedResults = {
          rangeMin: Math.ceil(Math.random() * 127),
          rangeMax: Math.ceil(Math.random() * 127),
          precision: result.precision
        };
        modifiedResults.__proto__ = WebGLShaderPrecisionFormat.prototype;
        return modifiedResults;
      }, _window$funcPrefix[HookedFunctionsMap.ClientRects] = function (_ref9, originalArgs) {
        var proto = _ref9.proto;
        var originalRects = proto.apply(this, originalArgs);

        if (!originalRects.length) {
          return originalRects;
        }

        var rects = JSON.parse(JSON.stringify(originalRects[0]));
        var modifiedRects = new DOMRect();
        Object.keys(rects).forEach(function (key) {
          return modifiedRects[key] = rects[key] + Math.random();
        });
        var result = {
          0: modifiedRects,
          length: 1
        };
        result.__proto__ = DOMRectList.prototype;
        return result;
      }, _window$funcPrefix[HookedFunctionsMap.GetParameter] = function (_ref10, originalArgs, arr) {
        var proto = _ref10.proto;
        // proto.call has to be initiated to overcome bot detection
        var value = proto.call(this, arr);
        if (arr === 3415) value = 0;else if (arr === 3414) value = 24;else if (arr === 36348) value = 30;else if (arr === 7936) value = "WebKit";else if (arr === 37445) value = "Google Inc."; // UNMASKED_VENDOR
        else if (arr === 7937) value = "WebKit WebGL";else if (arr === 3379) value = randoms.number([12, 13, 14]);else if (arr === 36347) value = randoms.number([12, 13]);else if (arr === 34076) value = randoms.number([14, 15]);else if (arr === 34024) value = randoms.number([14, 15]);else if (arr === 3386) value = randoms["int"]([13, 14, 15]);else if (arr === 3413) value = randoms.number([1, 2, 3, 4]);else if (arr === 3412) value = randoms.number([1, 2, 3, 4]);else if (arr === 3411) value = randoms.number([1, 2, 3, 4]);else if (arr === 3410) value = randoms.number([1, 2, 3, 4]);else if (arr === 34047) value = randoms.number([1, 2, 3, 4]);else if (arr === 34930) value = randoms.number([1, 2, 3, 4]);else if (arr === 34921) value = randoms.number([1, 2, 3, 4]);else if (arr === 35660) value = randoms.number([1, 2, 3, 4]);else if (arr === 35661) value = randoms.number([4, 5, 6, 7, 8]);else if (arr === 36349) value = randoms.number([10, 11, 12, 13]);else if (arr === 33902) value = randoms["float"]([0, 10, 11, 12, 13]);else if (arr === 33901) value = randoms["float"]([0, 10, 11, 12, 13]);else if (arr === 37446) value = randoms.randomArrValue(["Graphics", "HD Graphics", "Intel(R) HD Graphics"]); // UNMASKED_RENDERER
        else if (arr === 7938) value = randoms.randomArrValue(["WebGL 1.0", "WebGL 1.0 (OpenGL)", "WebGL 1.0 (OpenGL Chromium)"]); // GL_VERSION
        else if (arr === 35724) value = randoms.randomArrValue(["WebGL", "WebGL GLSL", "WebGL GLSL ES", "WebGL GLSL ES (OpenGL Chromium"]); // SHADING_LANGUAGE_VERSION

        return value;
      }, _window$funcPrefix[HookedFunctionsMap.BufferData] = function (_ref11, originalArgs) {
        var proto = _ref11.proto;
        var noise = 0.0001 * Math.random();

        for (var _len3 = arguments.length, arr = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          arr[_key3 - 2] = arguments[_key3];
        }

        arr[1][0] += noise;
        return proto.call.apply(proto, [this].concat(arr));
      }, _window$funcPrefix);

      if (disabledFeatures.includes('*')) {
        delete window[funcPrefix];
      } else {
        disabledFeatures.map(function (feature) {
          return delete window[funcPrefix][feature];
        });
      }
    };

    try {
      functionsHooks(args, iframeWindow, window);
    } catch (e) {
      console.log(e);
    }

    var applyFingerprintAttributes = function applyFingerprintAttributes(_ref12, iframeWindow, windowArgs) {
      var fpAttr = _ref12.fpAttr,
          funcPrefix = _ref12.funcPrefix,
          debug = _ref12.debug,
          t0 = _ref12.t0;
      var FINGERPRINT_DETECTION_THRESHOLD = 0.6;
      var alreadyCalculated = [];
      var fingerprintWeight = 0;
      var alreadyDetected = false;
      var window = windowArgs;

      if (iframeWindow) {
        window = iframeWindow;
      }

      var notifyFingerprintAttempt = function notifyFingerprintAttempt() {
        if (alreadyDetected) return;
        var event = new CustomEvent("fingerprintAttemptDetected", {
          detail: {
            score: fingerprintWeight
          }
        });
        document.dispatchEvent(event);
        alreadyDetected = true;
      };

      var updateFingerprintWeight = function updateFingerprintWeight(prop, weight) {
        if (!alreadyCalculated.includes(prop)) {
          logFunc("[".concat(window.location.hostname, "] Increasing fingerprint weight by ").concat(weight, ", due to ").concat(prop));
          fingerprintWeight += weight;
          alreadyCalculated.push(prop);
          logFunc("[".concat(window.location.hostname, "] Current fingerprint weight is ").concat(fingerprintWeight));
        }

        if (fingerprintWeight >= FINGERPRINT_DETECTION_THRESHOLD) {
          notifyFingerprintAttempt();
        }
      };

      var logFunc = function logFunc() {};

      if (debug) {
        logFunc = console.log;
      }

      var overrideProp = function overrideProp(obj, prop, value) {
        var weight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
        if (!obj || !obj[prop]) return;
        var name = "unknown";

        if (obj && obj.constructor) {
          name = obj.constructor.name;
        }

        logFunc("Hooking ".concat(name, ".").concat(prop, " with value"), value);

        try {
          var descriptor = Object.getOwnPropertyDescriptor(obj, prop);

          if (descriptor !== null && descriptor !== void 0 && descriptor.configurable) {
            Object.defineProperty(obj, "".concat(prop), {
              get: function () {
                updateFingerprintWeight("".concat(name, ".").concat(prop), weight);
                logFunc("".concat(name, ".").concat(prop, " was called, returning value"), value);
                return value;
              }.bind(null)
            });
          } else {
            logFunc("".concat(name, ".").concat(prop, " cannot be reconfigured"));
          }
        } catch (e) {
          logFunc(e);
        }
      };

      var overrideMethod = function overrideMethod(obj, method, value) {
        var weight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
        var func = window[funcPrefix][value];
        if (!func) return;
        if (!obj || !obj[method]) return;
        var proto = obj[method];
        var name = "unknown";

        if (obj && obj.constructor) {
          name = obj.constructor.name;
        }

        logFunc("Hooking ".concat(name, ".").concat(method, " with function ").concat(value));

        try {
          var descriptor = Object.getOwnPropertyDescriptor(obj, method);

          if (descriptor !== null && descriptor !== void 0 && descriptor.configurable) {
            Object.defineProperty(obj, "".concat(method), {
              enumerable: false,
              get: function get() {
                updateFingerprintWeight("".concat(name, ".").concat(method), weight);
                logFunc("".concat(name, ".").concat(method, " was called"));
                return func.bind(this, {
                  proto: proto
                }, arguments).bind(null); // forces toString to display the overriden function content as native code
              }
            });
          } else {
            logFunc("".concat(name, ".").concat(method, " cannot be reconfigured"));
          }
        } catch (e) {
          logFunc(e);
        }
      };

      fpAttr.forEach(function (i) {
        if (window[i.object] && window[i.object][i.property]) {
          if (i.method) {
            overrideMethod(window[i.object][i.property], i.method, i.valueFn, i.weight);
          } else {
            if (i.value || window[funcPrefix] && window[funcPrefix][i.valueFn]) {
              overrideProp(window[i.object], [i.property], i.value || window[funcPrefix][i.valueFn](), i.weight);
            }
          }
        }
      });
      window['__frame_visited_already__'] = true; //Removing traces

      delete window[funcPrefix];

      if (debug) {
        var t1 = performance.now();
        var timeTook = parseFloat(t1 - t0).toFixed(2);
        logFunc("Anti fingerprint module loaded [".concat(timeTook, " milliseconds]"));
      }
    };

    try {
      applyFingerprintAttributes(args, iframeWindow, window);
    } catch (e) {
      console.log(e);
    }
  }

  function checkForIframesToUpdate(args) {
    var iframes = document.getElementsByTagName('iframe');

    if (iframes && iframes.length > 0) {
      for (var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];

        if (iframe.hasAttribute('sandbox')) {
          try {
            var iframeWindow = iframe.contentWindow;
            updateFingerPrintChanges(args, iframeWindow);
          } catch (e) {
            console.error('Error: updating iframe fingerprint properties');
          }
        }
      }
    }
  }

  updateFingerPrintChanges(args);
  checkForIframesToUpdate(args);
}

/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (applyHooksAndFingerprint)));
})();

/******/ })()
;