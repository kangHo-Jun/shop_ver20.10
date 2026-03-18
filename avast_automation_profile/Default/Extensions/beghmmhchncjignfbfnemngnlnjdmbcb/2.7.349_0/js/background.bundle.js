/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 29:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ 207:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(452);


/***/ }),

/***/ 284:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
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

"use strict";
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

/***/ 433:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
    value: true
}));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports["default"] = createBackgroundStore;

var _constants = __webpack_require__(888);

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var store = void 0,
    actions = void 0,
    onDisconnect = void 0;

// eslint-disable-next-line consistent-return
function handleMessage(msg, sender, cb) {
    if (msg.type === _constants.DISPATCH) {
        var _msg$action = msg.action,
            type = _msg$action.type,
            actionData = _objectWithoutProperties(_msg$action, ['type']);

        var action = actions[type];

        if (action) {
            // if action doesn't have any data we should pass "undefined"
            store.dispatch(action(Object.keys(actionData).length ? actionData : undefined));
        } else {
            console.error('Provided in background store "actions" object doesn\'t contain "' + type + '" key.');
        }
    } else if (msg.type === _constants.UPDATE_STATE) {
        cb(store.getState());

        // keep channel open, https://developer.chrome.com/extensions/runtime#event-onMessage
        return true;
    }
}

// allow other parts of the app to reuse the store, e.g. popup
function handleConnection(connection) {
    if (connection.name !== _constants.CONNECTION_NAME) {
        return;
    }

    // send updated state to other parts of the app on every change
    var unsubscribe = store.subscribe(function () {
        connection.postMessage({
            type: _constants.UPDATE_STATE,
            data: store.getState()
        });
    });

    // unsubscribe on disconnect
    connection.onDisconnect.addListener(function () {
        unsubscribe();

        if (onDisconnect) {
            onDisconnect();
        }
    });
}

function createBackgroundStore(options) {
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object' || _typeof(options.store) !== 'object') {
        throw new Error('Expected the "store" to be an object.');
    }

    if (options.hasOwnProperty('actions') && _typeof(options.actions) !== 'object') {
        throw new Error('Expected the "actions" to be an object.');
    }

    if (options.hasOwnProperty('onDisconnect') && typeof options.onDisconnect !== 'function') {
        throw new Error('Expected the "onDisconnect" to be a function.');
    }

    store = options.store;
    actions = options.actions || {};
    onDisconnect = options.onDisconnect;

    chrome.runtime.onConnect.addListener(handleConnection);
    chrome.runtime.onMessage.addListener(handleMessage);

    return store;
}

/***/ }),

/***/ 452:
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),

/***/ 459:
/***/ ((module) => {

"use strict";


function hash(str) {
  var hash = 5381,
      i    = str.length;

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

module.exports = hash;


/***/ }),

/***/ 659:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (applyHooksAndFingerprint);

/***/ }),

/***/ 795:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
    value: true
}));

exports["default"] = function () {
    // connect to "background" store
    var connection = chrome.runtime.connect({ name: _constants.CONNECTION_NAME });

    // listen for changes in the "background" store
    connection.onMessage.addListener(handleMessage);

    // return promise to allow getting current state of "background" store
    return new Promise(function (resolve) {
        chrome.runtime.sendMessage({ type: _constants.UPDATE_STATE }, function (res) {
            state = res;

            // return an object with equivalent to Redux store interface
            resolve({
                subscribe: subscribe,
                dispatch: dispatch,
                getState: getState
            });
        });
    });
};

var _constants = __webpack_require__(888);

var listeners = [];

var state = void 0;

function handleMessage(msg) {
    if (msg.type === _constants.UPDATE_STATE) {
        state = msg.data;

        listeners.forEach(function (l) {
            return l();
        });
    }
}

function subscribe(listener) {
    listeners.push(listener);

    // return unsubscribe function
    return function () {
        listeners = listeners.filter(function (l) {
            return l !== listener;
        });
    };
}

function dispatch(action) {
    // perform an action to change state of "background" store
    chrome.runtime.sendMessage({
        type: _constants.DISPATCH,
        action: action
    });
}

function getState() {
    return state;
}

/***/ }),

/***/ 833:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _backgroundStore = __webpack_require__(433);

Object.defineProperty(exports, "YC", ({
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_backgroundStore).default;
  }
}));

var _uiStore = __webpack_require__(795);

__webpack_unused_export__ = ({
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_uiStore).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 888:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var CONNECTION_NAME = exports.CONNECTION_NAME = 'redux-webext';
var DISPATCH = exports.DISPATCH = '@@STORE_DISPATCH';
var UPDATE_STATE = exports.UPDATE_STATE = '@@STORE_UPDATE_STATE';

/***/ }),

/***/ 901:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

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

// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

;// ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
;// ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}
;// ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}
;// ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
;// ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js




function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
;// ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
;// ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
;// ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js




function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
;// ./node_modules/@babel/runtime/helpers/esm/defineProperty.js
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}
;// ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}
// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(207);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
;// ./node_modules/@babel/runtime/helpers/esm/objectSpread2.js


function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}
;// ./node_modules/redux/es/redux.js


/**
 * Adapted from React: https://github.com/facebook/react/blob/master/packages/shared/formatProdErrorMessage.js
 *
 * Do not require this module directly! Use normal throw error calls. These messages will be replaced with error codes
 * during build.
 * @param {number} code
 */
function formatProdErrorMessage(code) {
  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or " + 'use the non-minified dev environment for full errors. ';
}

// Inlined version of the `symbol-observable` polyfill
var $$observable = (function () {
  return typeof Symbol === 'function' && Symbol.observable || '@@observable';
})();

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var randomString = function randomString() {
  return Math.random().toString(36).substring(7).split('').join('.');
};

var ActionTypes = {
  INIT: "@@redux/INIT" + randomString(),
  REPLACE: "@@redux/REPLACE" + randomString(),
  PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
    return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
  }
};

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  var proto = obj;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

// Inlined / shortened version of `kindOf` from https://github.com/jonschlinkert/kind-of
function miniKindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';
  var type = typeof val;

  switch (type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'symbol':
    case 'function':
      {
        return type;
      }
  }

  if (Array.isArray(val)) return 'array';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  var constructorName = ctorName(val);

  switch (constructorName) {
    case 'Symbol':
    case 'Promise':
    case 'WeakMap':
    case 'WeakSet':
    case 'Map':
    case 'Set':
      return constructorName;
  } // other


  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
}

function ctorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}

function isError(val) {
  return val instanceof Error || typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number';
}

function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === 'function' && typeof val.getDate === 'function' && typeof val.setDate === 'function';
}

function kindOf(val) {
  var typeOfVal = typeof val;

  if (false) // removed by dead control flow
{}

  return typeOfVal;
}

/**
 * @deprecated
 *
 * **We recommend using the `configureStore` method
 * of the `@reduxjs/toolkit` package**, which replaces `createStore`.
 *
 * Redux Toolkit is our recommended approach for writing Redux logic today,
 * including store setup, reducers, data fetching, and more.
 *
 * **For more details, please read this Redux docs page:**
 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
 *
 * `configureStore` from Redux Toolkit is an improved version of `createStore` that
 * simplifies setup and helps avoid common bugs.
 *
 * You should not be using the `redux` core package by itself today, except for learning purposes.
 * The `createStore` method from the core `redux` package will not be removed, but we encourage
 * all users to migrate to using Redux Toolkit for all Redux code.
 *
 * If you want to use `createStore` without this visual deprecation warning, use
 * the `legacy_createStore` import instead:
 *
 * `import { legacy_createStore as createStore} from 'redux'`
 *
 */

function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
    throw new Error( true ? formatProdErrorMessage(0) : 0);
  }

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error( true ? formatProdErrorMessage(1) : 0);
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error( true ? formatProdErrorMessage(2) : 0);
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  /**
   * This makes a shallow copy of currentListeners so we can use
   * nextListeners as a temporary list while dispatching.
   *
   * This prevents any bugs around consumers calling
   * subscribe/unsubscribe in the middle of a dispatch.
   */

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */


  function getState() {
    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(3) : 0);
    }

    return currentState;
  }
  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */


  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error( true ? formatProdErrorMessage(4) : 0);
    }

    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(5) : 0);
    }

    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error( true ? formatProdErrorMessage(6) : 0);
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */


  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error( true ? formatProdErrorMessage(7) : 0);
    }

    if (typeof action.type === 'undefined') {
      throw new Error( true ? formatProdErrorMessage(8) : 0);
    }

    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(9) : 0);
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }
  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */


  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error( true ? formatProdErrorMessage(10) : 0);
    }

    currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.

    dispatch({
      type: ActionTypes.REPLACE
    });
  }
  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */


  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new Error( true ? formatProdErrorMessage(11) : 0);
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe: unsubscribe
        };
      }
    }, _ref[$$observable] = function () {
      return this;
    }, _ref;
  } // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.


  dispatch({
    type: ActionTypes.INIT
  });
  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[$$observable] = observable, _ref2;
}
/**
 * Creates a Redux store that holds the state tree.
 *
 * **We recommend using `configureStore` from the
 * `@reduxjs/toolkit` package**, which replaces `createStore`:
 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
 *
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */

var legacy_createStore = (/* unused pure expression or super */ null && (createStore));

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */


  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
  } catch (e) {} // eslint-disable-line no-empty

}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!isPlainObject(inputState)) {
    return "The " + argumentName + " has unexpected type of \"" + kindOf(inputState) + "\". Expected argument to be an object with the following " + ("keys: \"" + reducerKeys.join('", "') + "\"");
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });
  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });
  if (action && action.type === ActionTypes.REPLACE) return;

  if (unexpectedKeys.length > 0) {
    return "Unexpected " + (unexpectedKeys.length > 1 ? 'keys' : 'key') + " " + ("\"" + unexpectedKeys.join('", "') + "\" found in " + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ("\"" + reducerKeys.join('", "') + "\". Unexpected keys will be ignored.");
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, {
      type: ActionTypes.INIT
    });

    if (typeof initialState === 'undefined') {
      throw new Error( true ? formatProdErrorMessage(12) : 0);
    }

    if (typeof reducer(undefined, {
      type: ActionTypes.PROBE_UNKNOWN_ACTION()
    }) === 'undefined') {
      throw new Error( true ? formatProdErrorMessage(13) : 0);
    }
  });
}
/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */


function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};

  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (false) // removed by dead control flow
{}

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  var finalReducerKeys = Object.keys(finalReducers); // This is used to make sure we don't warn about the same
  // keys multiple times.

  var unexpectedKeyCache;

  if (false) // removed by dead control flow
{}

  var shapeAssertionError;

  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state, action) {
    if (state === void 0) {
      state = {};
    }

    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if (false) // removed by dead control flow
{ var warningMessage; }

    var hasChanged = false;
    var nextState = {};

    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        var actionType = action && action.type;
        throw new Error( true ? formatProdErrorMessage(14) : 0);
      }

      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}

function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}
/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass an action creator as the first argument,
 * and get a dispatch wrapped function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */


function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error( true ? formatProdErrorMessage(16) : 0);
  }

  var boundActionCreators = {};

  for (var key in actionCreators) {
    var actionCreator = actionCreators[key];

    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }

  return boundActionCreators;
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */

function applyMiddleware() {
  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function () {
      var store = createStore.apply(void 0, arguments);

      var _dispatch = function dispatch() {
        throw new Error( true ? formatProdErrorMessage(15) : 0);
      };

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch() {
          return _dispatch.apply(void 0, arguments);
        }
      };
      var chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = compose.apply(void 0, chain)(store.dispatch);
      return _objectSpread2(_objectSpread2({}, store), {}, {
        dispatch: _dispatch
      });
    };
  };
}

/*
 * This is a dummy function to check if the function name has been altered by minification.
 * If the function has been minified and NODE_ENV !== 'production', warn the user.
 */

function isCrushed() {}

if (false) // removed by dead control flow
{}



;// ./app/constants/actions.js
var FINGERPRINT_ATTEMPT_DETECTED = "app::fingerprint_attempt_detected";
var UPDATE_FINGERPRINT_ATTEMPT_COUNTER = "app::update_fingerprint_attempt_counter";
var INCREMENT_FINGERPRINT_ATTEMPTS_DETECTED = "app::increment_fingerprint_attempt_detected";
var TOGGLE_FINGERPRINT_PROTECTION_FOR_DOMAIN = "app::toggle_fingerprint_protection_for_domain";
var TOGGLE_FINGERPRINT_PROTECTION = "app::toggle_fingerprint_protection";
var TOGGLE_SOCIAL_MEDIA_PROTECTION = "app::toggle_social_media_protection_status";
var UPDATE_FINGERPRINT_PROTECTION_STATUS = "app::update_fingerprint_protection_status";
var UPDATE_SOCIAL_MEDIA_PROTECTION_STATUS = "app::update_social_media_protection_status";
;// ./app/reducers/anti.fingerprint.reducer.js


function anti_fingerprint_reducer_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? anti_fingerprint_reducer_ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : anti_fingerprint_reducer_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }


var initialState = {
  detectionAttempts: 0,
  isActive: true
};
/* harmony default export */ const anti_fingerprint_reducer = (function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case INCREMENT_FINGERPRINT_ATTEMPTS_DETECTED:
      return _objectSpread(_objectSpread({}, state), {}, {
        detectionAttempts: state.detectionAttempts + 1
      });

    case UPDATE_FINGERPRINT_ATTEMPT_COUNTER:
      {
        return _objectSpread(_objectSpread({}, state), {}, {
          detectionAttempts: action.data ? action.data : 0
        });
      }

    case UPDATE_FINGERPRINT_PROTECTION_STATUS:
      {
        return _objectSpread(_objectSpread({}, state), {}, {
          isActive: action.data
        });
      }

    default:
      return state;
  }
});
;// ./app/constants/app.js
var Resources = {
  Strings: {},
  Icons: {},
  Animations: {},
  Links: {
    Info: {
      Avast: "https://extension.avastbrowser.com/afp/about/",
      AVG: "https://extension.avgbrowser.com/afp/about/",
      CCleaner: "https://extension.ccleanerbrowser.com/afp/about/"
    }
  },
  PrivacyGuardId: {
    Avast: "onochehmbbbmkaffnheflmfpfjgppblm",
    AVG: "iiapdppbgcanenmhjjoajoiajcapbllj",
    CCleaner: "kkocjjglpnkdgffmmgkfikpbhkhmppca",
    Avira: "mcaijpamjmchiicedbkhglembdphfgkl",
    Norton: "achbgnlchkddjajdjgnfajiheehdjhhl"
  }
};
var StorageKeys = {
  AppSettings: {
    KEY: "settings",
    DISABLED: "disabled",
    WHITELIST: "whitelist",
    NOTIFICATIONS: "notifications",
    IS_ACTIVE: "isActive",
    SOCIAL_MEDIA_DETECTION_PROTECTION: "socialMediaProtection",
    PROFILES: "profiles"
  },
  NOISE: "noise",
  AFPData: {
    KEY: "AFPData",
    FINGERPRINT_ATTEMPTS_DETECTED_COUNTER: "A1"
  },
  CONFIGJSONKEY: "configJsonKey"
};
var Brand = {
  AVAST: "Avast",
  AVG: "AVG",
  CCleaner: "CCleaner"
};
var Strings = {
  APP_NAME: chrome.i18n.getMessage("appName"),
  APP_DESCRIPTION: chrome.i18n.getMessage("appDescription"),
  SETTINGS_SOCIAL_MEDIA_LOGIN_DETECTION_PREVENTION: chrome.i18n.getMessage('settingsSocialMediaLoginDetectionPrevention'),
  SETTINGS_ADVANCED: chrome.i18n.getMessage("settingsAdvanced"),
  POPUP_FINGERPRINT_ATTEMPTS_DETECTED: chrome.i18n.getMessage("popupTotalFingerprintsAttemptsDetected"),
  POPUP_STATUS_ENABLED: chrome.i18n.getMessage("popupStatusEnabled"),
  POPUP_STATUS_DISABLED: chrome.i18n.getMessage("popupStatusDisabled")
};
var HookedFunctionsMap = {
  Canvas: 1,
  WebGL: 2,
  AudioBuffer: 3,
  AudioContext: 4,
  Plugins: 5,
  MediaDevices: 6,
  ReadPixels: 7,
  GetShaderPrecisionFormat: 8,
  ClientRects: 9,
  GetParameter: 10,
  BufferData: 11
};

var FingerprintAttributes = function FingerprintAttributes(profile) {
  return [{
    object: "Element",
    property: "prototype",
    method: "getClientRects",
    valueFn: HookedFunctionsMap.ClientRects,
    weight: 0
  }, {
    object: "HTMLCanvasElement",
    property: "prototype",
    method: "toDataURL",
    valueFn: HookedFunctionsMap.Canvas,
    weight: 0.5
  }, {
    object: "HTMLCanvasElement",
    property: "prototype",
    method: "getImageData",
    valueFn: HookedFunctionsMap.Canvas,
    weight: 0.5
  }, {
    object: "navigator",
    property: "userAgent",
    value: profile.Headers["User-Agent"] || navigator.userAgent
  }, {
    object: "navigator",
    property: "plugins",
    valueFn: HookedFunctionsMap.Plugins,
    weight: 0.3
  }, {
    object: "screen",
    property: "width",
    value: profile.Screen ? profile.Screen.width : screen.width,
    weight: 0
  }, {
    object: "screen",
    property: "height",
    value: profile.Screen ? profile.Screen.height : screen.height,
    weight: 0
  }, {
    object: "navigator",
    property: "vendor",
    value: "Google Inc."
  }, {
    object: "navigator",
    property: "productSub",
    value: "20100101"
  }, {
    object: "AudioBuffer",
    property: "prototype",
    method: "getChannelData",
    valueFn: HookedFunctionsMap.AudioBuffer,
    weight: 0.2
  }, {
    object: "AnalyserNode",
    property: "prototype",
    method: "getFloatFrequencyData",
    valueFn: HookedFunctionsMap.AudioContext,
    weight: 0.2
  }, {
    object: "MediaDevices",
    property: "prototype",
    method: "enumerateDevices",
    valueFn: HookedFunctionsMap.MediaDevices,
    weight: 0.2
  }, {
    object: "WebGL2RenderingContext",
    property: "prototype",
    method: "readPixels",
    valueFn: HookedFunctionsMap.ReadPixels,
    weight: 0.1
  }, {
    object: "WebGL2RenderingContext",
    property: "prototype",
    method: "getShaderPrecisionFormat",
    valueFn: HookedFunctionsMap.GetShaderPrecisionFormat,
    weight: 0.1
  }, {
    object: "WebGLRenderingContext",
    property: "prototype",
    method: "getParameter",
    valueFn: HookedFunctionsMap.GetParameter,
    weight: 0.1
  }, {
    object: "WebGL2RenderingContext",
    property: "prototype",
    method: "getParameter",
    valueFn: HookedFunctionsMap.GetParameter,
    weight: 0.1
  }, {
    object: "WebGL2RenderingContext",
    property: "prototype",
    method: "bufferData",
    valueFn: HookedFunctionsMap.BufferData,
    weight: 0.1
  }, {
    object: "WebGLRenderingContext",
    property: "prototype",
    method: "bufferData",
    valueFn: HookedFunctionsMap.BufferData,
    weight: 0.1
  }];
};

var SHEPERD_CONFIG_DOWNLOAD_ALARM = '2daafb4a-630a-4e14-ac61-5d3bb7f747c4';
var SHEPERD_CONFIG_DOWNLOAD_INTERVAL_IN_MINUTES = 24 * 60; // 24 hours;

var RETRY_SHEPERD_CONFIG_FETCH_INTERVAL_MS = 600000; // 10 * 60000 (10 mins)

var LAST_SHEPERD_CONFIG_FETCHED_TIMESTAMP = "8a5a2771-0b77-4158-aede-30ce39900be6";

;// ./app/constants/profiles.js
var _Profiles;

var ProfileType = {
  Default: 0,
  StrippedUserAgent: 1,
  Paranoid: 2
};
var Profiles = (_Profiles = {}, _Profiles[ProfileType.Default] = {
  Headers: {
    // "User-Agent": navigator.userAgent,
    // "Accept": "text/html,*/*;q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en,de;q=0.9"
  }
}, _Profiles[ProfileType.StrippedUserAgent] = {
  Headers: {
    "User-Agent": navigator.userAgent.match(/(Mozilla.+Safari\/\d{3}\.\d{2})/)[1] || navigator.userAgent
  }
}, _Profiles[ProfileType.Paranoid] = {
  Headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0",
    "Accept": "text/html, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en;q=0.9"
  },
  OmitHeaders: ["DNT"],
  plugins: null,
  Fonts: ["Arial", "Courier", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "LUCIDA GRANDE", "Monaco", "Tahoma", "Times", "Times New Roman", "Verdana", "Wingdings 2", "Wingdings 3"],
  Screen: {
    height: 900,
    width: 1000
  },
  WebGL: null,
  // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAACA0lEQVR4nO3UMQ0AMAzAsPIn3VLYN0WyEeTKLEDE/A4AeGVYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBhWECGYQEZhgVkGBaQYVhAhmEBGYYFZBgWkGFYQIZhARmGBWQYFpBxbV+J5YXpHgwAAAAASUVORK5CYII=",
  Canvas: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB9AAAADICAYAAACwGnoBAAAH6ElEQVR4nO3ZMQEAAAiAMPuXxhh6bAn4mQAAAAAAAACA5joAAAAAAAAAAD4w0AEAAAAAAAAgAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAACoDHQAAAAAAAAAqAx0AAAAAAAAAKgMdAAAAAAAAAKpaV/0C3qz3zKIAAAAASUVORK5CYII="
}, _Profiles);

;// ./app/constants/settings.js
var _DEFAULT_SETTINGS, _DEFAULT_AFP_DATA;



var Settings = {
  DEBUG: "production" !== 'production',
  APP_VERSION: chrome.runtime.getManifest().version,
  DEFAULT_NOISE: {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  },
  DEFAULT_SETTINGS: (_DEFAULT_SETTINGS = {}, _DEFAULT_SETTINGS[StorageKeys.AppSettings.DISABLED] = [], _DEFAULT_SETTINGS[StorageKeys.AppSettings.WHITELIST] = [], _DEFAULT_SETTINGS[StorageKeys.AppSettings.PROFILES] = [], _DEFAULT_SETTINGS[StorageKeys.AppSettings.NOTIFICATIONS] = false, _DEFAULT_SETTINGS[StorageKeys.AppSettings.IS_ACTIVE] = false, _DEFAULT_SETTINGS[StorageKeys.AppSettings.SOCIAL_MEDIA_DETECTION_PROTECTION] = false, _DEFAULT_SETTINGS),
  DEFAULT_AFP_DATA: (_DEFAULT_AFP_DATA = {}, _DEFAULT_AFP_DATA[StorageKeys.AFPData.FINGERPRINT_ATTEMPTS_DETECTED_COUNTER] = 0, _DEFAULT_AFP_DATA),
  MORE_INFO_LINK: Resources.Links.Info["Avast" || 0],
  SHEPHERD_URL: 'https://shepherd.ff.avast.com/?p_pro=150',
  PRIVACY_GUARD_ID: Resources.PrivacyGuardId["Avast" || 0]
};
/* harmony default export */ const settings = (Settings);
;// ./app/reducers/options.reducer.js


function options_reducer_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function options_reducer_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? options_reducer_ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : options_reducer_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }




var options_reducer_initialState = {
  socialMediaProtection: settings.DEFAULT_SETTINGS[StorageKeys.AppSettings.SOCIAL_MEDIA_DETECTION_PROTECTION]
};
/* harmony default export */ const options_reducer = (function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options_reducer_initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case UPDATE_SOCIAL_MEDIA_PROTECTION_STATUS:
      return options_reducer_objectSpread(options_reducer_objectSpread({}, state), {}, {
        socialMediaProtection: action.data
      });

    default:
      return state;
  }
});
;// ./app/reducers/index.js



/* harmony default export */ const reducers = (combineReducers({
  antiFingerprint: anti_fingerprint_reducer,
  options: options_reducer
}));
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
var esm_typeof = __webpack_require__(284);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
var classCallCheck = __webpack_require__(29);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js
var createClass = __webpack_require__(901);
;// ./app/utils/Logger.js




var MessageType = {
  INFO: "Info",
  WARNING: "Warning",
  ERROR: "Error",
  DEBUG: "Debug"
};
var SYMBOL = "AFP";
var SEPARATOR = '-';
var SEPARATOR_COUNT = 260;

var Logger = /*#__PURE__*/function () {
  function Logger() {
    (0,classCallCheck/* default */.A)(this, Logger);
  }

  (0,createClass/* default */.A)(Logger, null, [{
    key: "log",
    value: function log(msg) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MessageType.INFO;
      var title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

      if ((0,esm_typeof/* default */.A)(msg) === 'object') {
        msg = JSON.stringify(msg);
      }

      var date = new Date().toDateString();

      if (title.length > 0) {
        console.log("%c".concat(title, " START %c").concat(SEPARATOR.repeat(SEPARATOR_COUNT - title.length - 2)), 'background: #000; color: #fff', 'background: #000; color: #000');
      }

      console.log("".concat(SYMBOL, " :: ").concat(date, " :: %c").concat(type, "%c ::  %c").concat(msg), Logger.getMessageColor(type), this.getMessageColor(null), "color: #e5e5e5");

      if (title) {
        console.log("%c".concat(title, " END %c").concat(SEPARATOR.repeat(SEPARATOR_COUNT - title.length)), 'background: #000; color: #fff', 'background: #000; color: #000');
      }
    }
  }, {
    key: "debug",
    value: function debug(msg) {
      var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      if (!settings.DEBUG) {
        return;
      }

      this.log(msg, MessageType.DEBUG, title);
    }
  }, {
    key: "info",
    value: function info(msg) {
      this.log(msg, MessageType.INFO);
    }
  }, {
    key: "warn",
    value: function warn(msg) {
      this.log(msg, MessageType.WARNING);
    }
  }, {
    key: "error",
    value: function error(msg) {
      this.log(msg, MessageType.ERROR);
    }
  }, {
    key: "getMessageColor",
    value: function getMessageColor(type) {
      switch (type) {
        case MessageType.INFO:
          return 'color: yellow';

        case MessageType.ERROR:
          return 'color: red';

        case MessageType.WARNING:
          return 'color: #ffad36';

        case MessageType.DEBUG:
          return 'color: green';

        default:
          return 'color: black';
      }
    }
  }]);

  return Logger;
}();

Logger.MessageType = MessageType;

;// ./app/middlwares/burger.js


var burgerMiddleware = function burgerMiddleware(store) {
  return function (next) {
    return function (action) {
      var burgerEntitledEvents = [];

      if (burgerEntitledEvents.includes(action.type)) {
        Logger.debug("Logging burger event ".concat(action.type), Logger.MessageType.INFO); //Burger.append(...)
      }

      next(action);
    };
  };
};


;// ./node_modules/@redux-saga/symbols/dist/redux-saga-symbols.esm.js
var createSymbol = function createSymbol(name) {
  return "@@redux-saga/" + name;
};

var CANCEL =
/*#__PURE__*/
createSymbol('CANCEL_PROMISE');
var CHANNEL_END_TYPE =
/*#__PURE__*/
createSymbol('CHANNEL_END');
var redux_saga_symbols_esm_IO =
/*#__PURE__*/
createSymbol('IO');
var MATCH =
/*#__PURE__*/
createSymbol('MATCH');
var MULTICAST =
/*#__PURE__*/
createSymbol('MULTICAST');
var redux_saga_symbols_esm_SAGA_ACTION =
/*#__PURE__*/
createSymbol('SAGA_ACTION');
var redux_saga_symbols_esm_SELF_CANCELLATION =
/*#__PURE__*/
createSymbol('SELF_CANCELLATION');
var redux_saga_symbols_esm_TASK =
/*#__PURE__*/
createSymbol('TASK');
var TASK_CANCEL =
/*#__PURE__*/
createSymbol('TASK_CANCEL');
var TERMINATE =
/*#__PURE__*/
createSymbol('TERMINATE');
var SAGA_LOCATION =
/*#__PURE__*/
createSymbol('LOCATION');



;// ./node_modules/@babel/runtime/helpers/esm/extends.js
function extends_extends() {
  extends_extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return extends_extends.apply(this, arguments);
}
;// ./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}
;// ./node_modules/@redux-saga/is/dist/redux-saga-is.esm.js


var undef = function undef(v) {
  return v === null || v === undefined;
};
var redux_saga_is_esm_notUndef = function notUndef(v) {
  return v !== null && v !== undefined;
};
var redux_saga_is_esm_func = function func(f) {
  return typeof f === 'function';
};
var number = function number(n) {
  return typeof n === 'number';
};
var redux_saga_is_esm_string = function string(s) {
  return typeof s === 'string';
};
var redux_saga_is_esm_array = Array.isArray;
var redux_saga_is_esm_object = function object(obj) {
  return obj && !redux_saga_is_esm_array(obj) && typeof obj === 'object';
};
var promise = function promise(p) {
  return p && redux_saga_is_esm_func(p.then);
};
var iterator = function iterator(it) {
  return it && redux_saga_is_esm_func(it.next) && redux_saga_is_esm_func(it.throw);
};
var iterable = function iterable(it) {
  return it && redux_saga_is_esm_func(Symbol) ? redux_saga_is_esm_func(it[Symbol.iterator]) : redux_saga_is_esm_array(it);
};
var task = function task(t) {
  return t && t[TASK];
};
var sagaAction = function sagaAction(a) {
  return Boolean(a && a[SAGA_ACTION]);
};
var observable = function observable(ob) {
  return ob && redux_saga_is_esm_func(ob.subscribe);
};
var buffer = function buffer(buf) {
  return buf && redux_saga_is_esm_func(buf.isEmpty) && redux_saga_is_esm_func(buf.take) && redux_saga_is_esm_func(buf.put);
};
var pattern = function pattern(pat) {
  return pat && (redux_saga_is_esm_string(pat) || symbol(pat) || redux_saga_is_esm_func(pat) || redux_saga_is_esm_array(pat) && pat.every(pattern));
};
var channel = function channel(ch) {
  return ch && redux_saga_is_esm_func(ch.take) && redux_saga_is_esm_func(ch.close);
};
var stringableFunc = function stringableFunc(f) {
  return redux_saga_is_esm_func(f) && f.hasOwnProperty('toString');
};
var symbol = function symbol(sym) {
  return Boolean(sym) && typeof Symbol === 'function' && sym.constructor === Symbol && sym !== Symbol.prototype;
};
var multicast = function multicast(ch) {
  return channel(ch) && ch[MULTICAST];
};
var redux_saga_is_esm_effect = function effect(eff) {
  return eff && eff[IO];
};



;// ./node_modules/@redux-saga/core/dist/io-6de156f3.js





var konst = function konst(v) {
  return function () {
    return v;
  };
};
var kTrue =
/*#__PURE__*/
konst(true);

var noop = function noop() {};

if (false) // removed by dead control flow
{}
var identity = function identity(v) {
  return v;
};
var hasSymbol = typeof Symbol === 'function';
var asyncIteratorSymbol = hasSymbol && Symbol.asyncIterator ? Symbol.asyncIterator : '@@asyncIterator';
function io_6de156f3_check(value, predicate, error) {
  if (!predicate(value)) {
    throw new Error(error);
  }
}
var assignWithSymbols = function assignWithSymbols(target, source) {
  extends_extends(target, source);

  if (Object.getOwnPropertySymbols) {
    Object.getOwnPropertySymbols(source).forEach(function (s) {
      target[s] = source[s];
    });
  }
};
var flatMap = function flatMap(mapper, arr) {
  var _ref;

  return (_ref = []).concat.apply(_ref, arr.map(mapper));
};
function remove(array, item) {
  var index = array.indexOf(item);

  if (index >= 0) {
    array.splice(index, 1);
  }
}
function io_6de156f3_once(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }

    called = true;
    fn();
  };
}

var kThrow = function kThrow(err) {
  throw err;
};

var kReturn = function kReturn(value) {
  return {
    value: value,
    done: true
  };
};

function makeIterator(next, thro, name) {
  if (thro === void 0) {
    thro = kThrow;
  }

  if (name === void 0) {
    name = 'iterator';
  }

  var iterator = {
    meta: {
      name: name
    },
    next: next,
    throw: thro,
    return: kReturn,
    isSagaIterator: true
  };

  if (typeof Symbol !== 'undefined') {
    iterator[Symbol.iterator] = function () {
      return iterator;
    };
  }

  return iterator;
}
function logError(error, _ref2) {
  var sagaStack = _ref2.sagaStack;

  /*eslint-disable no-console*/
  console.error(error);
  console.error(sagaStack);
}
var internalErr = function internalErr(err) {
  return new Error("\n  redux-saga: Error checking hooks detected an inconsistent state. This is likely a bug\n  in redux-saga code and not yours. Thanks for reporting this in the project's github repo.\n  Error: " + err + "\n");
};
var createSetContextWarning = function createSetContextWarning(ctx, props) {
  return (ctx ? ctx + '.' : '') + "setContext(props): argument " + props + " is not a plain object";
};
var FROZEN_ACTION_ERROR = "You can't put (a.k.a. dispatch from saga) frozen actions.\nWe have to define a special non-enumerable property on those actions for scheduling purposes.\nOtherwise you wouldn't be able to communicate properly between sagas & other subscribers (action ordering would become far less predictable).\nIf you are using redux and you care about this behaviour (frozen actions),\nthen you might want to switch to freezing actions in a middleware rather than in action creator.\nExample implementation:\n\nconst freezeActions = store => next => action => next(Object.freeze(action))\n"; // creates empty, but not-holey array

var createEmptyArray = function createEmptyArray(n) {
  return Array.apply(null, new Array(n));
};
var wrapSagaDispatch = function wrapSagaDispatch(dispatch) {
  return function (action) {
    if (false) // removed by dead control flow
{}

    return dispatch(Object.defineProperty(action, redux_saga_symbols_esm_SAGA_ACTION, {
      value: true
    }));
  };
};
var shouldTerminate = function shouldTerminate(res) {
  return res === TERMINATE;
};
var shouldCancel = function shouldCancel(res) {
  return res === TASK_CANCEL;
};
var shouldComplete = function shouldComplete(res) {
  return shouldTerminate(res) || shouldCancel(res);
};
function createAllStyleChildCallbacks(shape, parentCallback) {
  var keys = Object.keys(shape);
  var totalCount = keys.length;

  if (false) // removed by dead control flow
{}

  var completedCount = 0;
  var completed;
  var results = redux_saga_is_esm_array(shape) ? createEmptyArray(totalCount) : {};
  var childCallbacks = {};

  function checkEnd() {
    if (completedCount === totalCount) {
      completed = true;
      parentCallback(results);
    }
  }

  keys.forEach(function (key) {
    var chCbAtKey = function chCbAtKey(res, isErr) {
      if (completed) {
        return;
      }

      if (isErr || shouldComplete(res)) {
        parentCallback.cancel();
        parentCallback(res, isErr);
      } else {
        results[key] = res;
        completedCount++;
        checkEnd();
      }
    };

    chCbAtKey.cancel = noop;
    childCallbacks[key] = chCbAtKey;
  });

  parentCallback.cancel = function () {
    if (!completed) {
      completed = true;
      keys.forEach(function (key) {
        return childCallbacks[key].cancel();
      });
    }
  };

  return childCallbacks;
}
function getMetaInfo(fn) {
  return {
    name: fn.name || 'anonymous',
    location: getLocation(fn)
  };
}
function getLocation(instrumented) {
  return instrumented[SAGA_LOCATION];
}

var BUFFER_OVERFLOW = "Channel's Buffer overflow!";
var ON_OVERFLOW_THROW = 1;
var ON_OVERFLOW_DROP = 2;
var ON_OVERFLOW_SLIDE = 3;
var ON_OVERFLOW_EXPAND = 4;
var zeroBuffer = {
  isEmpty: kTrue,
  put: noop,
  take: noop
};

function ringBuffer(limit, overflowAction) {
  if (limit === void 0) {
    limit = 10;
  }

  var arr = new Array(limit);
  var length = 0;
  var pushIndex = 0;
  var popIndex = 0;

  var push = function push(it) {
    arr[pushIndex] = it;
    pushIndex = (pushIndex + 1) % limit;
    length++;
  };

  var take = function take() {
    if (length != 0) {
      var it = arr[popIndex];
      arr[popIndex] = null;
      length--;
      popIndex = (popIndex + 1) % limit;
      return it;
    }
  };

  var flush = function flush() {
    var items = [];

    while (length) {
      items.push(take());
    }

    return items;
  };

  return {
    isEmpty: function isEmpty() {
      return length == 0;
    },
    put: function put(it) {
      if (length < limit) {
        push(it);
      } else {
        var doubledLimit;

        switch (overflowAction) {
          case ON_OVERFLOW_THROW:
            throw new Error(BUFFER_OVERFLOW);

          case ON_OVERFLOW_SLIDE:
            arr[pushIndex] = it;
            pushIndex = (pushIndex + 1) % limit;
            popIndex = pushIndex;
            break;

          case ON_OVERFLOW_EXPAND:
            doubledLimit = 2 * limit;
            arr = flush();
            length = arr.length;
            pushIndex = arr.length;
            popIndex = 0;
            arr.length = doubledLimit;
            limit = doubledLimit;
            push(it);
            break;

          default: // DROP

        }
      }
    },
    take: take,
    flush: flush
  };
}

var io_6de156f3_none = function none() {
  return zeroBuffer;
};
var fixed = function fixed(limit) {
  return ringBuffer(limit, ON_OVERFLOW_THROW);
};
var dropping = function dropping(limit) {
  return ringBuffer(limit, ON_OVERFLOW_DROP);
};
var io_6de156f3_sliding = function sliding(limit) {
  return ringBuffer(limit, ON_OVERFLOW_SLIDE);
};
var expanding = function expanding(initialSize) {
  return ringBuffer(initialSize, ON_OVERFLOW_EXPAND);
};

var buffers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  none: io_6de156f3_none,
  fixed: fixed,
  dropping: dropping,
  sliding: io_6de156f3_sliding,
  expanding: expanding
});

var TAKE = 'TAKE';
var PUT = 'PUT';
var ALL = 'ALL';
var RACE = 'RACE';
var CALL = 'CALL';
var CPS = 'CPS';
var FORK = 'FORK';
var JOIN = 'JOIN';
var io_6de156f3_CANCEL = 'CANCEL';
var SELECT = 'SELECT';
var ACTION_CHANNEL = 'ACTION_CHANNEL';
var CANCELLED = 'CANCELLED';
var FLUSH = 'FLUSH';
var GET_CONTEXT = 'GET_CONTEXT';
var SET_CONTEXT = 'SET_CONTEXT';

var effectTypes = /*#__PURE__*/Object.freeze({
  __proto__: null,
  TAKE: TAKE,
  PUT: PUT,
  ALL: ALL,
  RACE: RACE,
  CALL: CALL,
  CPS: CPS,
  FORK: FORK,
  JOIN: JOIN,
  CANCEL: io_6de156f3_CANCEL,
  SELECT: SELECT,
  ACTION_CHANNEL: ACTION_CHANNEL,
  CANCELLED: CANCELLED,
  FLUSH: FLUSH,
  GET_CONTEXT: GET_CONTEXT,
  SET_CONTEXT: SET_CONTEXT
});

var TEST_HINT = '\n(HINT: if you are getting these errors in tests, consider using createMockTask from @redux-saga/testing-utils)';

var makeEffect = function makeEffect(type, payload) {
  var _ref;

  return _ref = {}, _ref[redux_saga_symbols_esm_IO] = true, _ref.combinator = false, _ref.type = type, _ref.payload = payload, _ref;
};

var isForkEffect = function isForkEffect(eff) {
  return effect(eff) && eff.type === FORK;
};

var detach = function detach(eff) {
  if (false) // removed by dead control flow
{}

  return makeEffect(FORK, _extends({}, eff.payload, {
    detached: true
  }));
};
function io_6de156f3_take(patternOrChannel, multicastPattern) {
  if (patternOrChannel === void 0) {
    patternOrChannel = '*';
  }

  if (false) // removed by dead control flow
{}

  if (pattern(patternOrChannel)) {
    return makeEffect(TAKE, {
      pattern: patternOrChannel
    });
  }

  if (multicast(patternOrChannel) && redux_saga_is_esm_notUndef(multicastPattern) && pattern(multicastPattern)) {
    return makeEffect(TAKE, {
      channel: patternOrChannel,
      pattern: multicastPattern
    });
  }

  if (channel(patternOrChannel)) {
    return makeEffect(TAKE, {
      channel: patternOrChannel
    });
  }

  if (false) // removed by dead control flow
{}
}
var takeMaybe = function takeMaybe() {
  var eff = io_6de156f3_take.apply(void 0, arguments);
  eff.payload.maybe = true;
  return eff;
};
function put(channel$1, action) {
  if (false) // removed by dead control flow
{}

  if (undef(action)) {
    action = channel$1; // `undefined` instead of `null` to make default parameter work

    channel$1 = undefined;
  }

  return makeEffect(PUT, {
    channel: channel$1,
    action: action
  });
}
var putResolve = function putResolve() {
  var eff = put.apply(void 0, arguments);
  eff.payload.resolve = true;
  return eff;
};
function io_6de156f3_all(effects) {
  var eff = makeEffect(ALL, effects);
  eff.combinator = true;
  return eff;
}
function io_6de156f3_race(effects) {
  var eff = makeEffect(RACE, effects);
  eff.combinator = true;
  return eff;
} // this match getFnCallDescriptor logic

var validateFnDescriptor = function validateFnDescriptor(effectName, fnDescriptor) {
  io_6de156f3_check(fnDescriptor, notUndef, effectName + ": argument fn is undefined or null");

  if (func(fnDescriptor)) {
    return;
  }

  var context = null;
  var fn;

  if (array(fnDescriptor)) {
    context = fnDescriptor[0];
    fn = fnDescriptor[1];
    io_6de156f3_check(fn, notUndef, effectName + ": argument of type [context, fn] has undefined or null `fn`");
  } else if (object(fnDescriptor)) {
    context = fnDescriptor.context;
    fn = fnDescriptor.fn;
    io_6de156f3_check(fn, notUndef, effectName + ": argument of type {context, fn} has undefined or null `fn`");
  } else {
    io_6de156f3_check(fnDescriptor, func, effectName + ": argument fn is not function");
    return;
  }

  if (context && string(fn)) {
    io_6de156f3_check(context[fn], func, effectName + ": context arguments has no such method - \"" + fn + "\"");
    return;
  }

  io_6de156f3_check(fn, func, effectName + ": unpacked fn argument (from [context, fn] or {context, fn}) is not a function");
};

function getFnCallDescriptor(fnDescriptor, args) {
  var context = null;
  var fn;

  if (redux_saga_is_esm_func(fnDescriptor)) {
    fn = fnDescriptor;
  } else {
    if (redux_saga_is_esm_array(fnDescriptor)) {
      context = fnDescriptor[0];
      fn = fnDescriptor[1];
    } else {
      context = fnDescriptor.context;
      fn = fnDescriptor.fn;
    }

    if (context && redux_saga_is_esm_string(fn) && redux_saga_is_esm_func(context[fn])) {
      fn = context[fn];
    }
  }

  return {
    context: context,
    fn: fn,
    args: args
  };
}

var isNotDelayEffect = function isNotDelayEffect(fn) {
  return fn !== io_6de156f3_delay;
};

function io_6de156f3_call(fnDescriptor) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (false) // removed by dead control flow
{ var arg0; }

  return makeEffect(CALL, getFnCallDescriptor(fnDescriptor, args));
}
function apply(context, fn, args) {
  if (args === void 0) {
    args = [];
  }

  var fnDescriptor = [context, fn];

  if (false) // removed by dead control flow
{}

  return makeEffect(CALL, getFnCallDescriptor([context, fn], args));
}
function cps(fnDescriptor) {
  if (false) // removed by dead control flow
{}

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return makeEffect(CPS, getFnCallDescriptor(fnDescriptor, args));
}
function io_6de156f3_fork(fnDescriptor) {
  if (false) // removed by dead control flow
{}

  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }

  return makeEffect(FORK, getFnCallDescriptor(fnDescriptor, args));
}
function spawn(fnDescriptor) {
  if (false) // removed by dead control flow
{}

  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  return detach(io_6de156f3_fork.apply(void 0, [fnDescriptor].concat(args)));
}
function join(taskOrTasks) {
  if (false) // removed by dead control flow
{}

  return makeEffect(JOIN, taskOrTasks);
}
function io_6de156f3_cancel(taskOrTasks) {
  if (taskOrTasks === void 0) {
    taskOrTasks = SELF_CANCELLATION;
  }

  if (false) // removed by dead control flow
{}

  return makeEffect(io_6de156f3_CANCEL, taskOrTasks);
}
function io_6de156f3_select(selector) {
  if (selector === void 0) {
    selector = identity;
  }

  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  if (false) // removed by dead control flow
{}

  return makeEffect(SELECT, {
    selector: selector,
    args: args
  });
}
/**
  channel(pattern, [buffer])    => creates a proxy channel for store actions
**/

function io_6de156f3_actionChannel(pattern$1, buffer$1) {
  if (false) // removed by dead control flow
{}

  return makeEffect(ACTION_CHANNEL, {
    pattern: pattern$1,
    buffer: buffer$1
  });
}
function cancelled() {
  return makeEffect(CANCELLED, {});
}
function flush(channel$1) {
  if (false) // removed by dead control flow
{}

  return makeEffect(FLUSH, channel$1);
}
function getContext(prop) {
  if (false) // removed by dead control flow
{}

  return makeEffect(GET_CONTEXT, prop);
}
function setContext(props) {
  if (false) // removed by dead control flow
{}

  return makeEffect(SET_CONTEXT, props);
}
var io_6de156f3_delay =
/*#__PURE__*/
(/* unused pure expression or super */ null && (io_6de156f3_call.bind(null, delayP)));



;// ./node_modules/@redux-saga/deferred/dist/redux-saga-deferred.esm.js
function deferred() {
  var def = {};
  def.promise = new Promise(function (resolve, reject) {
    def.resolve = resolve;
    def.reject = reject;
  });
  return def;
}
function arrayOfDeferred(length) {
  var arr = [];

  for (var i = 0; i < length; i++) {
    arr.push(deferred());
  }

  return arr;
}

/* harmony default export */ const redux_saga_deferred_esm = (deferred);


;// ./node_modules/@redux-saga/core/dist/redux-saga-core.esm.js











var queue = [];
/**
  Variable to hold a counting semaphore
  - Incrementing adds a lock and puts the scheduler in a `suspended` state (if it's not
    already suspended)
  - Decrementing releases a lock. Zero locks puts the scheduler in a `released` state. This
    triggers flushing the queued tasks.
**/

var semaphore = 0;
/**
  Executes a task 'atomically'. Tasks scheduled during this execution will be queued
  and flushed after this task has finished (assuming the scheduler endup in a released
  state).
**/

function exec(task) {
  try {
    suspend();
    task();
  } finally {
    release();
  }
}
/**
  Executes or queues a task depending on the state of the scheduler (`suspended` or `released`)
**/


function asap(task) {
  queue.push(task);

  if (!semaphore) {
    suspend();
    redux_saga_core_esm_flush();
  }
}
/**
 * Puts the scheduler in a `suspended` state and executes a task immediately.
 */

function immediately(task) {
  try {
    suspend();
    return task();
  } finally {
    redux_saga_core_esm_flush();
  }
}
/**
  Puts the scheduler in a `suspended` state. Scheduled tasks will be queued until the
  scheduler is released.
**/

function suspend() {
  semaphore++;
}
/**
  Puts the scheduler in a `released` state.
**/


function release() {
  semaphore--;
}
/**
  Releases the current lock. Executes all queued tasks if the scheduler is in the released state.
**/


function redux_saga_core_esm_flush() {
  release();
  var task;

  while (!semaphore && (task = queue.shift()) !== undefined) {
    exec(task);
  }
}

var redux_saga_core_esm_array = function array(patterns) {
  return function (input) {
    return patterns.some(function (p) {
      return matcher(p)(input);
    });
  };
};
var predicate = function predicate(_predicate) {
  return function (input) {
    return _predicate(input);
  };
};
var redux_saga_core_esm_string = function string(pattern) {
  return function (input) {
    return input.type === String(pattern);
  };
};
var redux_saga_core_esm_symbol = function symbol(pattern) {
  return function (input) {
    return input.type === pattern;
  };
};
var wildcard = function wildcard() {
  return kTrue;
};
function matcher(pattern) {
  // prettier-ignore
  var matcherCreator = pattern === '*' ? wildcard : redux_saga_is_esm_string(pattern) ? redux_saga_core_esm_string : redux_saga_is_esm_array(pattern) ? redux_saga_core_esm_array : stringableFunc(pattern) ? redux_saga_core_esm_string : redux_saga_is_esm_func(pattern) ? predicate : symbol(pattern) ? redux_saga_core_esm_symbol : null;

  if (matcherCreator === null) {
    throw new Error("invalid pattern: " + pattern);
  }

  return matcherCreator(pattern);
}

var END = {
  type: CHANNEL_END_TYPE
};
var isEnd = function isEnd(a) {
  return a && a.type === CHANNEL_END_TYPE;
};
var CLOSED_CHANNEL_WITH_TAKERS = 'Cannot have a closed channel with pending takers';
var INVALID_BUFFER = 'invalid buffer passed to channel factory function';
var UNDEFINED_INPUT_ERROR = "Saga or channel was provided with an undefined action\nHints:\n  - check that your Action Creator returns a non-undefined value\n  - if the Saga was started using runSaga, check that your subscribe source provides the action to its listeners";
function redux_saga_core_esm_channel(buffer$1) {
  if (buffer$1 === void 0) {
    buffer$1 = expanding();
  }

  var closed = false;
  var takers = [];

  if (false) // removed by dead control flow
{}

  function checkForbiddenStates() {
    if (closed && takers.length) {
      throw internalErr(CLOSED_CHANNEL_WITH_TAKERS);
    }

    if (takers.length && !buffer$1.isEmpty()) {
      throw internalErr('Cannot have pending takers with non empty buffer');
    }
  }

  function put(input) {
    if (false) // removed by dead control flow
{}

    if (closed) {
      return;
    }

    if (takers.length === 0) {
      return buffer$1.put(input);
    }

    var cb = takers.shift();
    cb(input);
  }

  function take(cb) {
    if (false) // removed by dead control flow
{}

    if (closed && buffer$1.isEmpty()) {
      cb(END);
    } else if (!buffer$1.isEmpty()) {
      cb(buffer$1.take());
    } else {
      takers.push(cb);

      cb.cancel = function () {
        remove(takers, cb);
      };
    }
  }

  function flush(cb) {
    if (false) // removed by dead control flow
{}

    if (closed && buffer$1.isEmpty()) {
      cb(END);
      return;
    }

    cb(buffer$1.flush());
  }

  function close() {
    if (false) // removed by dead control flow
{}

    if (closed) {
      return;
    }

    closed = true;
    var arr = takers;
    takers = [];

    for (var i = 0, len = arr.length; i < len; i++) {
      var taker = arr[i];
      taker(END);
    }
  }

  return {
    take: take,
    put: put,
    flush: flush,
    close: close
  };
}
function eventChannel(subscribe, buffer) {
  if (buffer === void 0) {
    buffer = none();
  }

  var closed = false;
  var unsubscribe;
  var chan = redux_saga_core_esm_channel(buffer);

  var close = function close() {
    if (closed) {
      return;
    }

    closed = true;

    if (func(unsubscribe)) {
      unsubscribe();
    }

    chan.close();
  };

  unsubscribe = subscribe(function (input) {
    if (isEnd(input)) {
      close();
      return;
    }

    chan.put(input);
  });

  if (false) // removed by dead control flow
{}

  unsubscribe = once(unsubscribe);

  if (closed) {
    unsubscribe();
  }

  return {
    take: chan.take,
    flush: chan.flush,
    close: close
  };
}
function multicastChannel() {
  var _ref;

  var closed = false;
  var currentTakers = [];
  var nextTakers = currentTakers;

  function checkForbiddenStates() {
    if (closed && nextTakers.length) {
      throw internalErr(CLOSED_CHANNEL_WITH_TAKERS);
    }
  }

  var ensureCanMutateNextTakers = function ensureCanMutateNextTakers() {
    if (nextTakers !== currentTakers) {
      return;
    }

    nextTakers = currentTakers.slice();
  };

  var close = function close() {
    if (false) // removed by dead control flow
{}

    closed = true;
    var takers = currentTakers = nextTakers;
    nextTakers = [];
    takers.forEach(function (taker) {
      taker(END);
    });
  };

  return _ref = {}, _ref[MULTICAST] = true, _ref.put = function put(input) {
    if (false) // removed by dead control flow
{}

    if (closed) {
      return;
    }

    if (isEnd(input)) {
      close();
      return;
    }

    var takers = currentTakers = nextTakers;

    for (var i = 0, len = takers.length; i < len; i++) {
      var taker = takers[i];

      if (taker[MATCH](input)) {
        taker.cancel();
        taker(input);
      }
    }
  }, _ref.take = function take(cb, matcher) {
    if (matcher === void 0) {
      matcher = wildcard;
    }

    if (false) // removed by dead control flow
{}

    if (closed) {
      cb(END);
      return;
    }

    cb[MATCH] = matcher;
    ensureCanMutateNextTakers();
    nextTakers.push(cb);
    cb.cancel = io_6de156f3_once(function () {
      ensureCanMutateNextTakers();
      remove(nextTakers, cb);
    });
  }, _ref.close = close, _ref;
}
function stdChannel() {
  var chan = multicastChannel();
  var put = chan.put;

  chan.put = function (input) {
    if (input[redux_saga_symbols_esm_SAGA_ACTION]) {
      put(input);
      return;
    }

    asap(function () {
      put(input);
    });
  };

  return chan;
}

var RUNNING = 0;
var redux_saga_core_esm_CANCELLED = 1;
var ABORTED = 2;
var DONE = 3;

function resolvePromise(promise, cb) {
  var cancelPromise = promise[CANCEL];

  if (redux_saga_is_esm_func(cancelPromise)) {
    cb.cancel = cancelPromise;
  }

  promise.then(cb, function (error) {
    cb(error, true);
  });
}

var current = 0;
var nextSagaId = (function () {
  return ++current;
});

var _effectRunnerMap;

function getIteratorMetaInfo(iterator, fn) {
  if (iterator.isSagaIterator) {
    return {
      name: iterator.meta.name
    };
  }

  return getMetaInfo(fn);
}

function createTaskIterator(_ref) {
  var context = _ref.context,
      fn = _ref.fn,
      args = _ref.args;

  // catch synchronous failures; see #152 and #441
  try {
    var result = fn.apply(context, args); // i.e. a generator function returns an iterator

    if (iterator(result)) {
      return result;
    }

    var resolved = false;

    var next = function next(arg) {
      if (!resolved) {
        resolved = true; // Only promises returned from fork will be interpreted. See #1573

        return {
          value: result,
          done: !promise(result)
        };
      } else {
        return {
          value: arg,
          done: true
        };
      }
    };

    return makeIterator(next);
  } catch (err) {
    // do not bubble up synchronous failures for detached forks
    // instead create a failed task. See #152 and #441
    return makeIterator(function () {
      throw err;
    });
  }
}

function runPutEffect(env, _ref2, cb) {
  var channel = _ref2.channel,
      action = _ref2.action,
      resolve = _ref2.resolve;

  /**
   Schedule the put in case another saga is holding a lock.
   The put will be executed atomically. ie nested puts will execute after
   this put has terminated.
   **/
  asap(function () {
    var result;

    try {
      result = (channel ? channel.put : env.dispatch)(action);
    } catch (error) {
      cb(error, true);
      return;
    }

    if (resolve && promise(result)) {
      resolvePromise(result, cb);
    } else {
      cb(result);
    }
  }); // Put effects are non cancellables
}

function runTakeEffect(env, _ref3, cb) {
  var _ref3$channel = _ref3.channel,
      channel = _ref3$channel === void 0 ? env.channel : _ref3$channel,
      pattern = _ref3.pattern,
      maybe = _ref3.maybe;

  var takeCb = function takeCb(input) {
    if (input instanceof Error) {
      cb(input, true);
      return;
    }

    if (isEnd(input) && !maybe) {
      cb(TERMINATE);
      return;
    }

    cb(input);
  };

  try {
    channel.take(takeCb, redux_saga_is_esm_notUndef(pattern) ? matcher(pattern) : null);
  } catch (err) {
    cb(err, true);
    return;
  }

  cb.cancel = takeCb.cancel;
}

function runCallEffect(env, _ref4, cb, _ref5) {
  var context = _ref4.context,
      fn = _ref4.fn,
      args = _ref4.args;
  var task = _ref5.task;

  // catch synchronous failures; see #152
  try {
    var result = fn.apply(context, args);

    if (promise(result)) {
      resolvePromise(result, cb);
      return;
    }

    if (iterator(result)) {
      // resolve iterator
      proc(env, result, task.context, current, getMetaInfo(fn),
      /* isRoot */
      false, cb);
      return;
    }

    cb(result);
  } catch (error) {
    cb(error, true);
  }
}

function runCPSEffect(env, _ref6, cb) {
  var context = _ref6.context,
      fn = _ref6.fn,
      args = _ref6.args;

  // CPS (ie node style functions) can define their own cancellation logic
  // by setting cancel field on the cb
  // catch synchronous failures; see #152
  try {
    var cpsCb = function cpsCb(err, res) {
      if (undef(err)) {
        cb(res);
      } else {
        cb(err, true);
      }
    };

    fn.apply(context, args.concat(cpsCb));

    if (cpsCb.cancel) {
      cb.cancel = cpsCb.cancel;
    }
  } catch (error) {
    cb(error, true);
  }
}

function runForkEffect(env, _ref7, cb, _ref8) {
  var context = _ref7.context,
      fn = _ref7.fn,
      args = _ref7.args,
      detached = _ref7.detached;
  var parent = _ref8.task;
  var taskIterator = createTaskIterator({
    context: context,
    fn: fn,
    args: args
  });
  var meta = getIteratorMetaInfo(taskIterator, fn);
  immediately(function () {
    var child = proc(env, taskIterator, parent.context, current, meta, detached, undefined);

    if (detached) {
      cb(child);
    } else {
      if (child.isRunning()) {
        parent.queue.addTask(child);
        cb(child);
      } else if (child.isAborted()) {
        parent.queue.abort(child.error());
      } else {
        cb(child);
      }
    }
  }); // Fork effects are non cancellables
}

function runJoinEffect(env, taskOrTasks, cb, _ref9) {
  var task = _ref9.task;

  var joinSingleTask = function joinSingleTask(taskToJoin, cb) {
    if (taskToJoin.isRunning()) {
      var joiner = {
        task: task,
        cb: cb
      };

      cb.cancel = function () {
        if (taskToJoin.isRunning()) remove(taskToJoin.joiners, joiner);
      };

      taskToJoin.joiners.push(joiner);
    } else {
      if (taskToJoin.isAborted()) {
        cb(taskToJoin.error(), true);
      } else {
        cb(taskToJoin.result());
      }
    }
  };

  if (redux_saga_is_esm_array(taskOrTasks)) {
    if (taskOrTasks.length === 0) {
      cb([]);
      return;
    }

    var childCallbacks = createAllStyleChildCallbacks(taskOrTasks, cb);
    taskOrTasks.forEach(function (t, i) {
      joinSingleTask(t, childCallbacks[i]);
    });
  } else {
    joinSingleTask(taskOrTasks, cb);
  }
}

function cancelSingleTask(taskToCancel) {
  if (taskToCancel.isRunning()) {
    taskToCancel.cancel();
  }
}

function runCancelEffect(env, taskOrTasks, cb, _ref10) {
  var task = _ref10.task;

  if (taskOrTasks === redux_saga_symbols_esm_SELF_CANCELLATION) {
    cancelSingleTask(task);
  } else if (redux_saga_is_esm_array(taskOrTasks)) {
    taskOrTasks.forEach(cancelSingleTask);
  } else {
    cancelSingleTask(taskOrTasks);
  }

  cb(); // cancel effects are non cancellables
}

function runAllEffect(env, effects, cb, _ref11) {
  var digestEffect = _ref11.digestEffect;
  var effectId = current;
  var keys = Object.keys(effects);

  if (keys.length === 0) {
    cb(redux_saga_is_esm_array(effects) ? [] : {});
    return;
  }

  var childCallbacks = createAllStyleChildCallbacks(effects, cb);
  keys.forEach(function (key) {
    digestEffect(effects[key], effectId, childCallbacks[key], key);
  });
}

function runRaceEffect(env, effects, cb, _ref12) {
  var digestEffect = _ref12.digestEffect;
  var effectId = current;
  var keys = Object.keys(effects);
  var response = redux_saga_is_esm_array(effects) ? createEmptyArray(keys.length) : {};
  var childCbs = {};
  var completed = false;
  keys.forEach(function (key) {
    var chCbAtKey = function chCbAtKey(res, isErr) {
      if (completed) {
        return;
      }

      if (isErr || shouldComplete(res)) {
        // Race Auto cancellation
        cb.cancel();
        cb(res, isErr);
      } else {
        cb.cancel();
        completed = true;
        response[key] = res;
        cb(response);
      }
    };

    chCbAtKey.cancel = noop;
    childCbs[key] = chCbAtKey;
  });

  cb.cancel = function () {
    // prevents unnecessary cancellation
    if (!completed) {
      completed = true;
      keys.forEach(function (key) {
        return childCbs[key].cancel();
      });
    }
  };

  keys.forEach(function (key) {
    if (completed) {
      return;
    }

    digestEffect(effects[key], effectId, childCbs[key], key);
  });
}

function runSelectEffect(env, _ref13, cb) {
  var selector = _ref13.selector,
      args = _ref13.args;

  try {
    var state = selector.apply(void 0, [env.getState()].concat(args));
    cb(state);
  } catch (error) {
    cb(error, true);
  }
}

function runChannelEffect(env, _ref14, cb) {
  var pattern = _ref14.pattern,
      buffer = _ref14.buffer;
  var chan = redux_saga_core_esm_channel(buffer);
  var match = matcher(pattern);

  var taker = function taker(action) {
    if (!isEnd(action)) {
      env.channel.take(taker, match);
    }

    chan.put(action);
  };

  var close = chan.close;

  chan.close = function () {
    taker.cancel();
    close();
  };

  env.channel.take(taker, match);
  cb(chan);
}

function runCancelledEffect(env, data, cb, _ref15) {
  var task = _ref15.task;
  cb(task.isCancelled());
}

function runFlushEffect(env, channel, cb) {
  channel.flush(cb);
}

function runGetContextEffect(env, prop, cb, _ref16) {
  var task = _ref16.task;
  cb(task.context[prop]);
}

function runSetContextEffect(env, props, cb, _ref17) {
  var task = _ref17.task;
  assignWithSymbols(task.context, props);
  cb();
}

var effectRunnerMap = (_effectRunnerMap = {}, _effectRunnerMap[TAKE] = runTakeEffect, _effectRunnerMap[PUT] = runPutEffect, _effectRunnerMap[ALL] = runAllEffect, _effectRunnerMap[RACE] = runRaceEffect, _effectRunnerMap[CALL] = runCallEffect, _effectRunnerMap[CPS] = runCPSEffect, _effectRunnerMap[FORK] = runForkEffect, _effectRunnerMap[JOIN] = runJoinEffect, _effectRunnerMap[io_6de156f3_CANCEL] = runCancelEffect, _effectRunnerMap[SELECT] = runSelectEffect, _effectRunnerMap[ACTION_CHANNEL] = runChannelEffect, _effectRunnerMap[CANCELLED] = runCancelledEffect, _effectRunnerMap[FLUSH] = runFlushEffect, _effectRunnerMap[GET_CONTEXT] = runGetContextEffect, _effectRunnerMap[SET_CONTEXT] = runSetContextEffect, _effectRunnerMap);

/**
 Used to track a parent task and its forks
 In the fork model, forked tasks are attached by default to their parent
 We model this using the concept of Parent task && main Task
 main task is the main flow of the current Generator, the parent tasks is the
 aggregation of the main tasks + all its forked tasks.
 Thus the whole model represents an execution tree with multiple branches (vs the
 linear execution tree in sequential (non parallel) programming)

 A parent tasks has the following semantics
 - It completes if all its forks either complete or all cancelled
 - If it's cancelled, all forks are cancelled as well
 - It aborts if any uncaught error bubbles up from forks
 - If it completes, the return value is the one returned by the main task
 **/

function forkQueue(mainTask, onAbort, cont) {
  var tasks = [];
  var result;
  var completed = false;
  addTask(mainTask);

  var getTasks = function getTasks() {
    return tasks;
  };

  function abort(err) {
    onAbort();
    cancelAll();
    cont(err, true);
  }

  function addTask(task) {
    tasks.push(task);

    task.cont = function (res, isErr) {
      if (completed) {
        return;
      }

      remove(tasks, task);
      task.cont = noop;

      if (isErr) {
        abort(res);
      } else {
        if (task === mainTask) {
          result = res;
        }

        if (!tasks.length) {
          completed = true;
          cont(result);
        }
      }
    };
  }

  function cancelAll() {
    if (completed) {
      return;
    }

    completed = true;
    tasks.forEach(function (t) {
      t.cont = noop;
      t.cancel();
    });
    tasks = [];
  }

  return {
    addTask: addTask,
    cancelAll: cancelAll,
    abort: abort,
    getTasks: getTasks
  };
}

// there can be only a single saga error created at any given moment

function formatLocation(fileName, lineNumber) {
  return fileName + "?" + lineNumber;
}

function effectLocationAsString(effect) {
  var location = getLocation(effect);

  if (location) {
    var code = location.code,
        fileName = location.fileName,
        lineNumber = location.lineNumber;
    var source = code + "  " + formatLocation(fileName, lineNumber);
    return source;
  }

  return '';
}

function sagaLocationAsString(sagaMeta) {
  var name = sagaMeta.name,
      location = sagaMeta.location;

  if (location) {
    return name + "  " + formatLocation(location.fileName, location.lineNumber);
  }

  return name;
}

function cancelledTasksAsString(sagaStack) {
  var cancelledTasks = flatMap(function (i) {
    return i.cancelledTasks;
  }, sagaStack);

  if (!cancelledTasks.length) {
    return '';
  }

  return ['Tasks cancelled due to error:'].concat(cancelledTasks).join('\n');
}

var crashedEffect = null;
var sagaStack = [];
var addSagaFrame = function addSagaFrame(frame) {
  frame.crashedEffect = crashedEffect;
  sagaStack.push(frame);
};
var clear = function clear() {
  crashedEffect = null;
  sagaStack.length = 0;
}; // this sets crashed effect for the soon-to-be-reported saga frame
// this slightly streatches the singleton nature of this module into wrong direction
// as it's even less obvious what's the data flow here, but it is what it is for now

var setCrashedEffect = function setCrashedEffect(effect) {
  crashedEffect = effect;
};
/**
  @returns {string}

  @example
  The above error occurred in task errorInPutSaga {pathToFile}
  when executing effect put({type: 'REDUCER_ACTION_ERROR_IN_PUT'}) {pathToFile}
      created by fetchSaga {pathToFile}
      created by rootSaga {pathToFile}
*/

var redux_saga_core_esm_toString = function toString() {
  var firstSaga = sagaStack[0],
      otherSagas = sagaStack.slice(1);
  var crashedEffectLocation = firstSaga.crashedEffect ? effectLocationAsString(firstSaga.crashedEffect) : null;
  var errorMessage = "The above error occurred in task " + sagaLocationAsString(firstSaga.meta) + (crashedEffectLocation ? " \n when executing effect " + crashedEffectLocation : '');
  return [errorMessage].concat(otherSagas.map(function (s) {
    return "    created by " + sagaLocationAsString(s.meta);
  }), [cancelledTasksAsString(sagaStack)]).join('\n');
};

function newTask(env, mainTask, parentContext, parentEffectId, meta, isRoot, cont) {
  var _task;

  if (cont === void 0) {
    cont = noop;
  }

  var status = RUNNING;
  var taskResult;
  var taskError;
  var deferredEnd = null;
  var cancelledDueToErrorTasks = [];
  var context = Object.create(parentContext);
  var queue = forkQueue(mainTask, function onAbort() {
    cancelledDueToErrorTasks.push.apply(cancelledDueToErrorTasks, queue.getTasks().map(function (t) {
      return t.meta.name;
    }));
  }, end);
  /**
   This may be called by a parent generator to trigger/propagate cancellation
   cancel all pending tasks (including the main task), then end the current task.
    Cancellation propagates down to the whole execution tree held by this Parent task
   It's also propagated to all joiners of this task and their execution tree/joiners
    Cancellation is noop for terminated/Cancelled tasks tasks
   **/

  function cancel() {
    if (status === RUNNING) {
      // Setting status to CANCELLED does not necessarily mean that the task/iterators are stopped
      // effects in the iterator's finally block will still be executed
      status = redux_saga_core_esm_CANCELLED;
      queue.cancelAll(); // Ending with a TASK_CANCEL will propagate the Cancellation to all joiners

      end(TASK_CANCEL, false);
    }
  }

  function end(result, isErr) {
    if (!isErr) {
      // The status here may be RUNNING or CANCELLED
      // If the status is CANCELLED, then we do not need to change it here
      if (result === TASK_CANCEL) {
        status = redux_saga_core_esm_CANCELLED;
      } else if (status !== redux_saga_core_esm_CANCELLED) {
        status = DONE;
      }

      taskResult = result;
      deferredEnd && deferredEnd.resolve(result);
    } else {
      status = ABORTED;
      addSagaFrame({
        meta: meta,
        cancelledTasks: cancelledDueToErrorTasks
      });

      if (task.isRoot) {
        var sagaStack = redux_saga_core_esm_toString(); // we've dumped the saga stack to string and are passing it to user's code
        // we know that it won't be needed anymore and we need to clear it

        clear();
        env.onError(result, {
          sagaStack: sagaStack
        });
      }

      taskError = result;
      deferredEnd && deferredEnd.reject(result);
    }

    task.cont(result, isErr);
    task.joiners.forEach(function (joiner) {
      joiner.cb(result, isErr);
    });
    task.joiners = null;
  }

  function setContext(props) {
    if (false) // removed by dead control flow
{}

    assignWithSymbols(context, props);
  }

  function toPromise() {
    if (deferredEnd) {
      return deferredEnd.promise;
    }

    deferredEnd = redux_saga_deferred_esm();

    if (status === ABORTED) {
      deferredEnd.reject(taskError);
    } else if (status !== RUNNING) {
      deferredEnd.resolve(taskResult);
    }

    return deferredEnd.promise;
  }

  var task = (_task = {}, _task[redux_saga_symbols_esm_TASK] = true, _task.id = parentEffectId, _task.meta = meta, _task.isRoot = isRoot, _task.context = context, _task.joiners = [], _task.queue = queue, _task.cancel = cancel, _task.cont = cont, _task.end = end, _task.setContext = setContext, _task.toPromise = toPromise, _task.isRunning = function isRunning() {
    return status === RUNNING;
  }, _task.isCancelled = function isCancelled() {
    return status === redux_saga_core_esm_CANCELLED || status === RUNNING && mainTask.status === redux_saga_core_esm_CANCELLED;
  }, _task.isAborted = function isAborted() {
    return status === ABORTED;
  }, _task.result = function result() {
    return taskResult;
  }, _task.error = function error() {
    return taskError;
  }, _task);
  return task;
}

function proc(env, iterator$1, parentContext, parentEffectId, meta, isRoot, cont) {
  if (false) // removed by dead control flow
{}

  var finalRunEffect = env.finalizeRunEffect(runEffect);
  /**
    Tracks the current effect cancellation
    Each time the generator progresses. calling runEffect will set a new value
    on it. It allows propagating cancellation to child effects
  **/

  next.cancel = noop;
  /** Creates a main task to track the main flow */

  var mainTask = {
    meta: meta,
    cancel: cancelMain,
    status: RUNNING
  };
  /**
   Creates a new task descriptor for this generator.
   A task is the aggregation of it's mainTask and all it's forked tasks.
   **/

  var task = newTask(env, mainTask, parentContext, parentEffectId, meta, isRoot, cont);
  var executingContext = {
    task: task,
    digestEffect: digestEffect
  };
  /**
    cancellation of the main task. We'll simply resume the Generator with a TASK_CANCEL
  **/

  function cancelMain() {
    if (mainTask.status === RUNNING) {
      mainTask.status = redux_saga_core_esm_CANCELLED;
      next(TASK_CANCEL);
    }
  }
  /**
    attaches cancellation logic to this task's continuation
    this will permit cancellation to propagate down the call chain
  **/


  if (cont) {
    cont.cancel = task.cancel;
  } // kicks up the generator


  next(); // then return the task descriptor to the caller

  return task;
  /**
   * This is the generator driver
   * It's a recursive async/continuation function which calls itself
   * until the generator terminates or throws
   * @param {internal commands(TASK_CANCEL | TERMINATE) | any} arg - value, generator will be resumed with.
   * @param {boolean} isErr - the flag shows if effect finished with an error
   *
   * receives either (command | effect result, false) or (any thrown thing, true)
   */

  function next(arg, isErr) {
    try {
      var result;

      if (isErr) {
        result = iterator$1.throw(arg); // user handled the error, we can clear bookkept values

        clear();
      } else if (shouldCancel(arg)) {
        /**
          getting TASK_CANCEL automatically cancels the main task
          We can get this value here
           - By cancelling the parent task manually
          - By joining a Cancelled task
        **/
        mainTask.status = redux_saga_core_esm_CANCELLED;
        /**
          Cancels the current effect; this will propagate the cancellation down to any called tasks
        **/

        next.cancel();
        /**
          If this Generator has a `return` method then invokes it
          This will jump to the finally block
        **/

        result = redux_saga_is_esm_func(iterator$1.return) ? iterator$1.return(TASK_CANCEL) : {
          done: true,
          value: TASK_CANCEL
        };
      } else if (shouldTerminate(arg)) {
        // We get TERMINATE flag, i.e. by taking from a channel that ended using `take` (and not `takem` used to trap End of channels)
        result = redux_saga_is_esm_func(iterator$1.return) ? iterator$1.return() : {
          done: true
        };
      } else {
        result = iterator$1.next(arg);
      }

      if (!result.done) {
        digestEffect(result.value, parentEffectId, next);
      } else {
        /**
          This Generator has ended, terminate the main task and notify the fork queue
        **/
        if (mainTask.status !== redux_saga_core_esm_CANCELLED) {
          mainTask.status = DONE;
        }

        mainTask.cont(result.value);
      }
    } catch (error) {
      if (mainTask.status === redux_saga_core_esm_CANCELLED) {
        throw error;
      }

      mainTask.status = ABORTED;
      mainTask.cont(error, true);
    }
  }

  function runEffect(effect, effectId, currCb) {
    /**
      each effect runner must attach its own logic of cancellation to the provided callback
      it allows this generator to propagate cancellation downward.
       ATTENTION! effect runners must setup the cancel logic by setting cb.cancel = [cancelMethod]
      And the setup must occur before calling the callback
       This is a sort of inversion of control: called async functions are responsible
      of completing the flow by calling the provided continuation; while caller functions
      are responsible for aborting the current flow by calling the attached cancel function
       Library users can attach their own cancellation logic to promises by defining a
      promise[CANCEL] method in their returned promises
      ATTENTION! calling cancel must have no effect on an already completed or cancelled effect
    **/
    if (promise(effect)) {
      resolvePromise(effect, currCb);
    } else if (iterator(effect)) {
      // resolve iterator
      proc(env, effect, task.context, effectId, meta,
      /* isRoot */
      false, currCb);
    } else if (effect && effect[redux_saga_symbols_esm_IO]) {
      var effectRunner = effectRunnerMap[effect.type];
      effectRunner(env, effect.payload, currCb, executingContext);
    } else {
      // anything else returned as is
      currCb(effect);
    }
  }

  function digestEffect(effect, parentEffectId, cb, label) {
    if (label === void 0) {
      label = '';
    }

    var effectId = nextSagaId();
    env.sagaMonitor && env.sagaMonitor.effectTriggered({
      effectId: effectId,
      parentEffectId: parentEffectId,
      label: label,
      effect: effect
    });
    /**
      completion callback and cancel callback are mutually exclusive
      We can't cancel an already completed effect
      And We can't complete an already cancelled effectId
    **/

    var effectSettled; // Completion callback passed to the appropriate effect runner

    function currCb(res, isErr) {
      if (effectSettled) {
        return;
      }

      effectSettled = true;
      cb.cancel = noop; // defensive measure

      if (env.sagaMonitor) {
        if (isErr) {
          env.sagaMonitor.effectRejected(effectId, res);
        } else {
          env.sagaMonitor.effectResolved(effectId, res);
        }
      }

      if (isErr) {
        setCrashedEffect(effect);
      }

      cb(res, isErr);
    } // tracks down the current cancel


    currCb.cancel = noop; // setup cancellation logic on the parent cb

    cb.cancel = function () {
      // prevents cancelling an already completed effect
      if (effectSettled) {
        return;
      }

      effectSettled = true;
      currCb.cancel(); // propagates cancel downward

      currCb.cancel = noop; // defensive measure

      env.sagaMonitor && env.sagaMonitor.effectCancelled(effectId);
    };

    finalRunEffect(effect, effectId, currCb);
  }
}

var RUN_SAGA_SIGNATURE = 'runSaga(options, saga, ...args)';
var NON_GENERATOR_ERR = RUN_SAGA_SIGNATURE + ": saga argument must be a Generator function!";
function runSaga(_ref, saga) {
  var _ref$channel = _ref.channel,
      channel = _ref$channel === void 0 ? stdChannel() : _ref$channel,
      dispatch = _ref.dispatch,
      getState = _ref.getState,
      _ref$context = _ref.context,
      context = _ref$context === void 0 ? {} : _ref$context,
      sagaMonitor = _ref.sagaMonitor,
      effectMiddlewares = _ref.effectMiddlewares,
      _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? logError : _ref$onError;

  if (false) // removed by dead control flow
{}

  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var iterator$1 = saga.apply(void 0, args);

  if (false) // removed by dead control flow
{}

  var effectId = nextSagaId();

  if (sagaMonitor) {
    // monitors are expected to have a certain interface, let's fill-in any missing ones
    sagaMonitor.rootSagaStarted = sagaMonitor.rootSagaStarted || noop;
    sagaMonitor.effectTriggered = sagaMonitor.effectTriggered || noop;
    sagaMonitor.effectResolved = sagaMonitor.effectResolved || noop;
    sagaMonitor.effectRejected = sagaMonitor.effectRejected || noop;
    sagaMonitor.effectCancelled = sagaMonitor.effectCancelled || noop;
    sagaMonitor.actionDispatched = sagaMonitor.actionDispatched || noop;
    sagaMonitor.rootSagaStarted({
      effectId: effectId,
      saga: saga,
      args: args
    });
  }

  if (false) // removed by dead control flow
{ var MIDDLEWARE_TYPE_ERROR; }

  var finalizeRunEffect;

  if (effectMiddlewares) {
    var middleware = compose.apply(void 0, effectMiddlewares);

    finalizeRunEffect = function finalizeRunEffect(runEffect) {
      return function (effect, effectId, currCb) {
        var plainRunEffect = function plainRunEffect(eff) {
          return runEffect(eff, effectId, currCb);
        };

        return middleware(plainRunEffect)(effect);
      };
    };
  } else {
    finalizeRunEffect = identity;
  }

  var env = {
    channel: channel,
    dispatch: wrapSagaDispatch(dispatch),
    getState: getState,
    sagaMonitor: sagaMonitor,
    onError: onError,
    finalizeRunEffect: finalizeRunEffect
  };
  return immediately(function () {
    var task = proc(env, iterator$1, context, effectId, getMetaInfo(saga),
    /* isRoot */
    true, undefined);

    if (sagaMonitor) {
      sagaMonitor.effectResolved(effectId, task);
    }

    return task;
  });
}

function sagaMiddlewareFactory(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$context = _ref.context,
      context = _ref$context === void 0 ? {} : _ref$context,
      _ref$channel = _ref.channel,
      channel = _ref$channel === void 0 ? stdChannel() : _ref$channel,
      sagaMonitor = _ref.sagaMonitor,
      options = _objectWithoutPropertiesLoose(_ref, ["context", "channel", "sagaMonitor"]);

  var boundRunSaga;

  if (false) // removed by dead control flow
{}

  function sagaMiddleware(_ref2) {
    var getState = _ref2.getState,
        dispatch = _ref2.dispatch;
    boundRunSaga = runSaga.bind(null, extends_extends({}, options, {
      context: context,
      channel: channel,
      dispatch: dispatch,
      getState: getState,
      sagaMonitor: sagaMonitor
    }));
    return function (next) {
      return function (action) {
        if (sagaMonitor && sagaMonitor.actionDispatched) {
          sagaMonitor.actionDispatched(action);
        }

        var result = next(action); // hit reducers

        channel.put(action);
        return result;
      };
    };
  }

  sagaMiddleware.run = function () {
    if (false) // removed by dead control flow
{}

    return boundRunSaga.apply(void 0, arguments);
  };

  sagaMiddleware.setContext = function (props) {
    if (false) // removed by dead control flow
{}

    assignWithSymbols(context, props);
  };

  return sagaMiddleware;
}

/* harmony default export */ const redux_saga_core_esm = (sagaMiddlewareFactory);


;// ./node_modules/redux-saga/dist/redux-saga-core-npm-proxy.esm.js





/* harmony default export */ const redux_saga_core_npm_proxy_esm = (redux_saga_core_esm);

;// ./node_modules/@redux-saga/core/dist/redux-saga-effects.esm.js







var done = function done(value) {
  return {
    done: true,
    value: value
  };
};

var qEnd = {};
function safeName(patternOrChannel) {
  if (channel(patternOrChannel)) {
    return 'channel';
  }

  if (stringableFunc(patternOrChannel)) {
    return String(patternOrChannel);
  }

  if (redux_saga_is_esm_func(patternOrChannel)) {
    return patternOrChannel.name;
  }

  return String(patternOrChannel);
}
function fsmIterator(fsm, startState, name) {
  var stateUpdater,
      errorState,
      effect,
      nextState = startState;

  function next(arg, error) {
    if (nextState === qEnd) {
      return done(arg);
    }

    if (error && !errorState) {
      nextState = qEnd;
      throw error;
    } else {
      stateUpdater && stateUpdater(arg);
      var currentState = error ? fsm[errorState](error) : fsm[nextState]();
      nextState = currentState.nextState;
      effect = currentState.effect;
      stateUpdater = currentState.stateUpdater;
      errorState = currentState.errorState;
      return nextState === qEnd ? done(arg) : effect;
    }
  }

  return makeIterator(next, function (error) {
    return next(null, error);
  }, name);
}

function takeEvery(patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var yTake = {
    done: false,
    value: io_6de156f3_take(patternOrChannel)
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: io_6de156f3_fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var action,
      setAction = function setAction(ac) {
    return action = ac;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return {
        nextState: 'q1',
        effect: yFork(action)
      };
    }
  }, 'q1', "takeEvery(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

function takeLatest(patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var yTake = {
    done: false,
    value: take(patternOrChannel)
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var yCancel = function yCancel(task) {
    return {
      done: false,
      value: cancel(task)
    };
  };

  var task, action;

  var setTask = function setTask(t) {
    return task = t;
  };

  var setAction = function setAction(ac) {
    return action = ac;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return task ? {
        nextState: 'q3',
        effect: yCancel(task)
      } : {
        nextState: 'q1',
        effect: yFork(action),
        stateUpdater: setTask
      };
    },
    q3: function q3() {
      return {
        nextState: 'q1',
        effect: yFork(action),
        stateUpdater: setTask
      };
    }
  }, 'q1', "takeLatest(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

function takeLeading(patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var yTake = {
    done: false,
    value: take(patternOrChannel)
  };

  var yCall = function yCall(ac) {
    return {
      done: false,
      value: call.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var action;

  var setAction = function setAction(ac) {
    return action = ac;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return {
        nextState: 'q1',
        effect: yCall(action)
      };
    }
  }, 'q1', "takeLeading(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

function throttle(delayLength, pattern, worker) {
  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var action, channel;
  var yActionChannel = {
    done: false,
    value: actionChannel(pattern, sliding(1))
  };

  var yTake = function yTake() {
    return {
      done: false,
      value: take(channel)
    };
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var yDelay = {
    done: false,
    value: delay(delayLength)
  };

  var setAction = function setAction(ac) {
    return action = ac;
  };

  var setChannel = function setChannel(ch) {
    return channel = ch;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yActionChannel,
        stateUpdater: setChannel
      };
    },
    q2: function q2() {
      return {
        nextState: 'q3',
        effect: yTake(),
        stateUpdater: setAction
      };
    },
    q3: function q3() {
      return {
        nextState: 'q4',
        effect: yFork(action)
      };
    },
    q4: function q4() {
      return {
        nextState: 'q2',
        effect: yDelay
      };
    }
  }, 'q1', "throttle(" + safeName(pattern) + ", " + worker.name + ")");
}

function retry(maxTries, delayLength, fn) {
  var counter = maxTries;

  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var yCall = {
    done: false,
    value: call.apply(void 0, [fn].concat(args))
  };
  var yDelay = {
    done: false,
    value: delay(delayLength)
  };
  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yCall,
        errorState: 'q10'
      };
    },
    q2: function q2() {
      return {
        nextState: qEnd
      };
    },
    q10: function q10(error) {
      counter -= 1;

      if (counter <= 0) {
        throw error;
      }

      return {
        nextState: 'q1',
        effect: yDelay
      };
    }
  }, 'q1', "retry(" + fn.name + ")");
}

function debounceHelper(delayLength, patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var action, raceOutput;
  var yTake = {
    done: false,
    value: take(patternOrChannel)
  };
  var yRace = {
    done: false,
    value: race({
      action: take(patternOrChannel),
      debounce: delay(delayLength)
    })
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var yNoop = function yNoop(value) {
    return {
      done: false,
      value: value
    };
  };

  var setAction = function setAction(ac) {
    return action = ac;
  };

  var setRaceOutput = function setRaceOutput(ro) {
    return raceOutput = ro;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return {
        nextState: 'q3',
        effect: yRace,
        stateUpdater: setRaceOutput
      };
    },
    q3: function q3() {
      return raceOutput.debounce ? {
        nextState: 'q1',
        effect: yFork(action)
      } : {
        nextState: 'q2',
        effect: yNoop(raceOutput.action),
        stateUpdater: setAction
      };
    }
  }, 'q1', "debounce(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

var validateTakeEffect = function validateTakeEffect(fn, patternOrChannel, worker) {
  check(patternOrChannel, notUndef, fn.name + " requires a pattern or channel");
  check(worker, notUndef, fn.name + " requires a saga parameter");
};

function takeEvery$1(patternOrChannel, worker) {
  if (false) // removed by dead control flow
{}

  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return io_6de156f3_fork.apply(void 0, [takeEvery, patternOrChannel, worker].concat(args));
}
function takeLatest$1(patternOrChannel, worker) {
  if (false) // removed by dead control flow
{}

  for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  return fork.apply(void 0, [takeLatest, patternOrChannel, worker].concat(args));
}
function takeLeading$1(patternOrChannel, worker) {
  if (false) // removed by dead control flow
{}

  for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    args[_key3 - 2] = arguments[_key3];
  }

  return fork.apply(void 0, [takeLeading, patternOrChannel, worker].concat(args));
}
function throttle$1(ms, pattern, worker) {
  if (false) // removed by dead control flow
{}

  for (var _len4 = arguments.length, args = new Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) {
    args[_key4 - 3] = arguments[_key4];
  }

  return fork.apply(void 0, [throttle, ms, pattern, worker].concat(args));
}
function retry$1(maxTries, delayLength, worker) {
  for (var _len5 = arguments.length, args = new Array(_len5 > 3 ? _len5 - 3 : 0), _key5 = 3; _key5 < _len5; _key5++) {
    args[_key5 - 3] = arguments[_key5];
  }

  return call.apply(void 0, [retry, maxTries, delayLength, worker].concat(args));
}
function debounce(delayLength, pattern, worker) {
  for (var _len6 = arguments.length, args = new Array(_len6 > 3 ? _len6 - 3 : 0), _key6 = 3; _key6 < _len6; _key6++) {
    args[_key6 - 3] = arguments[_key6];
  }

  return fork.apply(void 0, [debounceHelper, delayLength, pattern, worker].concat(args));
}



;// ./node_modules/redux-saga/dist/redux-saga-effects-npm-proxy.esm.js


;// ./app/actions/actions.js

var notifyFingerprintAttempt = function notifyFingerprintAttempt() {
  return {
    type: FINGERPRINT_ATTEMPT_DETECTED
  };
};
var updateFingerprintAttemptsCounter = function updateFingerprintAttemptsCounter(data) {
  return {
    type: UPDATE_FINGERPRINT_ATTEMPT_COUNTER,
    data: data
  };
};
var incrementFingerprintAttempts = function incrementFingerprintAttempts() {
  return {
    type: INCREMENT_FINGERPRINT_ATTEMPTS_DETECTED
  };
};
var toggleFingerprintProtectionForDomain = function toggleFingerprintProtectionForDomain(_ref) {
  var data = _ref.data,
      url = _ref.url;
  return {
    type: TOGGLE_FINGERPRINT_PROTECTION_FOR_DOMAIN,
    data: data,
    url: url
  };
};
var toggleFingerprintProtection = function toggleFingerprintProtection(_ref2) {
  var data = _ref2.data,
      url = _ref2.url;
  return {
    type: TOGGLE_FINGERPRINT_PROTECTION,
    data: data
  };
};
var toggleSocialMediaProtection = function toggleSocialMediaProtection(_ref3) {
  var data = _ref3.data;
  return {
    type: TOGGLE_SOCIAL_MEDIA_PROTECTION,
    data: data
  };
};
var updateFingerprintProtectionStatus = function updateFingerprintProtectionStatus(data) {
  return {
    type: UPDATE_FINGERPRINT_PROTECTION_STATUS,
    data: data
  };
};
var updateSocialMediaProtectionStatus = function updateSocialMediaProtectionStatus(data) {
  return {
    type: UPDATE_SOCIAL_MEDIA_PROTECTION_STATUS,
    data: data
  };
};
// EXTERNAL MODULE: ./app/utils/Browser.js
var Browser = __webpack_require__(424);
;// ./app/utils/ExtensionStorage.js







var ExtensionStorage = /*#__PURE__*/function () {
  function ExtensionStorage() {
    (0,classCallCheck/* default */.A)(this, ExtensionStorage);
  }

  (0,createClass/* default */.A)(ExtensionStorage, null, [{
    key: "setSync",
    value: function setSync(key, value) {
      Browser/* Browser */.P.setStorageSync(key, value);
      Logger.debug("".concat(JSON.stringify(value), " was saved to storage key ").concat(key));
    }
  }, {
    key: "getSync",
    value: function () {
      var _getSync = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(key) {
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return Browser/* Browser */.P.getStorageSync(key);

              case 2:
                return _context.abrupt("return", _context.sent);

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getSync(_x) {
        return _getSync.apply(this, arguments);
      }

      return getSync;
    }()
  }, {
    key: "set",
    value: function set(key, value) {
      Browser/* Browser */.P.setStorageLocal(key, value);
      Logger.debug("".concat(JSON.stringify(value), " was saved to storage key ").concat(key));
    }
  }, {
    key: "get",
    value: function get(key) {
      return Browser/* Browser */.P.getStorageLocal(key);
    }
  }]);

  return ExtensionStorage;
}();


;// ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}
;// ./node_modules/@babel/runtime/helpers/esm/inherits.js

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
;// ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}
;// ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js


function _possibleConstructorReturn(self, call) {
  if (call && ((0,esm_typeof/* default */.A)(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}
;// ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
;// ./app/utils/boostrap/BootstrapModule.js



var BootstrapModule = /*#__PURE__*/function () {
  function BootstrapModule() {
    (0,classCallCheck/* default */.A)(this, BootstrapModule);
  }

  (0,createClass/* default */.A)(BootstrapModule, null, [{
    key: "init",
    value: function init() {
      throw new Error('You have to implement the method init()!');
    }
  }]);

  return BootstrapModule;
}();


;// ./app/utils/boostrap/Configuration.js









function Configuration_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function Configuration_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? Configuration_ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : Configuration_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }






var _appSettings = {};
var _afpData = {};

var Configuration = /*#__PURE__*/function (_BootstrapModule) {
  _inherits(Configuration, _BootstrapModule);

  var _super = _createSuper(Configuration);

  function Configuration() {
    (0,classCallCheck/* default */.A)(this, Configuration);

    return _super.apply(this, arguments);
  }

  (0,createClass/* default */.A)(Configuration, null, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return ExtensionStorage.getSync(StorageKeys.AppSettings.KEY);

              case 2:
                _context.t0 = _context.sent;

                if (_context.t0) {
                  _context.next = 5;
                  break;
                }

                _context.t0 = {};

              case 5:
                _appSettings = _context.t0;
                _context.next = 8;
                return ExtensionStorage.get(StorageKeys.AFPData.KEY);

              case 8:
                _context.t1 = _context.sent;

                if (_context.t1) {
                  _context.next = 11;
                  break;
                }

                _context.t1 = {};

              case 11:
                _afpData = _context.t1;

                if (_appSettings.hasOwnProperty("shepherd_url")) {
                  Logger.info("Detected custom shepherd url " + _appSettings.shepherd_url);
                }

                if (Object.keys(_appSettings).length === 0) {
                  _appSettings = settings.DEFAULT_SETTINGS;
                  ExtensionStorage.setSync(StorageKeys.AppSettings.KEY, _appSettings);
                  Logger.info("Initialized settings to default");
                } // add missing keys in case new settings were added after an update


                if (Object.keys(_appSettings).length !== Object.keys(StorageKeys.AppSettings).length) {
                  _appSettings = Configuration_objectSpread(Configuration_objectSpread({}, settings.DEFAULT_SETTINGS), _appSettings);
                  ExtensionStorage.setSync(StorageKeys.AppSettings.KEY, _appSettings);
                  Logger.info("Merged existing settings with default settings");
                }

                if (Object.keys(_afpData).length === 0) {
                  ExtensionStorage.set(StorageKeys.AFPData.KEY, settings.DEFAULT_AFP_DATA);
                  Logger.info("Initialized fingerprint detection counter to 0");
                }

                Logger.info("App Configuration initialized");

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "appSettings",
    get: function get() {
      return _appSettings;
    }
  }, {
    key: "stats",
    get: function get() {
      return _afpData;
    }
  }]);

  return Configuration;
}(BootstrapModule);


;// ./app/sagas/toggle-domain-fingerprint-protection.js


var _marked = /*#__PURE__*/regenerator_default().mark(toggleFingerprintProtectionForDomainSaga);








function toggleFingerprintProtectionForDomainSaga(action) {
  var result, url, hostname;
  return regenerator_default().wrap(function toggleFingerprintProtectionForDomainSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return io_6de156f3_call(ExtensionStorage.getSync, StorageKeys.AppSettings.KEY);

        case 2:
          result = _context.sent;
          url = new URL(action.url);
          hostname = url.hostname;

          if (action.data) {
            Logger.debug("\"Enabling ".concat(hostname));
            result.whitelist = result.whitelist.filter(function (u) {
              return u !== hostname;
            });
          } else {
            Logger.debug("\"Disabling ".concat(hostname));

            if (!result.whitelist.includes(hostname)) {
              result.whitelist.push(hostname);
            }
          }

          _context.next = 8;
          return io_6de156f3_call(ExtensionStorage.setSync, StorageKeys.AppSettings.KEY, result);

        case 8:
          _context.next = 10;
          return io_6de156f3_call(Configuration.init);

        case 10:
          _context.next = 12;
          return put(updateFingerprintProtectionStatus(action.data));

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}


;// ./app/sagas/toggle-social-media-protection.js


var toggle_social_media_protection_marked = /*#__PURE__*/regenerator_default().mark(toggleSocialMediaProtectionSaga);







function toggleSocialMediaProtectionSaga(action) {
  var result;
  return regenerator_default().wrap(function toggleSocialMediaProtectionSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return io_6de156f3_call(ExtensionStorage.getSync, StorageKeys.AppSettings.KEY);

        case 2:
          result = _context.sent;
          result.socialMediaProtection = action.data;
          _context.next = 6;
          return io_6de156f3_call(ExtensionStorage.setSync, StorageKeys.AppSettings.KEY, result);

        case 6:
          _context.next = 8;
          return io_6de156f3_call(Configuration.init());

        case 8:
          _context.next = 10;
          return put(updateSocialMediaProtectionStatus(action.data));

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, toggle_social_media_protection_marked);
}


;// ./app/sagas/fingerprint-detected.js


var fingerprint_detected_marked = /*#__PURE__*/regenerator_default().mark(fingerprintAttemptDetectedSaga);







function fingerprintAttemptDetectedSaga() {
  var _updatedStorage;

  var state, newCounter, updatedStorage;
  return regenerator_default().wrap(function fingerprintAttemptDetectedSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return io_6de156f3_select();

        case 2:
          state = _context.sent;
          newCounter = state.antiFingerprint.detectionAttempts + 1;
          updatedStorage = (_updatedStorage = {}, _updatedStorage[StorageKeys.AFPData.FINGERPRINT_ATTEMPTS_DETECTED_COUNTER] = newCounter, _updatedStorage);
          _context.next = 7;
          return io_6de156f3_call(ExtensionStorage.set, StorageKeys.AFPData.KEY, updatedStorage);

        case 7:
          _context.next = 9;
          return put(incrementFingerprintAttempts());

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, fingerprint_detected_marked);
}


;// ./app/sagas/toggle-fingerprint-protection.js


var toggle_fingerprint_protection_marked = /*#__PURE__*/regenerator_default().mark(toggleFingerprintProtectionSaga);








function toggleFingerprintProtectionSaga(action) {
  var result;
  return regenerator_default().wrap(function toggleFingerprintProtectionSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return io_6de156f3_call(ExtensionStorage.getSync, StorageKeys.AppSettings.KEY);

        case 2:
          result = _context.sent;
          Logger.debug("AFP disabled status set to: ".concat(action.data));
          result.isActive = action.data;
          _context.next = 7;
          return io_6de156f3_call(ExtensionStorage.setSync, StorageKeys.AppSettings.KEY, result);

        case 7:
          _context.next = 9;
          return io_6de156f3_call(Configuration.init);

        case 9:
          _context.next = 11;
          return put(updateFingerprintProtectionStatus(action.data));

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, toggle_fingerprint_protection_marked);
}


;// ./app/sagas/index.js


var sagas_marked = /*#__PURE__*/regenerator_default().mark(rootSaga);








function rootSaga() {
  return regenerator_default().wrap(function rootSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return takeEvery$1(TOGGLE_FINGERPRINT_PROTECTION_FOR_DOMAIN, toggleFingerprintProtectionForDomainSaga);

        case 2:
          _context.next = 4;
          return takeEvery$1(TOGGLE_FINGERPRINT_PROTECTION, toggleFingerprintProtectionSaga);

        case 4:
          _context.next = 6;
          return takeEvery$1(TOGGLE_SOCIAL_MEDIA_PROTECTION, toggleSocialMediaProtectionSaga);

        case 6:
          _context.next = 8;
          return takeEvery$1(FINGERPRINT_ATTEMPT_DETECTED, fingerprintAttemptDetectedSaga);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  }, sagas_marked);
}

/* harmony default export */ const sagas = (rootSaga);
;// ./app/store/configureStore.js





var sagaMiddleware = redux_saga_core_npm_proxy_esm();
var middleware = [sagaMiddleware, burgerMiddleware]; //const composeEnhancers = composeWithDevTools({ realtime: true, port: 8000 });

var store = createStore(reducers, applyMiddleware.apply(void 0, middleware));
sagaMiddleware.run(sagas);
/* harmony default export */ const configureStore = (store);
// EXTERNAL MODULE: ./node_modules/redux-webext/lib/index.js
var lib = __webpack_require__(833);
;// ./app/utils/Utils.js


var Utils = /*#__PURE__*/function () {
  function Utils() {
    (0,classCallCheck/* default */.A)(this, Utils);
  }

  (0,createClass/* default */.A)(Utils, null, [{
    key: "getDomain",
    value: function getDomain(url) {
      var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);

      if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
      } else {
        return null;
      }
    }
  }, {
    key: "hash",
    value: function hash(str) {
      var stringHash = __webpack_require__(459);

      return stringHash(str) + "";
    }
  }, {
    key: "randomInt",
    value: function randomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }, {
    key: "randomArrValue",
    value: function randomArrValue(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }, {
    key: "kFormatter",
    value: function kFormatter(num) {
      return num > 999 ? (num / 1000).toFixed(1) + 'k' : num;
    }
  }]);

  return Utils;
}();
;// ./app/utils/boostrap/Noise.js








function Noise_createSuper(Derived) { var hasNativeReflectConstruct = Noise_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function Noise_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }







var Noise = /*#__PURE__*/function (_BootstrapModule) {
  _inherits(Noise, _BootstrapModule);

  var _super = Noise_createSuper(Noise);

  function Noise() {
    (0,classCallCheck/* default */.A)(this, Noise);

    return _super.apply(this, arguments);
  }

  (0,createClass/* default */.A)(Noise, null, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        var CanvasNoise;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                CanvasNoise = {
                  r: Utils.randomInt(-10, 20),
                  g: Utils.randomInt(-10, 20),
                  b: Utils.randomInt(-10, 20),
                  a: Utils.randomInt(-10, 20)
                };
                ExtensionStorage.setSync(StorageKeys.NOISE, CanvasNoise);
                Logger.info("New noise has been generated");

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }]);

  return Noise;
}(BootstrapModule);


;// ./app/utils/PeriodicAlarm.js





var PeriodicAlarm = /*#__PURE__*/function () {
  /**
   * constructor
   * @param name - name of the alarm
   * @param cb - alarm callback with any arguments
   */
  function PeriodicAlarm(name, cb) {
    var _this = this;

    (0,classCallCheck/* default */.A)(this, PeriodicAlarm);

    _defineProperty(this, "alarmName", void 0);

    _defineProperty(this, "disposed", true);

    _defineProperty(this, "callback", void 0);

    _defineProperty(this, "onAlarm", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(alarm) {
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(alarm.name === _this.alarmName)) {
                  _context.next = 3;
                  break;
                }

                _context.next = 3;
                return _this.callback();

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    this.alarmName = name;
    this.callback = cb;
    chrome.alarms.onAlarm.addListener(this.onAlarm);
  }
  /**
   * start
   * function to create alarm and bind callback function
   * @param interval - alarm interval in minutes
   */


  (0,createClass/* default */.A)(PeriodicAlarm, [{
    key: "start",
    value: function () {
      var _start = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2(interval) {
        var alarmPresentAlready;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.isAlarmExistsWithSameInterval(interval);

              case 2:
                alarmPresentAlready = _context2.sent;

                if (!alarmPresentAlready) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return");

              case 5:
                chrome.alarms.create(this.alarmName, {
                  periodInMinutes: interval
                });

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function start(_x2) {
        return _start.apply(this, arguments);
      }

      return start;
    }()
    /**
     * isAlarmExistsWithSameInterval
     * function to check alarm already exists with same name and same interval
     * @returns alarm exists as boolean
     */

  }, {
    key: "isAlarmExistsWithSameInterval",
    value: function () {
      var _isAlarmExistsWithSameInterval = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee3(interval) {
        var _this2 = this;

        return regenerator_default().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  chrome.alarms.get(_this2.alarmName, function (res) {
                    if (res && res.periodInMinutes === interval) {
                      resolve(true);
                    } else {
                      resolve(false);
                    }
                  });
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function isAlarmExistsWithSameInterval(_x3) {
        return _isAlarmExistsWithSameInterval.apply(this, arguments);
      }

      return isAlarmExistsWithSameInterval;
    }()
    /**
     * onAlarm
     * alarm listener callback when fired
     * @param alarm - alarm handler details
     */

  }, {
    key: "dispose",
    value:
    /**
     * dispose
     * function to remove alarm and binded callback function
     */
    function () {
      var _dispose = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee4() {
        return regenerator_default().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return chrome.alarms.clear(this.alarmName);

              case 2:
                chrome.alarms.onAlarm.removeListener(this.onAlarm);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function dispose() {
        return _dispose.apply(this, arguments);
      }

      return dispose;
    }()
  }]);

  return PeriodicAlarm;
}();
;// ./app/utils/boostrap/Shepherd.js












var Shepherd = /*#__PURE__*/function () {
  function Shepherd() {
    var _this = this;

    (0,classCallCheck/* default */.A)(this, Shepherd);

    _defineProperty(this, "_updateAppSettings", function (config) {
      var profiles = config.profiles,
          disabledDomainFeatures = config.disabledDomainFeatures,
          disabled = config.disabled;
      var newSettings = Configuration.appSettings;
      newSettings.profiles = profiles;
      newSettings.disabledDomainFeatures = disabledDomainFeatures;
      newSettings.disabled = disabled;
      ExtensionStorage.setSync(StorageKeys.AppSettings.KEY, newSettings);
    });

    _defineProperty(this, "_fetchAndStoreConfigJson", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
      var fetchTime, configResponse, response;
      return regenerator_default().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              fetchTime = Date.now();
              ExtensionStorage.set(LAST_SHEPERD_CONFIG_FETCHED_TIMESTAMP, fetchTime);
              _context.next = 5;
              return fetch(Configuration.appSettings.shepherd_url || settings.SHEPHERD_URL);

            case 5:
              configResponse = _context.sent;
              _context.next = 8;
              return configResponse.json();

            case 8:
              response = _context.sent;

              if (response) {
                _context.next = 12;
                break;
              }

              Logger.error("Empty response from shepherd");
              return _context.abrupt("return");

            case 12:
              ExtensionStorage.set(StorageKeys.CONFIGJSONKEY, response.config);

              _this._updateAppSettings(response.config);

              _context.next = 19;
              break;

            case 16:
              _context.prev = 16;
              _context.t0 = _context["catch"](0);
              Logger.error("Failed to fetch shepherd configuration: ".concat(_context.t0.message));

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 16]]);
    })));

    this._fetchAndStoreConfigJson = this._fetchAndStoreConfigJson.bind(this);
    this._onIntervalAlarm = this._onIntervalAlarm.bind(this);
    this.alarmInstance = new PeriodicAlarm(SHEPERD_CONFIG_DOWNLOAD_ALARM, this._onIntervalAlarm);
  }

  (0,createClass/* default */.A)(Shepherd, [{
    key: "_shouldFetch",
    value: function _shouldFetch(lastFetchTime) {
      var currentTime = Date.now();
      return lastFetchTime ? currentTime - lastFetchTime >= RETRY_SHEPERD_CONFIG_FETCH_INTERVAL_MS : true;
    }
  }, {
    key: "_onIntervalAlarm",
    value: function () {
      var _onIntervalAlarm2 = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2() {
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._fetchAndStoreConfigJson();

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _onIntervalAlarm() {
        return _onIntervalAlarm2.apply(this, arguments);
      }

      return _onIntervalAlarm;
    }()
  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee3() {
        var configFromStorage, lastFetchTime;
        return regenerator_default().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return this.alarmInstance.start(SHEPERD_CONFIG_DOWNLOAD_INTERVAL_IN_MINUTES);

              case 3:
                _context3.next = 5;
                return ExtensionStorage.get(StorageKeys.CONFIGJSONKEY);

              case 5:
                configFromStorage = _context3.sent;

                if (!configFromStorage) {
                  _context3.next = 9;
                  break;
                }

                this._updateAppSettings(configFromStorage);

                return _context3.abrupt("return");

              case 9:
                _context3.next = 11;
                return ExtensionStorage.get(LAST_SHEPERD_CONFIG_FETCHED_TIMESTAMP);

              case 11:
                lastFetchTime = _context3.sent;

                if (this._shouldFetch(lastFetchTime)) {
                  _context3.next = 14;
                  break;
                }

                return _context3.abrupt("return");

              case 14:
                _context3.next = 16;
                return this._fetchAndStoreConfigJson();

              case 16:
                Logger.debug("Shepherd configuration initialized");
                _context3.next = 22;
                break;

              case 19:
                _context3.prev = 19;
                _context3.t0 = _context3["catch"](0);
                Logger.error("Failed to initialize shepherd configuration: ".concat(_context3.t0.message));

              case 22:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 19]]);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }]);

  return Shepherd;
}();

var sheperd = new Shepherd();
;// ./app/utils/AppBootstrap.js







var appModules = [Noise, Configuration, sheperd];

var AppBootstrap = /*#__PURE__*/function () {
  function AppBootstrap() {
    (0,classCallCheck/* default */.A)(this, AppBootstrap);
  }

  (0,createClass/* default */.A)(AppBootstrap, null, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2() {
        var loadedModules;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                loadedModules = [];
                return _context2.abrupt("return", new Promise( /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(resolve, reject) {
                    var i;
                    return regenerator_default().wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            i = 0;

                          case 1:
                            if (!(i < appModules.length)) {
                              _context.next = 7;
                              break;
                            }

                            _context.next = 4;
                            return appModules[i].init();

                          case 4:
                            i++;
                            _context.next = 1;
                            break;

                          case 7:
                            resolve(true); // Promise.all(loadedModules).then(() => {
                            //     resolve(true);
                            // });

                          case 8:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }]);

  return AppBootstrap;
}();


;// ./app/constants/social-resources.js
var SocialResources = {
  regexFilter: {
    "facebook.com": ["https://www.facebook.com/favicon.ico\\?_rdr=p"],
    "github.com": ["https://github.com/favicon.ico\\?id=1"],
    "google.com": ["https://accounts\\.google\\.com/ServiceLogin\\?passive=true&continue=https%3A%2F%2Fwww\\.google\\.com%2Ffavicon\\.ico.*"],
    "youtube.com": ["https://accounts\\.google\\.com/ServiceLogin\\?passive=true&continue=https%3A%2F%2Fwww\\.youtube\\.com%2Ffavicon\\.ico.*"],
    "airbnb.com": ["https://www.airbnb.com/login\\?redirect_params\\[action\\]=favicon.ico&redirect_params\\[controller\\]=home"],
    "spotify.com": ["https://www.spotify.com/[a-zA-Z]{2,3}/login/\\?forward_url=https%3A%2F%2Fwww.spotify.com%2Ffavicon.ico"],
    "slack.com": ["https://slack.com/checkcookie\\?redir=https%3A%2F%2Fslack.com%2Ffavicon.ico%23"],
    "steam.com": ["https://store.steampowered.com/login/\\?redir=favicon.ico"],
    "pinterest.com": ["https://www.pinterest.com/login/\\?next=https%3A%2F%2Fwww.pinterest.com%2Ffavicon.ico"],
    "blizzard.com": ["https://eu.blizzard.com/static/_images/favicon.ico"],
    "twitter.com": ["https://twitter.com/login\\?redirect_after_login=https%3a%2f%2ftwitter.com%2ffavicon.ico"],
    "medium.com": ["https://medium.com/m/signin\\?redirect=https%3A%2F%2Fmedium.com%2Ffavicon.ico&loginType=default"],
    "ycombinator.com": ["https://news.ycombinator.com/login\\?goto=y18.gif%23"],
    "craigslist.org": ["https://accounts.craigslist.org/login\\?rt=L&rp=%2ffavicon.ico&step=confirmation"],
    "vk.com": ["https://vk.com/login\\?u=2&to=ZmF2aWNvbi5pY28-"],
    "tumblr.com": ["https://www.tumblr.com/(login|signin)/?\\??(.+)favicon.ico"],
    "flickr.com": ["https://www.flickr.com/(login|signin)/?\\??(.+)favicon.ico"],
    "blogger.com": ["https://www.blogger.com/favicon.ico"],
    "amazon.com": ["https://www.amazon.com/favicon.ico"],
    "disqus.com": ["https://disqus.com/favicon.ico"],
    "meetup.com": ["https://secure.meetup.com/login/\\?returnUri=https%3A%2F%2Fwww.meetup.com%2Fimg%2Fajax_loader_trans.gif"],
    "khanacademy.org": ["https://www.khanacademy.org/login\\?continue=https%3A//www.khanacademy.org/favicon.ico"],
    "500px.com": ["https://500px.com/login\\?r=%2Ffavicon.ico"]
  },
  urlFilter: {
    "blizzard.com": ["https://us.battle.net/forums/static/images/icons/bnet-favicon.ico"],
    "dropbox.com": ["www.dropbox.com/login?cont=https://www.dropbox.com/static/images/about/dropbox_logo_glyph_2015.svg"],
    "imdb.com": ["www.imdb.com/ap/signin?_encoding=UTF8&openid.assoc_handle=imdb_us&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.mode=checkid_setup&openid.ns=http://specs.openid.net/auth/2.0&openid.pape.max_auth_age=10000000&openid.return_to=https://www.imdb.com/favicon.ico"]
  }
};
// EXTERNAL MODULE: ./chrome/extension/hooks.js
var hooks = __webpack_require__(659);
;// ./chrome/extension/utils.js
function isValidUrl(string) {
  try {
    if (!string) {
      return false;
    }

    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
;// ./chrome/extension/background.js





var _chrome$avast, _storeActions;



function background_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function background_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? background_ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : background_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }














 // Browser Privacy Guard API reference

var browserPrivacyGuard = (_chrome$avast = chrome.avast) === null || _chrome$avast === void 0 ? void 0 : _chrome$avast.privacyGuard;
var storeActions = (_storeActions = {}, _storeActions[TOGGLE_FINGERPRINT_PROTECTION] = toggleFingerprintProtectionForDomain, _storeActions[TOGGLE_SOCIAL_MEDIA_PROTECTION] = toggleSocialMediaProtection, _storeActions);
(0,lib/* createBackgroundStore */.YC)({
  store: configureStore,
  actions: storeActions
});

function updateDynamicRulesPromise(rules) {
  return new Promise(function (resolve) {
    chrome.declarativeNetRequest.updateDynamicRules(rules, function () {
      if (chrome.runtime.lastError) {
        Logger.error("Error in adding Dynamic rules");
        resolve();
      } else {
        resolve();
      }
    });
  });
}

function enableDynamicNetRequestRules(_x) {
  return _enableDynamicNetRequestRules.apply(this, arguments);
}

function _enableDynamicNetRequestRules() {
  _enableDynamicNetRequestRules = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee9(requestObj) {
    var disableUrlList, whiteListFromConfig, whitelistUrl, whitelistDomain, _whitelistUrl, _whitelistDomain, domainsFromConfig, headerrules, headerRuleId, defaultHeaders, defaultRequestHeaders;

    return regenerator_default().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            disableUrlList = [];
            whiteListFromConfig = _toConsumableArray(Configuration.appSettings.whitelist);

            if (requestObj && requestObj.action === 'enableDomain') {
              whitelistUrl = requestObj.payload ? requestObj.payload.url : '';
              whitelistDomain = isValidUrl(whitelistUrl) ? new URL(whitelistUrl).hostname : '';
              whiteListFromConfig = whiteListFromConfig.filter(function (domain) {
                return whitelistDomain !== domain;
              });
            } else if (requestObj && requestObj.action === 'disableDomain') {
              _whitelistUrl = requestObj.payload ? requestObj.payload.url : '';
              _whitelistDomain = isValidUrl(_whitelistUrl) ? new URL(_whitelistUrl) : {};
              disableUrlList = _whitelistDomain.hostname ? [_whitelistDomain.hostname] : [];
            } // block requests for social media urls other than allowed domains


            if (!Configuration.appSettings.socialMediaProtection) {
              _context9.next = 5;
              break;
            }

            return _context9.delegateYield( /*#__PURE__*/regenerator_default().mark(function _callee8() {
              var rules, ruleId, _loop, filterType;

              return regenerator_default().wrap(function _callee8$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      rules = [];
                      ruleId = 100;

                      _loop = function _loop(filterType) {
                        var _loop2 = function _loop2(allowedDomainForResource) {
                          SocialResources[filterType][allowedDomainForResource].forEach(function (resourceURL) {
                            var _condition;

                            rules.push({
                              id: ruleId++,
                              priority: 1,
                              action: {
                                type: "block"
                              },
                              condition: (_condition = {}, _condition[filterType] = resourceURL, _condition.excludedInitiatorDomains = [allowedDomainForResource], _condition.excludedRequestDomains = [].concat(_toConsumableArray(Configuration.appSettings.disabled), _toConsumableArray(whiteListFromConfig), _toConsumableArray(disableUrlList)), _condition.resourceTypes = ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "media", "websocket", "webtransport", "webbundle", "other"], _condition)
                            });
                          });
                        };

                        for (var allowedDomainForResource in SocialResources[filterType]) {
                          _loop2(allowedDomainForResource);
                        }
                      };

                      for (filterType in SocialResources) {
                        _loop(filterType);
                      }

                      _context8.next = 6;
                      return updateDynamicRulesPromise({
                        addRules: rules,
                        removeRuleIds: rules.map(function (r) {
                          return r.id;
                        })
                      });

                    case 6:
                    case "end":
                      return _context8.stop();
                  }
                }
              }, _callee8);
            })(), "t0", 5);

          case 5:
            domainsFromConfig = [];
            headerrules = [];
            headerRuleId = 1;
            Configuration.appSettings.profiles.forEach(function (profile) {
              var profileNumber = profile.profile;
              var headers = Profiles[profileNumber].Headers;
              var requestHeaders = Object.entries(headers).map(function (_ref8) {
                var _ref9 = _slicedToArray(_ref8, 2),
                    header = _ref9[0],
                    value = _ref9[1];

                return {
                  header: header,
                  operation: "set",
                  value: value
                };
              });

              if (Profiles[profileNumber].OmitHeaders) {
                var omitHeaders = Profiles[profileNumber].OmitHeaders.map(function (omitHeader) {
                  return {
                    header: omitHeader,
                    operation: "remove"
                  };
                });
                requestHeaders.push.apply(requestHeaders, _toConsumableArray(omitHeaders));
              }

              var domainFilterForProfile = "http*://*".concat(profile.domain, "/");
              headerrules.push({
                id: headerRuleId++,
                priority: 1,
                action: {
                  type: "modifyHeaders",
                  requestHeaders: requestHeaders
                },
                condition: {
                  urlFilter: domainFilterForProfile,
                  excludedRequestDomains: [].concat(_toConsumableArray(Configuration.appSettings.disabled), _toConsumableArray(whiteListFromConfig), _toConsumableArray(disableUrlList)),
                  resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "media", "websocket", "webtransport", "webbundle", "other"]
                }
              });
              domainsFromConfig.push(profile.domain);
            });
            defaultHeaders = Profiles[0].Headers;
            defaultRequestHeaders = Object.entries(defaultHeaders).map(function (_ref10) {
              var _ref11 = _slicedToArray(_ref10, 2),
                  header = _ref11[0],
                  value = _ref11[1];

              return {
                header: header,
                operation: "set",
                value: value
              };
            }); // Create a catch-all rule for all other URLs not matched with config

            headerrules.push({
              id: headerRuleId++,
              priority: 1,
              action: {
                type: "modifyHeaders",
                requestHeaders: defaultRequestHeaders
              },
              condition: {
                urlFilter: "|",
                excludedRequestDomains: [].concat(domainsFromConfig, _toConsumableArray(Configuration.appSettings.disabled), _toConsumableArray(whiteListFromConfig), _toConsumableArray(disableUrlList)),
                resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "media", "websocket", "webtransport", "webbundle", "other"]
              }
            });
            _context9.next = 14;
            return updateDynamicRulesPromise({
              addRules: headerrules,
              removeRuleIds: headerrules.map(function (r) {
                return r.id;
              })
            });

          case 14:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _enableDynamicNetRequestRules.apply(this, arguments);
}

function disableDynamicNetRequestRules() {
  return _disableDynamicNetRequestRules.apply(this, arguments);
}

function _disableDynamicNetRequestRules() {
  _disableDynamicNetRequestRules = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee10() {
    var addedRules, ruleIdsToBeRemoved;
    return regenerator_default().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return chrome.declarativeNetRequest.getDynamicRules();

          case 2:
            addedRules = _context10.sent;
            ruleIdsToBeRemoved = addedRules.map(function (rule) {
              return rule.id;
            });

            if (!(Array.isArray(ruleIdsToBeRemoved) && ruleIdsToBeRemoved.length)) {
              _context10.next = 7;
              break;
            }

            _context10.next = 7;
            return updateDynamicRulesPromise({
              removeRuleIds: ruleIdsToBeRemoved
            });

          case 7:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _disableDynamicNetRequestRules.apply(this, arguments);
}

function updateDynamicRulesAndDispatchAction(_x2) {
  return _updateDynamicRulesAndDispatchAction.apply(this, arguments);
}

function _updateDynamicRulesAndDispatchAction() {
  _updateDynamicRulesAndDispatchAction = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee11(request) {
    return regenerator_default().wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return Configuration.init();

          case 2:
            _context11.next = 4;
            return disableDynamicNetRequestRules();

          case 4:
            _context11.next = 6;
            return enableDynamicNetRequestRules(request);

          case 6:
            if (request.action === 'enable') {
              configureStore.dispatch(toggleFingerprintProtection({
                data: true
              }));
            } else if (request.action === 'disableDomain' && request.payload) {
              configureStore.dispatch(toggleFingerprintProtectionForDomain({
                data: false,
                url: request.payload.url
              }));
            } else if (request.action === 'enableDomain' && request.payload) {
              configureStore.dispatch(toggleFingerprintProtectionForDomain({
                data: true,
                url: request.payload.url
              }));
            }

          case 7:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _updateDynamicRulesAndDispatchAction.apply(this, arguments);
}

function sendExternalMessage(id, message) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return new Promise(function (resolve, reject) {
    if (browserPrivacyGuard) {
      browserPrivacyGuard.isBuiltinPrivacyGuardEnabled(function (enabled) {
        if (enabled) {
          if (message === 'fingerprintDetected') {
            browserPrivacyGuard.notifyFingerprintDetected(data.tab);
            resolve({
              success: true
            });
          }
        } else {
          try {
            chrome.runtime.sendMessage(id, {
              action: message,
              payload: background_objectSpread({}, data)
            }, function (response) {
              resolve(response);
            });
          } catch (e) {
            reject(e);
          }
        }
      });
    } else {
      try {
        chrome.runtime.sendMessage(id, {
          action: message,
          payload: background_objectSpread({}, data)
        }, function (response) {
          resolve(response);
        });
      } catch (e) {
        reject(e);
      }
    }
  });
} // Initialize app


AppBootstrap.init().then(function () {
  configureStore.dispatch(updateSocialMediaProtectionStatus(Configuration.appSettings.socialMediaProtection));
  configureStore.dispatch(updateFingerprintAttemptsCounter(Configuration.stats[StorageKeys.AFPData.FINGERPRINT_ATTEMPTS_DETECTED_COUNTER]));

  if (Configuration.appSettings.isActive) {
    disableDynamicNetRequestRules().then(function () {
      enableDynamicNetRequestRules();
    });
  } else {
    disableDynamicNetRequestRules().then(function () {});
  }
}); // ============================================================================
// Built-in Browser Privacy Guard API Listeners
// Registered synchronously at top level for service worker compatibility
// ============================================================================

if (browserPrivacyGuard) {
  browserPrivacyGuard.onEnable.addListener( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
    return regenerator_default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            Logger.info("Browser Privacy Guard: enable requested");
            _context.next = 3;
            return updateDynamicRulesAndDispatchAction({
              action: 'enable'
            });

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  browserPrivacyGuard.onDisable.addListener( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2() {
    return regenerator_default().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            Logger.info("Browser Privacy Guard: disable requested");
            _context2.next = 3;
            return disableDynamicNetRequestRules();

          case 3:
            configureStore.dispatch(toggleFingerprintProtection({
              data: false
            }));

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  browserPrivacyGuard.onDisableDomain.addListener( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee3(websiteUrl) {
      var url;
      return regenerator_default().wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              Logger.info("Browser Privacy Guard: disable domain ".concat(websiteUrl));
              url = websiteUrl.includes('://') ? websiteUrl : "https://".concat(websiteUrl);
              _context3.next = 4;
              return updateDynamicRulesAndDispatchAction({
                action: 'disableDomain',
                payload: {
                  url: url
                }
              });

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
  browserPrivacyGuard.onEnableDomain.addListener( /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee4(websiteUrl) {
      var url;
      return regenerator_default().wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              Logger.info("Browser Privacy Guard: enable domain ".concat(websiteUrl));
              url = websiteUrl.includes('://') ? websiteUrl : "https://".concat(websiteUrl);
              _context4.next = 4;
              return updateDynamicRulesAndDispatchAction({
                action: 'enableDomain',
                payload: {
                  url: url
                }
              });

            case 4:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());
  browserPrivacyGuard.onGetDetectionsCount.addListener( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee5() {
    var count;
    return regenerator_default().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return Configuration.init();

          case 2:
            count = configureStore.getState().antiFingerprint.detectionAttempts;
            browserPrivacyGuard.sendDetectionsCount(count);
            Logger.info("Browser Privacy Guard: sent detection count ".concat(count));

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  })));
  browserPrivacyGuard.onGetDisabledDomains.addListener( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee6() {
    var disabledDomains, whitelistedDomains, allDisabledDomains;
    return regenerator_default().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return Configuration.init();

          case 2:
            disabledDomains = Configuration.appSettings.disabled || [];
            whitelistedDomains = Configuration.appSettings.whitelist || [];
            allDisabledDomains = [].concat(_toConsumableArray(disabledDomains), _toConsumableArray(whitelistedDomains));
            browserPrivacyGuard.sendDisabledDomains(allDisabledDomains);
            Logger.info("Browser Privacy Guard: sent ".concat(allDisabledDomains.length, " disabled domains"));

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  })));
} // ============================================================================
// External Extension Messaging (Legacy)
// ============================================================================


chrome.runtime.onMessageExternal.addListener( /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee7(request, sender, sendResponse) {
    return regenerator_default().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!(settings.PRIVACY_GUARD_ID !== sender.id)) {
              _context7.next = 3;
              break;
            }

            Logger.info("Message received from unauthorized extension: ".concat(sender.id));
            return _context7.abrupt("return", false);

          case 3:
            Logger.info("Message received from authorized extension: ".concat(sender.id));
            Logger.info(JSON.stringify(request));

            if (request.action === 'enable' || request.action === 'disableDomain' || request.action === 'enableDomain') {
              updateDynamicRulesAndDispatchAction(request);
              sendResponse({
                success: true
              });
            } else if (request.action === 'disable') {
              disableDynamicNetRequestRules();
              configureStore.dispatch(toggleFingerprintProtection({
                data: false
              }));
              sendResponse({
                success: true
              });
            } else if (request.action === 'getDetectionsCount') {
              sendResponse({
                success: true,
                message: configureStore.getState().antiFingerprint.detectionAttempts
              });
            } else {
              sendResponse({
                success: false,
                message: ''
              });
            }

            return _context7.abrupt("return", true);

          case 7:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x5, _x6, _x7) {
    return _ref7.apply(this, arguments);
  };
}()); // ============================================================================
// Internal Extension Messages
// ============================================================================

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'fingerprintAttemptDetected') {
    Logger.info("Fingerprint attempt dispatched");
    configureStore.dispatch(notifyFingerprintAttempt());

    if (Configuration.appSettings.notifications) {
      chrome.notifications.create('fingerprint-attempt', request.payload, function () {});
    } // Notify privacy guard


    sendExternalMessage(settings.PRIVACY_GUARD_ID, "fingerprintDetected", {
      tab: sender.tab.id
    })["catch"](function (err) {
      Logger.error(err.message);
    });
  } else if (request.type === 'setFontFilter') {
    if (chrome.fontSettings && chrome.fontSettings.setFontsFilter) {
      Logger.info("Setting font filter");
      chrome.fontSettings.setFontsFilterEnabled(true);
      chrome.fontSettings.setFontsFilter(request.payload);
    } else {
      Logger.info("Font filter is not supported in this browser");
    }
  } else if (request.type === 'NEW_FRAME_INJECTED') {
    chrome.scripting.executeScript({
      target: {
        tabId: sender.tab.id
      },
      world: "MAIN",
      func: hooks/* default */.A,
      args: [request.payload]
    });
  }

  return true;
}); // ============================================================================
// Tab Status Updates
// ============================================================================

function updateStatus() {
  chrome.tabs.query({
    'active': true
  }, function (tabs) {
    if (tabs[0].url) {
      var _Configuration$appSet, _Configuration$appSet2;

      var url = new URL(tabs[0].url);

      if ((_Configuration$appSet = Configuration.appSettings) !== null && _Configuration$appSet !== void 0 && (_Configuration$appSet2 = _Configuration$appSet.disabled) !== null && _Configuration$appSet2 !== void 0 && _Configuration$appSet2.includes(url.hostname)) {
        configureStore.dispatch(updateFingerprintProtectionStatus(false));
      } else {
        configureStore.dispatch(updateFingerprintProtectionStatus(true));
      }
    }
  });
}

chrome.tabs.onActivated.addListener(updateStatus);
chrome.tabs.onUpdated.addListener(updateStatus);
})();

/******/ })()
;