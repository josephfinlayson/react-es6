/* */ 
"format cjs";
(function(process) {
  ;
  (function(undefined) {
    var objectTypes = {
      'function': true,
      'object': true
    };
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
        freeSelf = objectTypes[typeof self] && self.Object && self,
        freeWindow = objectTypes[typeof window] && window && window.Object && window,
        freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
        moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
        freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;
    var root = root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;
    var Rx = {
      internals: {},
      config: {Promise: root.Promise},
      helpers: {}
    };
    var noop = Rx.helpers.noop = function() {},
        identity = Rx.helpers.identity = function(x) {
          return x;
        },
        defaultNow = Rx.helpers.defaultNow = Date.now,
        defaultComparer = Rx.helpers.defaultComparer = function(x, y) {
          return isEqual(x, y);
        },
        defaultSubComparer = Rx.helpers.defaultSubComparer = function(x, y) {
          return x > y ? 1 : (x < y ? -1 : 0);
        },
        defaultKeySerializer = Rx.helpers.defaultKeySerializer = function(x) {
          return x.toString();
        },
        defaultError = Rx.helpers.defaultError = function(err) {
          throw err;
        },
        isPromise = Rx.helpers.isPromise = function(p) {
          return !!p && typeof p.subscribe !== 'function' && typeof p.then === 'function';
        },
        isFunction = Rx.helpers.isFunction = (function() {
          var isFn = function(value) {
            return typeof value == 'function' || false;
          };
          if (isFn(/x/)) {
            isFn = function(value) {
              return typeof value == 'function' && toString.call(value) == '[object Function]';
            };
          }
          return isFn;
        }());
    function cloneArray(arr) {
      for (var a = [],
          i = 0,
          len = arr.length; i < len; i++) {
        a.push(arr[i]);
      }
      return a;
    }
    var errorObj = {e: {}};
    var tryCatchTarget;
    function tryCatcher() {
      try {
        return tryCatchTarget.apply(this, arguments);
      } catch (e) {
        errorObj.e = e;
        return errorObj;
      }
    }
    function tryCatch(fn) {
      if (!isFunction(fn)) {
        throw new TypeError('fn must be a function');
      }
      tryCatchTarget = fn;
      return tryCatcher;
    }
    function thrower(e) {
      throw e;
    }
    Rx.config.longStackSupport = false;
    var hasStacks = false,
        stacks = tryCatch(function() {
          throw new Error();
        })();
    hasStacks = !!stacks.e && !!stacks.e.stack;
    var rStartingLine = captureLine(),
        rFileName;
    var STACK_JUMP_SEPARATOR = 'From previous event:';
    function makeStackTraceLong(error, observable) {
      if (hasStacks && observable.stack && typeof error === 'object' && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
        var stacks = [];
        for (var o = observable; !!o; o = o.source) {
          if (o.stack) {
            stacks.unshift(o.stack);
          }
        }
        stacks.unshift(error.stack);
        var concatedStacks = stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');
        error.stack = filterStackString(concatedStacks);
      }
    }
    function filterStackString(stackString) {
      var lines = stackString.split('\n'),
          desiredLines = [];
      for (var i = 0,
          len = lines.length; i < len; i++) {
        var line = lines[i];
        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
          desiredLines.push(line);
        }
      }
      return desiredLines.join('\n');
    }
    function isInternalFrame(stackLine) {
      var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
      if (!fileNameAndLineNumber) {
        return false;
      }
      var fileName = fileNameAndLineNumber[0],
          lineNumber = fileNameAndLineNumber[1];
      return fileName === rFileName && lineNumber >= rStartingLine && lineNumber <= rEndingLine;
    }
    function isNodeFrame(stackLine) {
      return stackLine.indexOf('(module.js:') !== -1 || stackLine.indexOf('(node.js:') !== -1;
    }
    function captureLine() {
      if (!hasStacks) {
        return;
      }
      try {
        throw new Error();
      } catch (e) {
        var lines = e.stack.split('\n');
        var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
          return;
        }
        rFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
      }
    }
    function getFileNameAndLineNumber(stackLine) {
      var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
      if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
      }
      var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
      if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
      }
      var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
      if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
      }
    }
    var EmptyError = Rx.EmptyError = function() {
      this.message = 'Sequence contains no elements.';
      this.name = 'EmptyError';
      Error.call(this);
    };
    EmptyError.prototype = Error.prototype;
    var ObjectDisposedError = Rx.ObjectDisposedError = function() {
      this.message = 'Object has been disposed';
      this.name = 'ObjectDisposedError';
      Error.call(this);
    };
    ObjectDisposedError.prototype = Error.prototype;
    var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function() {
      this.message = 'Argument out of range';
      this.name = 'ArgumentOutOfRangeError';
      Error.call(this);
    };
    ArgumentOutOfRangeError.prototype = Error.prototype;
    var NotSupportedError = Rx.NotSupportedError = function(message) {
      this.message = message || 'This operation is not supported';
      this.name = 'NotSupportedError';
      Error.call(this);
    };
    NotSupportedError.prototype = Error.prototype;
    var NotImplementedError = Rx.NotImplementedError = function(message) {
      this.message = message || 'This operation is not implemented';
      this.name = 'NotImplementedError';
      Error.call(this);
    };
    NotImplementedError.prototype = Error.prototype;
    var notImplemented = Rx.helpers.notImplemented = function() {
      throw new NotImplementedError();
    };
    var notSupported = Rx.helpers.notSupported = function() {
      throw new NotSupportedError();
    };
    var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';
    if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
      $iterator$ = '@@iterator';
    }
    var doneEnumerator = Rx.doneEnumerator = {
      done: true,
      value: undefined
    };
    var isIterable = Rx.helpers.isIterable = function(o) {
      return o[$iterator$] !== undefined;
    };
    var isArrayLike = Rx.helpers.isArrayLike = function(o) {
      return o && o.length !== undefined;
    };
    Rx.helpers.iterator = $iterator$;
    var bindCallback = Rx.internals.bindCallback = function(func, thisArg, argCount) {
      if (typeof thisArg === 'undefined') {
        return func;
      }
      switch (argCount) {
        case 0:
          return function() {
            return func.call(thisArg);
          };
        case 1:
          return function(arg) {
            return func.call(thisArg, arg);
          };
        case 2:
          return function(value, index) {
            return func.call(thisArg, value, index);
          };
        case 3:
          return function(value, index, collection) {
            return func.call(thisArg, value, index, collection);
          };
      }
      return function() {
        return func.apply(thisArg, arguments);
      };
    };
    var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
        dontEnumsLength = dontEnums.length;
    var argsClass = '[object Arguments]',
        arrayClass = '[object Array]',
        boolClass = '[object Boolean]',
        dateClass = '[object Date]',
        errorClass = '[object Error]',
        funcClass = '[object Function]',
        numberClass = '[object Number]',
        objectClass = '[object Object]',
        regexpClass = '[object RegExp]',
        stringClass = '[object String]';
    var toString = Object.prototype.toString,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        supportsArgsClass = toString.call(arguments) == argsClass,
        supportNodeClass,
        errorProto = Error.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype,
        propertyIsEnumerable = objectProto.propertyIsEnumerable;
    try {
      supportNodeClass = !(toString.call(document) == objectClass && !({'toString': 0} + ''));
    } catch (e) {
      supportNodeClass = true;
    }
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {
      'constructor': true,
      'toLocaleString': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = {
      'constructor': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {
      'constructor': true,
      'toString': true
    };
    nonEnumProps[objectClass] = {'constructor': true};
    var support = {};
    (function() {
      var ctor = function() {
        this.x = 1;
      },
          props = [];
      ctor.prototype = {
        'valueOf': 1,
        'y': 1
      };
      for (var key in new ctor) {
        props.push(key);
      }
      for (key in arguments) {}
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');
      support.nonEnumArgs = key != 0;
      support.nonEnumShadows = !/valueOf/.test(props);
    }(1));
    var isObject = Rx.internals.isObject = function(value) {
      var type = typeof value;
      return value && (type == 'function' || type == 'object') || false;
    };
    function keysIn(object) {
      var result = [];
      if (!isObject(object)) {
        return result;
      }
      if (support.nonEnumArgs && object.length && isArguments(object)) {
        object = slice.call(object);
      }
      var skipProto = support.enumPrototypes && typeof object == 'function',
          skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);
      for (var key in object) {
        if (!(skipProto && key == 'prototype') && !(skipErrorProps && (key == 'message' || key == 'name'))) {
          result.push(key);
        }
      }
      if (support.nonEnumShadows && object !== objectProto) {
        var ctor = object.constructor,
            index = -1,
            length = dontEnumsLength;
        if (object === (ctor && ctor.prototype)) {
          var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
              nonEnum = nonEnumProps[className];
        }
        while (++index < length) {
          key = dontEnums[index];
          if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
            result.push(key);
          }
        }
      }
      return result;
    }
    function internalFor(object, callback, keysFunc) {
      var index = -1,
          props = keysFunc(object),
          length = props.length;
      while (++index < length) {
        var key = props[index];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }
    function internalForIn(object, callback) {
      return internalFor(object, callback, keysIn);
    }
    function isNode(value) {
      return typeof value.toString != 'function' && typeof(value + '') == 'string';
    }
    var isArguments = function(value) {
      return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
    };
    if (!supportsArgsClass) {
      isArguments = function(value) {
        return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
      };
    }
    var isEqual = Rx.internals.isEqual = function(x, y) {
      return deepEquals(x, y, [], []);
    };
    function deepEquals(a, b, stackA, stackB) {
      if (a === b) {
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;
      if (a === a && (a == null || b == null || (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
        return false;
      }
      var className = toString.call(a),
          otherClass = toString.call(b);
      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          return +a == +b;
        case numberClass:
          return (a != +a) ? b != +b : (a == 0 ? (1 / a == 1 / b) : a == +b);
        case regexpClass:
        case stringClass:
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
        if (ctorA != ctorB && !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ('constructor' in a && 'constructor' in b)) {
          return false;
        }
      }
      var initedStack = !stackA;
      stackA || (stackA = []);
      stackB || (stackB = []);
      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      var result = true;
      stackA.push(a);
      stackB.push(b);
      if (isArr) {
        length = a.length;
        size = b.length;
        result = size == length;
        if (result) {
          while (size--) {
            var index = length,
                value = b[size];
            if (!(result = deepEquals(a[size], value, stackA, stackB))) {
              break;
            }
          }
        }
      } else {
        internalForIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            size++;
            return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
          }
        });
        if (result) {
          internalForIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();
      return result;
    }
    var hasProp = {}.hasOwnProperty,
        slice = Array.prototype.slice;
    var inherits = Rx.internals.inherits = function(child, parent) {
      function __() {
        this.constructor = child;
      }
      __.prototype = parent.prototype;
      child.prototype = new __();
    };
    var addProperties = Rx.internals.addProperties = function(obj) {
      for (var sources = [],
          i = 1,
          len = arguments.length; i < len; i++) {
        sources.push(arguments[i]);
      }
      for (var idx = 0,
          ln = sources.length; idx < ln; idx++) {
        var source = sources[idx];
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    };
    var addRef = Rx.internals.addRef = function(xs, r) {
      return new AnonymousObservable(function(observer) {
        return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));
      });
    };
    function arrayInitialize(count, factory) {
      var a = new Array(count);
      for (var i = 0; i < count; i++) {
        a[i] = factory();
      }
      return a;
    }
    function IndexedItem(id, value) {
      this.id = id;
      this.value = value;
    }
    IndexedItem.prototype.compareTo = function(other) {
      var c = this.value.compareTo(other.value);
      c === 0 && (c = this.id - other.id);
      return c;
    };
    var PriorityQueue = Rx.internals.PriorityQueue = function(capacity) {
      this.items = new Array(capacity);
      this.length = 0;
    };
    var priorityProto = PriorityQueue.prototype;
    priorityProto.isHigherPriority = function(left, right) {
      return this.items[left].compareTo(this.items[right]) < 0;
    };
    priorityProto.percolate = function(index) {
      if (index >= this.length || index < 0) {
        return;
      }
      var parent = index - 1 >> 1;
      if (parent < 0 || parent === index) {
        return;
      }
      if (this.isHigherPriority(index, parent)) {
        var temp = this.items[index];
        this.items[index] = this.items[parent];
        this.items[parent] = temp;
        this.percolate(parent);
      }
    };
    priorityProto.heapify = function(index) {
      +index || (index = 0);
      if (index >= this.length || index < 0) {
        return;
      }
      var left = 2 * index + 1,
          right = 2 * index + 2,
          first = index;
      if (left < this.length && this.isHigherPriority(left, first)) {
        first = left;
      }
      if (right < this.length && this.isHigherPriority(right, first)) {
        first = right;
      }
      if (first !== index) {
        var temp = this.items[index];
        this.items[index] = this.items[first];
        this.items[first] = temp;
        this.heapify(first);
      }
    };
    priorityProto.peek = function() {
      return this.items[0].value;
    };
    priorityProto.removeAt = function(index) {
      this.items[index] = this.items[--this.length];
      this.items[this.length] = undefined;
      this.heapify();
    };
    priorityProto.dequeue = function() {
      var result = this.peek();
      this.removeAt(0);
      return result;
    };
    priorityProto.enqueue = function(item) {
      var index = this.length++;
      this.items[index] = new IndexedItem(PriorityQueue.count++, item);
      this.percolate(index);
    };
    priorityProto.remove = function(item) {
      for (var i = 0; i < this.length; i++) {
        if (this.items[i].value === item) {
          this.removeAt(i);
          return true;
        }
      }
      return false;
    };
    PriorityQueue.count = 0;
    var CompositeDisposable = Rx.CompositeDisposable = function() {
      var args = [],
          i,
          len;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
        len = args.length;
      } else {
        len = arguments.length;
        args = new Array(len);
        for (i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      for (i = 0; i < len; i++) {
        if (!isDisposable(args[i])) {
          throw new TypeError('Not a disposable');
        }
      }
      this.disposables = args;
      this.isDisposed = false;
      this.length = args.length;
    };
    var CompositeDisposablePrototype = CompositeDisposable.prototype;
    CompositeDisposablePrototype.add = function(item) {
      if (this.isDisposed) {
        item.dispose();
      } else {
        this.disposables.push(item);
        this.length++;
      }
    };
    CompositeDisposablePrototype.remove = function(item) {
      var shouldDispose = false;
      if (!this.isDisposed) {
        var idx = this.disposables.indexOf(item);
        if (idx !== -1) {
          shouldDispose = true;
          this.disposables.splice(idx, 1);
          this.length--;
          item.dispose();
        }
      }
      return shouldDispose;
    };
    CompositeDisposablePrototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var len = this.disposables.length,
            currentDisposables = new Array(len);
        for (var i = 0; i < len; i++) {
          currentDisposables[i] = this.disposables[i];
        }
        this.disposables = [];
        this.length = 0;
        for (i = 0; i < len; i++) {
          currentDisposables[i].dispose();
        }
      }
    };
    var Disposable = Rx.Disposable = function(action) {
      this.isDisposed = false;
      this.action = action || noop;
    };
    Disposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.action();
        this.isDisposed = true;
      }
    };
    var disposableCreate = Disposable.create = function(action) {
      return new Disposable(action);
    };
    var disposableEmpty = Disposable.empty = {dispose: noop};
    var isDisposable = Disposable.isDisposable = function(d) {
      return d && isFunction(d.dispose);
    };
    var checkDisposed = Disposable.checkDisposed = function(disposable) {
      if (disposable.isDisposed) {
        throw new ObjectDisposedError();
      }
    };
    var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = function() {
      this.isDisposed = false;
      this.current = null;
    };
    SingleAssignmentDisposable.prototype.getDisposable = function() {
      return this.current;
    };
    SingleAssignmentDisposable.prototype.setDisposable = function(value) {
      if (this.current) {
        throw new Error('Disposable has already been assigned');
      }
      var shouldDispose = this.isDisposed;
      !shouldDispose && (this.current = value);
      shouldDispose && value && value.dispose();
    };
    SingleAssignmentDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var old = this.current;
        this.current = null;
      }
      old && old.dispose();
    };
    var SerialDisposable = Rx.SerialDisposable = function() {
      this.isDisposed = false;
      this.current = null;
    };
    SerialDisposable.prototype.getDisposable = function() {
      return this.current;
    };
    SerialDisposable.prototype.setDisposable = function(value) {
      var shouldDispose = this.isDisposed;
      if (!shouldDispose) {
        var old = this.current;
        this.current = value;
      }
      old && old.dispose();
      shouldDispose && value && value.dispose();
    };
    SerialDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var old = this.current;
        this.current = null;
      }
      old && old.dispose();
    };
    var RefCountDisposable = Rx.RefCountDisposable = (function() {
      function InnerDisposable(disposable) {
        this.disposable = disposable;
        this.disposable.count++;
        this.isInnerDisposed = false;
      }
      InnerDisposable.prototype.dispose = function() {
        if (!this.disposable.isDisposed && !this.isInnerDisposed) {
          this.isInnerDisposed = true;
          this.disposable.count--;
          if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
            this.disposable.isDisposed = true;
            this.disposable.underlyingDisposable.dispose();
          }
        }
      };
      function RefCountDisposable(disposable) {
        this.underlyingDisposable = disposable;
        this.isDisposed = false;
        this.isPrimaryDisposed = false;
        this.count = 0;
      }
      RefCountDisposable.prototype.dispose = function() {
        if (!this.isDisposed && !this.isPrimaryDisposed) {
          this.isPrimaryDisposed = true;
          if (this.count === 0) {
            this.isDisposed = true;
            this.underlyingDisposable.dispose();
          }
        }
      };
      RefCountDisposable.prototype.getDisposable = function() {
        return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
      };
      return RefCountDisposable;
    })();
    function ScheduledDisposable(scheduler, disposable) {
      this.scheduler = scheduler;
      this.disposable = disposable;
      this.isDisposed = false;
    }
    function scheduleItem(s, self) {
      if (!self.isDisposed) {
        self.isDisposed = true;
        self.disposable.dispose();
      }
    }
    ScheduledDisposable.prototype.dispose = function() {
      this.scheduler.scheduleWithState(this, scheduleItem);
    };
    var ScheduledItem = Rx.internals.ScheduledItem = function(scheduler, state, action, dueTime, comparer) {
      this.scheduler = scheduler;
      this.state = state;
      this.action = action;
      this.dueTime = dueTime;
      this.comparer = comparer || defaultSubComparer;
      this.disposable = new SingleAssignmentDisposable();
    };
    ScheduledItem.prototype.invoke = function() {
      this.disposable.setDisposable(this.invokeCore());
    };
    ScheduledItem.prototype.compareTo = function(other) {
      return this.comparer(this.dueTime, other.dueTime);
    };
    ScheduledItem.prototype.isCancelled = function() {
      return this.disposable.isDisposed;
    };
    ScheduledItem.prototype.invokeCore = function() {
      return this.action(this.scheduler, this.state);
    };
    var Scheduler = Rx.Scheduler = (function() {
      function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute) {
        this.now = now;
        this._schedule = schedule;
        this._scheduleRelative = scheduleRelative;
        this._scheduleAbsolute = scheduleAbsolute;
      }
      Scheduler.isScheduler = function(s) {
        return s instanceof Scheduler;
      };
      function invokeAction(scheduler, action) {
        action();
        return disposableEmpty;
      }
      var schedulerProto = Scheduler.prototype;
      schedulerProto.schedule = function(action) {
        return this._schedule(action, invokeAction);
      };
      schedulerProto.scheduleWithState = function(state, action) {
        return this._schedule(state, action);
      };
      schedulerProto.scheduleWithRelative = function(dueTime, action) {
        return this._scheduleRelative(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative(state, dueTime, action);
      };
      schedulerProto.scheduleWithAbsolute = function(dueTime, action) {
        return this._scheduleAbsolute(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute(state, dueTime, action);
      };
      Scheduler.now = defaultNow;
      Scheduler.normalize = function(timeSpan) {
        timeSpan < 0 && (timeSpan = 0);
        return timeSpan;
      };
      return Scheduler;
    }());
    var normalizeTime = Scheduler.normalize,
        isScheduler = Scheduler.isScheduler;
    (function(schedulerProto) {
      function invokeRecImmediate(scheduler, pair) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        action(state, innerAction);
        return group;
        function innerAction(state2) {
          var isAdded = false,
              isDone = false;
          var d = scheduler.scheduleWithState(state2, scheduleWork);
          if (!isDone) {
            group.add(d);
            isAdded = true;
          }
          function scheduleWork(_, state3) {
            if (isAdded) {
              group.remove(d);
            } else {
              isDone = true;
            }
            action(state3, innerAction);
            return disposableEmpty;
          }
        }
      }
      function invokeRecDate(scheduler, pair, method) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        action(state, innerAction);
        return group;
        function innerAction(state2, dueTime1) {
          var isAdded = false,
              isDone = false;
          var d = scheduler[method](state2, dueTime1, scheduleWork);
          if (!isDone) {
            group.add(d);
            isAdded = true;
          }
          function scheduleWork(_, state3) {
            if (isAdded) {
              group.remove(d);
            } else {
              isDone = true;
            }
            action(state3, innerAction);
            return disposableEmpty;
          }
        }
      }
      function invokeRecDateRelative(s, p) {
        return invokeRecDate(s, p, 'scheduleWithRelativeAndState');
      }
      function invokeRecDateAbsolute(s, p) {
        return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');
      }
      function scheduleInnerRecursive(action, self) {
        action(function(dt) {
          self(action, dt);
        });
      }
      schedulerProto.scheduleRecursive = function(action) {
        return this.scheduleRecursiveWithState(action, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithState = function(state, action) {
        return this.scheduleWithState([state, action], invokeRecImmediate);
      };
      schedulerProto.scheduleRecursiveWithRelative = function(dueTime, action) {
        return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative([state, action], dueTime, invokeRecDateRelative);
      };
      schedulerProto.scheduleRecursiveWithAbsolute = function(dueTime, action) {
        return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute([state, action], dueTime, invokeRecDateAbsolute);
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      Scheduler.prototype.schedulePeriodic = function(period, action) {
        return this.schedulePeriodicWithState(null, period, action);
      };
      Scheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        if (typeof root.setInterval === 'undefined') {
          throw new NotSupportedError();
        }
        period = normalizeTime(period);
        var s = state,
            id = root.setInterval(function() {
              s = action(s);
            }, period);
        return disposableCreate(function() {
          root.clearInterval(id);
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      schedulerProto.catchError = schedulerProto['catch'] = function(handler) {
        return new CatchScheduler(this, handler);
      };
    }(Scheduler.prototype));
    var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function() {
      function tick(command, recurse) {
        recurse(0, this._period);
        try {
          this._state = this._action(this._state);
        } catch (e) {
          this._cancel.dispose();
          throw e;
        }
      }
      function SchedulePeriodicRecursive(scheduler, state, period, action) {
        this._scheduler = scheduler;
        this._state = state;
        this._period = period;
        this._action = action;
      }
      SchedulePeriodicRecursive.prototype.start = function() {
        var d = new SingleAssignmentDisposable();
        this._cancel = d;
        d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));
        return d;
      };
      return SchedulePeriodicRecursive;
    }());
    var immediateScheduler = Scheduler.immediate = (function() {
      function scheduleNow(state, action) {
        return action(this, state);
      }
      return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
    }());
    var currentThreadScheduler = Scheduler.currentThread = (function() {
      var queue;
      function runTrampoline() {
        while (queue.length > 0) {
          var item = queue.shift();
          !item.isCancelled() && item.invoke();
        }
      }
      function scheduleNow(state, action) {
        var si = new ScheduledItem(this, state, action, this.now());
        if (!queue) {
          queue = [si];
          var result = tryCatch(runTrampoline)();
          queue = null;
          if (result === errorObj) {
            return thrower(result.e);
          }
        } else {
          queue.push(si);
        }
        return si.disposable;
      }
      var currentScheduler = new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
      currentScheduler.scheduleRequired = function() {
        return !queue;
      };
      return currentScheduler;
    }());
    var scheduleMethod,
        clearMethod;
    var localTimer = (function() {
      var localSetTimeout,
          localClearTimeout = noop;
      if (!!root.setTimeout) {
        localSetTimeout = root.setTimeout;
        localClearTimeout = root.clearTimeout;
      } else if (!!root.WScript) {
        localSetTimeout = function(fn, time) {
          root.WScript.Sleep(time);
          fn();
        };
      } else {
        throw new NotSupportedError();
      }
      return {
        setTimeout: localSetTimeout,
        clearTimeout: localClearTimeout
      };
    }());
    var localSetTimeout = localTimer.setTimeout,
        localClearTimeout = localTimer.clearTimeout;
    (function() {
      var nextHandle = 1,
          tasksByHandle = {},
          currentlyRunning = false;
      clearMethod = function(handle) {
        delete tasksByHandle[handle];
      };
      function runTask(handle) {
        if (currentlyRunning) {
          localSetTimeout(function() {
            runTask(handle);
          }, 0);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunning = true;
            var result = tryCatch(task)();
            clearMethod(handle);
            currentlyRunning = false;
            if (result === errorObj) {
              return thrower(result.e);
            }
          }
        }
      }
      var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
      var setImmediate = typeof(setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;
      function postMessageSupported() {
        if (!root.postMessage || root.importScripts) {
          return false;
        }
        var isAsync = false,
            oldHandler = root.onmessage;
        root.onmessage = function() {
          isAsync = true;
        };
        root.postMessage('', '*');
        root.onmessage = oldHandler;
        return isAsync;
      }
      if (isFunction(setImmediate)) {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          setImmediate(function() {
            runTask(id);
          });
          return id;
        };
      } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          process.nextTick(function() {
            runTask(id);
          });
          return id;
        };
      } else if (postMessageSupported()) {
        var MSG_PREFIX = 'ms.rx.schedule' + Math.random();
        function onGlobalPostMessage(event) {
          if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
            runTask(event.data.substring(MSG_PREFIX.length));
          }
        }
        if (root.addEventListener) {
          root.addEventListener('message', onGlobalPostMessage, false);
        } else if (root.attachEvent) {
          root.attachEvent('onmessage', onGlobalPostMessage);
        } else {
          root.onmessage = onGlobalPostMessage;
        }
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          root.postMessage(MSG_PREFIX + currentId, '*');
          return id;
        };
      } else if (!!root.MessageChannel) {
        var channel = new root.MessageChannel();
        channel.port1.onmessage = function(e) {
          runTask(e.data);
        };
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          channel.port2.postMessage(id);
          return id;
        };
      } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {
        scheduleMethod = function(action) {
          var scriptElement = root.document.createElement('script');
          var id = nextHandle++;
          tasksByHandle[id] = action;
          scriptElement.onreadystatechange = function() {
            runTask(id);
            scriptElement.onreadystatechange = null;
            scriptElement.parentNode.removeChild(scriptElement);
            scriptElement = null;
          };
          root.document.documentElement.appendChild(scriptElement);
          return id;
        };
      } else {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          localSetTimeout(function() {
            runTask(id);
          }, 0);
          return id;
        };
      }
    }());
    var timeoutScheduler = Scheduler.timeout = Scheduler['default'] = (function() {
      function scheduleNow(state, action) {
        var scheduler = this,
            disposable = new SingleAssignmentDisposable();
        var id = scheduleMethod(function() {
          !disposable.isDisposed && disposable.setDisposable(action(scheduler, state));
        });
        return new CompositeDisposable(disposable, disposableCreate(function() {
          clearMethod(id);
        }));
      }
      function scheduleRelative(state, dueTime, action) {
        var scheduler = this,
            dt = Scheduler.normalize(dueTime),
            disposable = new SingleAssignmentDisposable();
        if (dt === 0) {
          return scheduler.scheduleWithState(state, action);
        }
        var id = localSetTimeout(function() {
          !disposable.isDisposed && disposable.setDisposable(action(scheduler, state));
        }, dt);
        return new CompositeDisposable(disposable, disposableCreate(function() {
          localClearTimeout(id);
        }));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
      }
      return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
    })();
    var CatchScheduler = (function(__super__) {
      function scheduleNow(state, action) {
        return this._scheduler.scheduleWithState(state, this._wrap(action));
      }
      function scheduleRelative(state, dueTime, action) {
        return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));
      }
      inherits(CatchScheduler, __super__);
      function CatchScheduler(scheduler, handler) {
        this._scheduler = scheduler;
        this._handler = handler;
        this._recursiveOriginal = null;
        this._recursiveWrapper = null;
        __super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);
      }
      CatchScheduler.prototype._clone = function(scheduler) {
        return new CatchScheduler(scheduler, this._handler);
      };
      CatchScheduler.prototype._wrap = function(action) {
        var parent = this;
        return function(self, state) {
          try {
            return action(parent._getRecursiveWrapper(self), state);
          } catch (e) {
            if (!parent._handler(e)) {
              throw e;
            }
            return disposableEmpty;
          }
        };
      };
      CatchScheduler.prototype._getRecursiveWrapper = function(scheduler) {
        if (this._recursiveOriginal !== scheduler) {
          this._recursiveOriginal = scheduler;
          var wrapper = this._clone(scheduler);
          wrapper._recursiveOriginal = scheduler;
          wrapper._recursiveWrapper = wrapper;
          this._recursiveWrapper = wrapper;
        }
        return this._recursiveWrapper;
      };
      CatchScheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        var self = this,
            failed = false,
            d = new SingleAssignmentDisposable();
        d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function(state1) {
          if (failed) {
            return null;
          }
          try {
            return action(state1);
          } catch (e) {
            failed = true;
            if (!self._handler(e)) {
              throw e;
            }
            d.dispose();
            return null;
          }
        }));
        return d;
      };
      return CatchScheduler;
    }(Scheduler));
    var Notification = Rx.Notification = (function() {
      function Notification(kind, value, exception, accept, acceptObservable, toString) {
        this.kind = kind;
        this.value = value;
        this.exception = exception;
        this._accept = accept;
        this._acceptObservable = acceptObservable;
        this.toString = toString;
      }
      Notification.prototype.accept = function(observerOrOnNext, onError, onCompleted) {
        return observerOrOnNext && typeof observerOrOnNext === 'object' ? this._acceptObservable(observerOrOnNext) : this._accept(observerOrOnNext, onError, onCompleted);
      };
      Notification.prototype.toObservable = function(scheduler) {
        var self = this;
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return new AnonymousObservable(function(observer) {
          return scheduler.scheduleWithState(self, function(_, notification) {
            notification._acceptObservable(observer);
            notification.kind === 'N' && observer.onCompleted();
          });
        });
      };
      return Notification;
    })();
    var notificationCreateOnNext = Notification.createOnNext = (function() {
      function _accept(onNext) {
        return onNext(this.value);
      }
      function _acceptObservable(observer) {
        return observer.onNext(this.value);
      }
      function toString() {
        return 'OnNext(' + this.value + ')';
      }
      return function(value) {
        return new Notification('N', value, null, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnError = Notification.createOnError = (function() {
      function _accept(onNext, onError) {
        return onError(this.exception);
      }
      function _acceptObservable(observer) {
        return observer.onError(this.exception);
      }
      function toString() {
        return 'OnError(' + this.exception + ')';
      }
      return function(e) {
        return new Notification('E', null, e, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnCompleted = Notification.createOnCompleted = (function() {
      function _accept(onNext, onError, onCompleted) {
        return onCompleted();
      }
      function _acceptObservable(observer) {
        return observer.onCompleted();
      }
      function toString() {
        return 'OnCompleted()';
      }
      return function() {
        return new Notification('C', null, null, _accept, _acceptObservable, toString);
      };
    }());
    var Observer = Rx.Observer = function() {};
    Observer.prototype.toNotifier = function() {
      var observer = this;
      return function(n) {
        return n.accept(observer);
      };
    };
    Observer.prototype.asObserver = function() {
      var self = this;
      return new AnonymousObserver(function(x) {
        self.onNext(x);
      }, function(err) {
        self.onError(err);
      }, function() {
        self.onCompleted();
      });
    };
    Observer.prototype.checked = function() {
      return new CheckedObserver(this);
    };
    var observerCreate = Observer.create = function(onNext, onError, onCompleted) {
      onNext || (onNext = noop);
      onError || (onError = defaultError);
      onCompleted || (onCompleted = noop);
      return new AnonymousObserver(onNext, onError, onCompleted);
    };
    Observer.fromNotifier = function(handler, thisArg) {
      var cb = bindCallback(handler, thisArg, 1);
      return new AnonymousObserver(function(x) {
        return cb(notificationCreateOnNext(x));
      }, function(e) {
        return cb(notificationCreateOnError(e));
      }, function() {
        return cb(notificationCreateOnCompleted());
      });
    };
    Observer.prototype.notifyOn = function(scheduler) {
      return new ObserveOnObserver(scheduler, this);
    };
    Observer.prototype.makeSafe = function(disposable) {
      return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
    };
    var AbstractObserver = Rx.internals.AbstractObserver = (function(__super__) {
      inherits(AbstractObserver, __super__);
      function AbstractObserver() {
        this.isStopped = false;
      }
      AbstractObserver.prototype.next = notImplemented;
      AbstractObserver.prototype.error = notImplemented;
      AbstractObserver.prototype.completed = notImplemented;
      AbstractObserver.prototype.onNext = function(value) {
        !this.isStopped && this.next(value);
      };
      AbstractObserver.prototype.onError = function(error) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(error);
        }
      };
      AbstractObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.completed();
        }
      };
      AbstractObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      AbstractObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(e);
          return true;
        }
        return false;
      };
      return AbstractObserver;
    }(Observer));
    var AnonymousObserver = Rx.AnonymousObserver = (function(__super__) {
      inherits(AnonymousObserver, __super__);
      function AnonymousObserver(onNext, onError, onCompleted) {
        __super__.call(this);
        this._onNext = onNext;
        this._onError = onError;
        this._onCompleted = onCompleted;
      }
      AnonymousObserver.prototype.next = function(value) {
        this._onNext(value);
      };
      AnonymousObserver.prototype.error = function(error) {
        this._onError(error);
      };
      AnonymousObserver.prototype.completed = function() {
        this._onCompleted();
      };
      return AnonymousObserver;
    }(AbstractObserver));
    var CheckedObserver = (function(__super__) {
      inherits(CheckedObserver, __super__);
      function CheckedObserver(observer) {
        __super__.call(this);
        this._observer = observer;
        this._state = 0;
      }
      var CheckedObserverPrototype = CheckedObserver.prototype;
      CheckedObserverPrototype.onNext = function(value) {
        this.checkAccess();
        var res = tryCatch(this._observer.onNext).call(this._observer, value);
        this._state = 0;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onError = function(err) {
        this.checkAccess();
        var res = tryCatch(this._observer.onError).call(this._observer, err);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onCompleted = function() {
        this.checkAccess();
        var res = tryCatch(this._observer.onCompleted).call(this._observer);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.checkAccess = function() {
        if (this._state === 1) {
          throw new Error('Re-entrancy detected');
        }
        if (this._state === 2) {
          throw new Error('Observer completed');
        }
        if (this._state === 0) {
          this._state = 1;
        }
      };
      return CheckedObserver;
    }(Observer));
    var ScheduledObserver = Rx.internals.ScheduledObserver = (function(__super__) {
      inherits(ScheduledObserver, __super__);
      function ScheduledObserver(scheduler, observer) {
        __super__.call(this);
        this.scheduler = scheduler;
        this.observer = observer;
        this.isAcquired = false;
        this.hasFaulted = false;
        this.queue = [];
        this.disposable = new SerialDisposable();
      }
      ScheduledObserver.prototype.next = function(value) {
        var self = this;
        this.queue.push(function() {
          self.observer.onNext(value);
        });
      };
      ScheduledObserver.prototype.error = function(e) {
        var self = this;
        this.queue.push(function() {
          self.observer.onError(e);
        });
      };
      ScheduledObserver.prototype.completed = function() {
        var self = this;
        this.queue.push(function() {
          self.observer.onCompleted();
        });
      };
      ScheduledObserver.prototype.ensureActive = function() {
        var isOwner = false;
        if (!this.hasFaulted && this.queue.length > 0) {
          isOwner = !this.isAcquired;
          this.isAcquired = true;
        }
        if (isOwner) {
          this.disposable.setDisposable(this.scheduler.scheduleRecursiveWithState(this, function(parent, self) {
            var work;
            if (parent.queue.length > 0) {
              work = parent.queue.shift();
            } else {
              parent.isAcquired = false;
              return;
            }
            var res = tryCatch(work)();
            if (res === errorObj) {
              parent.queue = [];
              parent.hasFaulted = true;
              return thrower(res.e);
            }
            self(parent);
          }));
        }
      };
      ScheduledObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.disposable.dispose();
      };
      return ScheduledObserver;
    }(AbstractObserver));
    var ObserveOnObserver = (function(__super__) {
      inherits(ObserveOnObserver, __super__);
      function ObserveOnObserver(scheduler, observer, cancel) {
        __super__.call(this, scheduler, observer);
        this._cancel = cancel;
      }
      ObserveOnObserver.prototype.next = function(value) {
        __super__.prototype.next.call(this, value);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.error = function(e) {
        __super__.prototype.error.call(this, e);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.completed = function() {
        __super__.prototype.completed.call(this);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this._cancel && this._cancel.dispose();
        this._cancel = null;
      };
      return ObserveOnObserver;
    })(ScheduledObserver);
    var observableProto;
    var Observable = Rx.Observable = (function() {
      function makeSubscribe(self, subscribe) {
        return function(o) {
          var oldOnError = o.onError;
          o.onError = function(e) {
            makeStackTraceLong(e, self);
            oldOnError.call(o, e);
          };
          return subscribe.call(self, o);
        };
      }
      function Observable(subscribe) {
        if (Rx.config.longStackSupport && hasStacks) {
          var e = tryCatch(thrower)(new Error()).e;
          this.stack = e.stack.substring(e.stack.indexOf('\n') + 1);
          this._subscribe = makeSubscribe(this, subscribe);
        } else {
          this._subscribe = subscribe;
        }
      }
      observableProto = Observable.prototype;
      Observable.isObservable = function(o) {
        return o && isFunction(o.subscribe);
      };
      observableProto.subscribe = observableProto.forEach = function(oOrOnNext, onError, onCompleted) {
        return this._subscribe(typeof oOrOnNext === 'object' ? oOrOnNext : observerCreate(oOrOnNext, onError, onCompleted));
      };
      observableProto.subscribeOnNext = function(onNext, thisArg) {
        return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) {
          onNext.call(thisArg, x);
        } : onNext));
      };
      observableProto.subscribeOnError = function(onError, thisArg) {
        return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) {
          onError.call(thisArg, e);
        } : onError));
      };
      observableProto.subscribeOnCompleted = function(onCompleted, thisArg) {
        return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() {
          onCompleted.call(thisArg);
        } : onCompleted));
      };
      return Observable;
    })();
    var ObservableBase = Rx.ObservableBase = (function(__super__) {
      inherits(ObservableBase, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            self = state[1];
        var sub = tryCatch(self.subscribeCore).call(self, ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function subscribe(observer) {
        var ado = new AutoDetachObserver(observer),
            state = [ado, this];
        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.scheduleWithState(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      }
      function ObservableBase() {
        __super__.call(this, subscribe);
      }
      ObservableBase.prototype.subscribeCore = notImplemented;
      return ObservableBase;
    }(Observable));
    var FlatMapObservable = (function(__super__) {
      inherits(FlatMapObservable, __super__);
      function FlatMapObservable(source, selector, resultSelector, thisArg) {
        this.resultSelector = Rx.helpers.isFunction(resultSelector) ? resultSelector : null;
        this.selector = Rx.internals.bindCallback(Rx.helpers.isFunction(selector) ? selector : function() {
          return selector;
        }, thisArg, 3);
        this.source = source;
        __super__.call(this);
      }
      FlatMapObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.selector, this.resultSelector, this));
      };
      function InnerObserver(observer, selector, resultSelector, source) {
        this.i = 0;
        this.selector = selector;
        this.resultSelector = resultSelector;
        this.source = source;
        this.isStopped = false;
        this.o = observer;
      }
      InnerObserver.prototype._wrapResult = function(result, x, i) {
        return this.resultSelector ? result.map(function(y, i2) {
          return this.resultSelector(x, y, i, i2);
        }, this) : result;
      };
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped)
          return;
        var i = this.i++;
        var result = tryCatch(this.selector)(x, i, this.source);
        if (result === errorObj) {
          return this.o.onError(result.e);
        }
        Rx.helpers.isPromise(result) && (result = Rx.Observable.fromPromise(result));
        (Rx.helpers.isArrayLike(result) || Rx.helpers.isIterable(result)) && (result = Rx.Observable.from(result));
        this.o.onNext(this._wrapResult(result, x, i));
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onCompleted();
        }
      };
      return FlatMapObservable;
    }(ObservableBase));
    var Enumerable = Rx.internals.Enumerable = function() {};
    var ConcatEnumerableObservable = (function(__super__) {
      inherits(ConcatEnumerableObservable, __super__);
      function ConcatEnumerableObservable(sources) {
        this.sources = sources;
        __super__.call(this);
      }
      ConcatEnumerableObservable.prototype.subscribeCore = function(o) {
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursiveWithState(this.sources[$iterator$](), function(e, self) {
          if (isDisposed) {
            return;
          }
          var currentItem = tryCatch(e.next).call(e);
          if (currentItem === errorObj) {
            return o.onError(currentItem.e);
          }
          if (currentItem.done) {
            return o.onCompleted();
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(new InnerObserver(o, self, e)));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      };
      function InnerObserver(o, s, e) {
        this.o = o;
        this.s = s;
        this.e = e;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(err) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(err);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.s(this.e);
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(err) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(err);
          return true;
        }
        return false;
      };
      return ConcatEnumerableObservable;
    }(ObservableBase));
    Enumerable.prototype.concat = function() {
      return new ConcatEnumerableObservable(this);
    };
    var CatchErrorObservable = (function(__super__) {
      inherits(CatchErrorObservable, __super__);
      function CatchErrorObservable(sources) {
        this.sources = sources;
        __super__.call(this);
      }
      CatchErrorObservable.prototype.subscribeCore = function(o) {
        var e = this.sources[$iterator$]();
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursiveWithState(null, function(lastException, self) {
          if (isDisposed) {
            return;
          }
          var currentItem = tryCatch(e.next).call(e);
          if (currentItem === errorObj) {
            return o.onError(currentItem.e);
          }
          if (currentItem.done) {
            return lastException !== null ? o.onError(lastException) : o.onCompleted();
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, self, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      };
      return CatchErrorObservable;
    }(ObservableBase));
    Enumerable.prototype.catchError = function() {
      return new CatchErrorObservable(this);
    };
    Enumerable.prototype.catchErrorWhen = function(notificationHandler) {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var exceptions = new Subject(),
            notifier = new Subject(),
            handled = notificationHandler(exceptions),
            notificationDisposable = handled.subscribe(notifier);
        var e = sources[$iterator$]();
        var isDisposed,
            lastException,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursive(function(self) {
          if (isDisposed) {
            return;
          }
          var currentItem = tryCatch(e.next).call(e);
          if (currentItem === errorObj) {
            return o.onError(currentItem.e);
          }
          if (currentItem.done) {
            if (lastException) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var outer = new SingleAssignmentDisposable();
          var inner = new SingleAssignmentDisposable();
          subscription.setDisposable(new CompositeDisposable(inner, outer));
          outer.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(exn) {
            inner.setDisposable(notifier.subscribe(self, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));
            exceptions.onNext(exn);
          }, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    var RepeatEnumerable = (function(__super__) {
      inherits(RepeatEnumerable, __super__);
      function RepeatEnumerable(v, c) {
        this.v = v;
        this.c = c == null ? -1 : c;
      }
      RepeatEnumerable.prototype[$iterator$] = function() {
        return new RepeatEnumerator(this);
      };
      function RepeatEnumerator(p) {
        this.v = p.v;
        this.l = p.c;
      }
      RepeatEnumerator.prototype.next = function() {
        if (this.l === 0) {
          return doneEnumerator;
        }
        if (this.l > 0) {
          this.l--;
        }
        return {
          done: false,
          value: this.v
        };
      };
      return RepeatEnumerable;
    }(Enumerable));
    var enumerableRepeat = Enumerable.repeat = function(value, repeatCount) {
      return new RepeatEnumerable(value, repeatCount);
    };
    var OfEnumerable = (function(__super__) {
      inherits(OfEnumerable, __super__);
      function OfEnumerable(s, fn, thisArg) {
        this.s = s;
        this.fn = fn ? bindCallback(fn, thisArg, 3) : null;
      }
      OfEnumerable.prototype[$iterator$] = function() {
        return new OfEnumerator(this);
      };
      function OfEnumerator(p) {
        this.i = -1;
        this.s = p.s;
        this.l = this.s.length;
        this.fn = p.fn;
      }
      OfEnumerator.prototype.next = function() {
        return ++this.i < this.l ? {
          done: false,
          value: !this.fn ? this.s[this.i] : this.fn(this.s[this.i], this.i, this.s)
        } : doneEnumerator;
      };
      return OfEnumerable;
    }(Enumerable));
    var enumerableOf = Enumerable.of = function(source, selector, thisArg) {
      return new OfEnumerable(source, selector, thisArg);
    };
    observableProto.observeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(new ObserveOnObserver(scheduler, observer));
      }, source);
    };
    observableProto.subscribeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            d = new SerialDisposable();
        d.setDisposable(m);
        m.setDisposable(scheduler.schedule(function() {
          d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));
        }));
        return d;
      }, source);
    };
    var FromPromiseObservable = (function(__super__) {
      inherits(FromPromiseObservable, __super__);
      function FromPromiseObservable(p) {
        this.p = p;
        __super__.call(this);
      }
      FromPromiseObservable.prototype.subscribeCore = function(o) {
        this.p.then(function(data) {
          o.onNext(data);
          o.onCompleted();
        }, function(err) {
          o.onError(err);
        });
        return disposableEmpty;
      };
      return FromPromiseObservable;
    }(ObservableBase));
    var observableFromPromise = Observable.fromPromise = function(promise) {
      return new FromPromiseObservable(promise);
    };
    observableProto.toPromise = function(promiseCtor) {
      promiseCtor || (promiseCtor = Rx.config.Promise);
      if (!promiseCtor) {
        throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise');
      }
      var source = this;
      return new promiseCtor(function(resolve, reject) {
        var value,
            hasValue = false;
        source.subscribe(function(v) {
          value = v;
          hasValue = true;
        }, reject, function() {
          hasValue && resolve(value);
        });
      });
    };
    var ToArrayObservable = (function(__super__) {
      inherits(ToArrayObservable, __super__);
      function ToArrayObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      ToArrayObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o));
      };
      function InnerObserver(o) {
        this.o = o;
        this.a = [];
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.a.push(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onNext(this.a);
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return ToArrayObservable;
    }(ObservableBase));
    observableProto.toArray = function() {
      return new ToArrayObservable(this);
    };
    Observable.create = function(subscribe, parent) {
      return new AnonymousObservable(subscribe, parent);
    };
    var observableDefer = Observable.defer = function(observableFactory) {
      return new AnonymousObservable(function(observer) {
        var result;
        try {
          result = observableFactory();
        } catch (e) {
          return observableThrow(e).subscribe(observer);
        }
        isPromise(result) && (result = observableFromPromise(result));
        return result.subscribe(observer);
      });
    };
    var EmptyObservable = (function(__super__) {
      inherits(EmptyObservable, __super__);
      function EmptyObservable(scheduler) {
        this.scheduler = scheduler;
        __super__.call(this);
      }
      EmptyObservable.prototype.subscribeCore = function(observer) {
        var sink = new EmptySink(observer, this.scheduler);
        return sink.run();
      };
      function EmptySink(observer, scheduler) {
        this.observer = observer;
        this.scheduler = scheduler;
      }
      function scheduleItem(s, state) {
        state.onCompleted();
        return disposableEmpty;
      }
      EmptySink.prototype.run = function() {
        return this.scheduler.scheduleWithState(this.observer, scheduleItem);
      };
      return EmptyObservable;
    }(ObservableBase));
    var EMPTY_OBSERVABLE = new EmptyObservable(immediateScheduler);
    var observableEmpty = Observable.empty = function(scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return scheduler === immediateScheduler ? EMPTY_OBSERVABLE : new EmptyObservable(scheduler);
    };
    var FromObservable = (function(__super__) {
      inherits(FromObservable, __super__);
      function FromObservable(iterable, mapper, scheduler) {
        this.iterable = iterable;
        this.mapper = mapper;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromObservable.prototype.subscribeCore = function(o) {
        var sink = new FromSink(o, this);
        return sink.run();
      };
      return FromObservable;
    }(ObservableBase));
    var FromSink = (function() {
      function FromSink(o, parent) {
        this.o = o;
        this.parent = parent;
      }
      FromSink.prototype.run = function() {
        var list = Object(this.parent.iterable),
            it = getIterable(list),
            o = this.o,
            mapper = this.parent.mapper;
        function loopRecursive(i, recurse) {
          var next = tryCatch(it.next).call(it);
          if (next === errorObj) {
            return o.onError(next.e);
          }
          if (next.done) {
            return o.onCompleted();
          }
          var result = next.value;
          if (isFunction(mapper)) {
            result = tryCatch(mapper)(result, i);
            if (result === errorObj) {
              return o.onError(result.e);
            }
          }
          o.onNext(result);
          recurse(i + 1);
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return FromSink;
    }());
    var maxSafeInteger = Math.pow(2, 53) - 1;
    function StringIterable(s) {
      this._s = s;
    }
    StringIterable.prototype[$iterator$] = function() {
      return new StringIterator(this._s);
    };
    function StringIterator(s) {
      this._s = s;
      this._l = s.length;
      this._i = 0;
    }
    StringIterator.prototype[$iterator$] = function() {
      return this;
    };
    StringIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._s.charAt(this._i++)
      } : doneEnumerator;
    };
    function ArrayIterable(a) {
      this._a = a;
    }
    ArrayIterable.prototype[$iterator$] = function() {
      return new ArrayIterator(this._a);
    };
    function ArrayIterator(a) {
      this._a = a;
      this._l = toLength(a);
      this._i = 0;
    }
    ArrayIterator.prototype[$iterator$] = function() {
      return this;
    };
    ArrayIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._a[this._i++]
      } : doneEnumerator;
    };
    function numberIsFinite(value) {
      return typeof value === 'number' && root.isFinite(value);
    }
    function isNan(n) {
      return n !== n;
    }
    function getIterable(o) {
      var i = o[$iterator$],
          it;
      if (!i && typeof o === 'string') {
        it = new StringIterable(o);
        return it[$iterator$]();
      }
      if (!i && o.length !== undefined) {
        it = new ArrayIterable(o);
        return it[$iterator$]();
      }
      if (!i) {
        throw new TypeError('Object is not iterable');
      }
      return o[$iterator$]();
    }
    function sign(value) {
      var number = +value;
      if (number === 0) {
        return number;
      }
      if (isNaN(number)) {
        return number;
      }
      return number < 0 ? -1 : 1;
    }
    function toLength(o) {
      var len = +o.length;
      if (isNaN(len)) {
        return 0;
      }
      if (len === 0 || !numberIsFinite(len)) {
        return len;
      }
      len = sign(len) * Math.floor(Math.abs(len));
      if (len <= 0) {
        return 0;
      }
      if (len > maxSafeInteger) {
        return maxSafeInteger;
      }
      return len;
    }
    var observableFrom = Observable.from = function(iterable, mapFn, thisArg, scheduler) {
      if (iterable == null) {
        throw new Error('iterable cannot be null.');
      }
      if (mapFn && !isFunction(mapFn)) {
        throw new Error('mapFn when provided must be a function');
      }
      if (mapFn) {
        var mapper = bindCallback(mapFn, thisArg, 2);
      }
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromObservable(iterable, mapper, scheduler);
    };
    var FromArrayObservable = (function(__super__) {
      inherits(FromArrayObservable, __super__);
      function FromArrayObservable(args, scheduler) {
        this.args = args;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromArrayObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromArraySink(observer, this);
        return sink.run();
      };
      return FromArrayObservable;
    }(ObservableBase));
    function FromArraySink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    FromArraySink.prototype.run = function() {
      var observer = this.observer,
          args = this.parent.args,
          len = args.length;
      function loopRecursive(i, recurse) {
        if (i < len) {
          observer.onNext(args[i]);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }
      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };
    var observableFromArray = Observable.fromArray = function(array, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    };
    Observable.generate = function(initialState, condition, iterate, resultSelector, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new AnonymousObservable(function(o) {
        var first = true;
        return scheduler.scheduleRecursiveWithState(initialState, function(state, self) {
          var hasResult,
              result;
          try {
            if (first) {
              first = false;
            } else {
              state = iterate(state);
            }
            hasResult = condition(state);
            hasResult && (result = resultSelector(state));
          } catch (e) {
            return o.onError(e);
          }
          if (hasResult) {
            o.onNext(result);
            self(state);
          } else {
            o.onCompleted();
          }
        });
      });
    };
    function observableOf(scheduler, array) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    }
    Observable.of = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return new FromArrayObservable(args, currentThreadScheduler);
    };
    Observable.ofWithScheduler = function(scheduler) {
      var len = arguments.length,
          args = new Array(len - 1);
      for (var i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }
      return new FromArrayObservable(args, scheduler);
    };
    Observable.ofArrayChanges = function(array) {
      if (!Array.isArray(array)) {
        throw new TypeError('Array.observe only accepts arrays.');
      }
      if (typeof Array.observe !== 'function' && typeof Array.unobserve !== 'function') {
        throw new TypeError('Array.observe is not supported on your platform');
      }
      return new AnonymousObservable(function(observer) {
        function observerFn(changes) {
          for (var i = 0,
              len = changes.length; i < len; i++) {
            observer.onNext(changes[i]);
          }
        }
        Array.observe(array, observerFn);
        return function() {
          Array.unobserve(array, observerFn);
        };
      });
    };
    Observable.ofObjectChanges = function(obj) {
      if (obj == null) {
        throw new TypeError('object must not be null or undefined.');
      }
      if (typeof Object.observe !== 'function' && typeof Object.unobserve !== 'function') {
        throw new TypeError('Object.observe is not supported on your platform');
      }
      return new AnonymousObservable(function(observer) {
        function observerFn(changes) {
          for (var i = 0,
              len = changes.length; i < len; i++) {
            observer.onNext(changes[i]);
          }
        }
        Object.observe(obj, observerFn);
        return function() {
          Object.unobserve(obj, observerFn);
        };
      });
    };
    var NeverObservable = (function(__super__) {
      inherits(NeverObservable, __super__);
      function NeverObservable() {
        __super__.call(this);
      }
      NeverObservable.prototype.subscribeCore = function(observer) {
        return disposableEmpty;
      };
      return NeverObservable;
    }(ObservableBase));
    var NEVER_OBSERVABLE = new NeverObservable();
    var observableNever = Observable.never = function() {
      return NEVER_OBSERVABLE;
    };
    var PairsObservable = (function(__super__) {
      inherits(PairsObservable, __super__);
      function PairsObservable(obj, scheduler) {
        this.obj = obj;
        this.keys = Object.keys(obj);
        this.scheduler = scheduler;
        __super__.call(this);
      }
      PairsObservable.prototype.subscribeCore = function(observer) {
        var sink = new PairsSink(observer, this);
        return sink.run();
      };
      return PairsObservable;
    }(ObservableBase));
    function PairsSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    PairsSink.prototype.run = function() {
      var observer = this.observer,
          obj = this.parent.obj,
          keys = this.parent.keys,
          len = keys.length;
      function loopRecursive(i, recurse) {
        if (i < len) {
          var key = keys[i];
          observer.onNext([key, obj[key]]);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }
      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };
    Observable.pairs = function(obj, scheduler) {
      scheduler || (scheduler = currentThreadScheduler);
      return new PairsObservable(obj, scheduler);
    };
    var RangeObservable = (function(__super__) {
      inherits(RangeObservable, __super__);
      function RangeObservable(start, count, scheduler) {
        this.start = start;
        this.rangeCount = count;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      RangeObservable.prototype.subscribeCore = function(observer) {
        var sink = new RangeSink(observer, this);
        return sink.run();
      };
      return RangeObservable;
    }(ObservableBase));
    var RangeSink = (function() {
      function RangeSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      RangeSink.prototype.run = function() {
        var start = this.parent.start,
            count = this.parent.rangeCount,
            observer = this.observer;
        function loopRecursive(i, recurse) {
          if (i < count) {
            observer.onNext(start + i);
            recurse(i + 1);
          } else {
            observer.onCompleted();
          }
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return RangeSink;
    }());
    Observable.range = function(start, count, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new RangeObservable(start, count, scheduler);
    };
    var RepeatObservable = (function(__super__) {
      inherits(RepeatObservable, __super__);
      function RepeatObservable(value, repeatCount, scheduler) {
        this.value = value;
        this.repeatCount = repeatCount == null ? -1 : repeatCount;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      RepeatObservable.prototype.subscribeCore = function(observer) {
        var sink = new RepeatSink(observer, this);
        return sink.run();
      };
      return RepeatObservable;
    }(ObservableBase));
    function RepeatSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    RepeatSink.prototype.run = function() {
      var observer = this.observer,
          value = this.parent.value;
      function loopRecursive(i, recurse) {
        if (i === -1 || i > 0) {
          observer.onNext(value);
          i > 0 && i--;
        }
        if (i === 0) {
          return observer.onCompleted();
        }
        recurse(i);
      }
      return this.parent.scheduler.scheduleRecursiveWithState(this.parent.repeatCount, loopRecursive);
    };
    Observable.repeat = function(value, repeatCount, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new RepeatObservable(value, repeatCount, scheduler);
    };
    var JustObservable = (function(__super__) {
      inherits(JustObservable, __super__);
      function JustObservable(value, scheduler) {
        this.value = value;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      JustObservable.prototype.subscribeCore = function(observer) {
        var sink = new JustSink(observer, this.value, this.scheduler);
        return sink.run();
      };
      function JustSink(observer, value, scheduler) {
        this.observer = observer;
        this.value = value;
        this.scheduler = scheduler;
      }
      function scheduleItem(s, state) {
        var value = state[0],
            observer = state[1];
        observer.onNext(value);
        observer.onCompleted();
        return disposableEmpty;
      }
      JustSink.prototype.run = function() {
        var state = [this.value, this.observer];
        return this.scheduler === immediateScheduler ? scheduleItem(null, state) : this.scheduler.scheduleWithState(state, scheduleItem);
      };
      return JustObservable;
    }(ObservableBase));
    var observableReturn = Observable['return'] = Observable.just = function(value, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new JustObservable(value, scheduler);
    };
    var ThrowObservable = (function(__super__) {
      inherits(ThrowObservable, __super__);
      function ThrowObservable(error, scheduler) {
        this.error = error;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      ThrowObservable.prototype.subscribeCore = function(o) {
        var sink = new ThrowSink(o, this);
        return sink.run();
      };
      function ThrowSink(o, p) {
        this.o = o;
        this.p = p;
      }
      function scheduleItem(s, state) {
        var e = state[0],
            o = state[1];
        o.onError(e);
      }
      ThrowSink.prototype.run = function() {
        return this.p.scheduler.scheduleWithState([this.p.error, this.o], scheduleItem);
      };
      return ThrowObservable;
    }(ObservableBase));
    var observableThrow = Observable['throw'] = function(error, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new ThrowObservable(error, scheduler);
    };
    Observable.using = function(resourceFactory, observableFactory) {
      return new AnonymousObservable(function(o) {
        var disposable = disposableEmpty;
        var resource = tryCatch(resourceFactory)();
        if (resource === errorObj) {
          return new CompositeDisposable(observableThrow(resource.e).subscribe(o), disposable);
        }
        resource && (disposable = resource);
        var source = tryCatch(observableFactory)(resource);
        if (source === errorObj) {
          return new CompositeDisposable(observableThrow(source.e).subscribe(o), disposable);
        }
        return new CompositeDisposable(source.subscribe(o), disposable);
      });
    };
    observableProto.amb = function(rightSource) {
      var leftSource = this;
      return new AnonymousObservable(function(observer) {
        var choice,
            leftChoice = 'L',
            rightChoice = 'R',
            leftSubscription = new SingleAssignmentDisposable(),
            rightSubscription = new SingleAssignmentDisposable();
        isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));
        function choiceL() {
          if (!choice) {
            choice = leftChoice;
            rightSubscription.dispose();
          }
        }
        function choiceR() {
          if (!choice) {
            choice = rightChoice;
            leftSubscription.dispose();
          }
        }
        var leftSubscribe = observerCreate(function(left) {
          choiceL();
          choice === leftChoice && observer.onNext(left);
        }, function(e) {
          choiceL();
          choice === leftChoice && observer.onError(e);
        }, function() {
          choiceL();
          choice === leftChoice && observer.onCompleted();
        });
        var rightSubscribe = observerCreate(function(right) {
          choiceR();
          choice === rightChoice && observer.onNext(right);
        }, function(e) {
          choiceR();
          choice === rightChoice && observer.onError(e);
        }, function() {
          choiceR();
          choice === rightChoice && observer.onCompleted();
        });
        leftSubscription.setDisposable(leftSource.subscribe(leftSubscribe));
        rightSubscription.setDisposable(rightSource.subscribe(rightSubscribe));
        return new CompositeDisposable(leftSubscription, rightSubscription);
      });
    };
    function amb(p, c) {
      return p.amb(c);
    }
    Observable.amb = function() {
      var acc = observableNever(),
          items;
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        var len = arguments.length;
        items = new Array(items);
        for (var i = 0; i < len; i++) {
          items[i] = arguments[i];
        }
      }
      for (var i = 0,
          len = items.length; i < len; i++) {
        acc = amb(acc, items[i]);
      }
      return acc;
    };
    var CatchObserver = (function(__super__) {
      inherits(CatchObserver, __super__);
      function CatchObserver(o, s, fn) {
        this._o = o;
        this._s = s;
        this._fn = fn;
        __super__.call(this);
      }
      CatchObserver.prototype.next = function(x) {
        this._o.onNext(x);
      };
      CatchObserver.prototype.completed = function() {
        return this._o.onCompleted();
      };
      CatchObserver.prototype.error = function(e) {
        var result = tryCatch(this._fn)(e);
        if (result === errorObj) {
          return this._o.onError(result.e);
        }
        isPromise(result) && (result = observableFromPromise(result));
        var d = new SingleAssignmentDisposable();
        this._s.setDisposable(d);
        d.setDisposable(result.subscribe(this._o));
      };
      return CatchObserver;
    }(AbstractObserver));
    function observableCatchHandler(source, handler) {
      return new AnonymousObservable(function(o) {
        var d1 = new SingleAssignmentDisposable(),
            subscription = new SerialDisposable();
        subscription.setDisposable(d1);
        d1.setDisposable(source.subscribe(new CatchObserver(o, subscription, handler)));
        return subscription;
      }, source);
    }
    observableProto['catch'] = function(handlerOrSecond) {
      return isFunction(handlerOrSecond) ? observableCatchHandler(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
    };
    var observableCatch = Observable['catch'] = function() {
      var items;
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        var len = arguments.length;
        items = new Array(len);
        for (var i = 0; i < len; i++) {
          items[i] = arguments[i];
        }
      }
      return enumerableOf(items).catchError();
    };
    observableProto.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      if (Array.isArray(args[0])) {
        args[0].unshift(this);
      } else {
        args.unshift(this);
      }
      return combineLatest.apply(this, args);
    };
    function falseFactory() {
      return false;
    }
    function argumentsToArray() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
    var combineLatest = Observable.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
      Array.isArray(args[0]) && (args = args[0]);
      return new AnonymousObservable(function(o) {
        var n = args.length,
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            isDone = arrayInitialize(n, falseFactory),
            values = new Array(n);
        function next(i) {
          hasValue[i] = true;
          if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
            try {
              var res = resultSelector.apply(null, values);
            } catch (e) {
              return o.onError(e);
            }
            o.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            o.onCompleted();
          }
        }
        function done(i) {
          isDone[i] = true;
          isDone.every(identity) && o.onCompleted();
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              values[i] = x;
              next(i);
            }, function(e) {
              o.onError(e);
            }, function() {
              done(i);
            }));
            subscriptions[i] = sad;
          }(idx));
        }
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    observableProto.concat = function() {
      for (var args = [],
          i = 0,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      args.unshift(this);
      return observableConcat.apply(null, args);
    };
    var ConcatObservable = (function(__super__) {
      inherits(ConcatObservable, __super__);
      function ConcatObservable(sources) {
        this.sources = sources;
        __super__.call(this);
      }
      ConcatObservable.prototype.subscribeCore = function(o) {
        var sink = new ConcatSink(this.sources, o);
        return sink.run();
      };
      function ConcatSink(sources, o) {
        this.sources = sources;
        this.o = o;
      }
      ConcatSink.prototype.run = function() {
        var isDisposed,
            subscription = new SerialDisposable(),
            sources = this.sources,
            length = sources.length,
            o = this.o;
        var cancelable = immediateScheduler.scheduleRecursiveWithState(0, function(i, self) {
          if (isDisposed) {
            return;
          }
          if (i === length) {
            return o.onCompleted();
          }
          var currentValue = sources[i];
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(e) {
            o.onError(e);
          }, function() {
            self(i + 1);
          }));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      };
      return ConcatObservable;
    }(ObservableBase));
    var observableConcat = Observable.concat = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(arguments.length);
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return new ConcatObservable(args);
    };
    observableProto.concatAll = function() {
      return this.merge(1);
    };
    var MergeObservable = (function(__super__) {
      inherits(MergeObservable, __super__);
      function MergeObservable(source, maxConcurrent) {
        this.source = source;
        this.maxConcurrent = maxConcurrent;
        __super__.call(this);
      }
      MergeObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable();
        g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
        return g;
      };
      return MergeObservable;
    }(ObservableBase));
    var MergeObserver = (function() {
      function MergeObserver(o, max, g) {
        this.o = o;
        this.max = max;
        this.g = g;
        this.done = false;
        this.q = [];
        this.activeCount = 0;
        this.isStopped = false;
      }
      MergeObserver.prototype.handleSubscribe = function(xs) {
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(xs) && (xs = observableFromPromise(xs));
        sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
      };
      MergeObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return;
        }
        if (this.activeCount < this.max) {
          this.activeCount++;
          this.handleSubscribe(innerSource);
        } else {
          this.q.push(innerSource);
        }
      };
      MergeObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.activeCount === 0 && this.o.onCompleted();
        }
      };
      MergeObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          var parent = this.parent;
          parent.g.remove(this.sad);
          if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
          } else {
            parent.activeCount--;
            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeObserver;
    }());
    observableProto.merge = function(maxConcurrentOrOther) {
      return typeof maxConcurrentOrOther !== 'number' ? observableMerge(this, maxConcurrentOrOther) : new MergeObservable(this, maxConcurrentOrOther);
    };
    var observableMerge = Observable.merge = function() {
      var scheduler,
          sources = [],
          i,
          len = arguments.length;
      if (!arguments[0]) {
        scheduler = immediateScheduler;
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else if (isScheduler(arguments[0])) {
        scheduler = arguments[0];
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else {
        scheduler = immediateScheduler;
        for (i = 0; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      if (Array.isArray(sources[0])) {
        sources = sources[0];
      }
      return observableOf(scheduler, sources).mergeAll();
    };
    var MergeAllObservable = (function(__super__) {
      inherits(MergeAllObservable, __super__);
      function MergeAllObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      MergeAllObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable(),
            m = new SingleAssignmentDisposable();
        g.add(m);
        m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
        return g;
      };
      function MergeAllObserver(o, g) {
        this.o = o;
        this.g = g;
        this.isStopped = false;
        this.done = false;
      }
      MergeAllObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return;
        }
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
        sad.setDisposable(innerSource.subscribe(new InnerObserver(this, sad)));
      };
      MergeAllObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeAllObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.g.length === 1 && this.o.onCompleted();
        }
      };
      MergeAllObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeAllObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          var parent = this.parent;
          this.isStopped = true;
          parent.g.remove(this.sad);
          parent.done && parent.g.length === 1 && parent.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeAllObservable;
    }(ObservableBase));
    observableProto.mergeAll = function() {
      return new MergeAllObservable(this);
    };
    var CompositeError = Rx.CompositeError = function(errors) {
      this.name = "NotImplementedError";
      this.innerErrors = errors;
      this.message = 'This contains multiple errors. Check the innerErrors';
      Error.call(this);
    };
    CompositeError.prototype = Error.prototype;
    Observable.mergeDelayError = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        var len = arguments.length;
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      var source = observableOf(null, args);
      return new AnonymousObservable(function(o) {
        var group = new CompositeDisposable(),
            m = new SingleAssignmentDisposable(),
            isStopped = false,
            errors = [];
        function setCompletion() {
          if (errors.length === 0) {
            o.onCompleted();
          } else if (errors.length === 1) {
            o.onError(errors[0]);
          } else {
            o.onError(new CompositeError(errors));
          }
        }
        group.add(m);
        m.setDisposable(source.subscribe(function(innerSource) {
          var innerSubscription = new SingleAssignmentDisposable();
          group.add(innerSubscription);
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
          innerSubscription.setDisposable(innerSource.subscribe(function(x) {
            o.onNext(x);
          }, function(e) {
            errors.push(e);
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }, function() {
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }));
        }, function(e) {
          errors.push(e);
          isStopped = true;
          group.length === 1 && setCompletion();
        }, function() {
          isStopped = true;
          group.length === 1 && setCompletion();
        }));
        return group;
      });
    };
    observableProto.onErrorResumeNext = function(second) {
      if (!second) {
        throw new Error('Second observable is required');
      }
      return onErrorResumeNext([this, second]);
    };
    var onErrorResumeNext = Observable.onErrorResumeNext = function() {
      var sources = [];
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      return new AnonymousObservable(function(observer) {
        var pos = 0,
            subscription = new SerialDisposable(),
            cancelable = immediateScheduler.scheduleRecursive(function(self) {
              var current,
                  d;
              if (pos < sources.length) {
                current = sources[pos++];
                isPromise(current) && (current = observableFromPromise(current));
                d = new SingleAssignmentDisposable();
                subscription.setDisposable(d);
                d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
              } else {
                observer.onCompleted();
              }
            });
        return new CompositeDisposable(subscription, cancelable);
      });
    };
    observableProto.skipUntil = function(other) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var isOpen = false;
        var disposables = new CompositeDisposable(source.subscribe(function(left) {
          isOpen && o.onNext(left);
        }, function(e) {
          o.onError(e);
        }, function() {
          isOpen && o.onCompleted();
        }));
        isPromise(other) && (other = observableFromPromise(other));
        var rightSubscription = new SingleAssignmentDisposable();
        disposables.add(rightSubscription);
        rightSubscription.setDisposable(other.subscribe(function() {
          isOpen = true;
          rightSubscription.dispose();
        }, function(e) {
          o.onError(e);
        }, function() {
          rightSubscription.dispose();
        }));
        return disposables;
      }, source);
    };
    var SwitchObservable = (function(__super__) {
      inherits(SwitchObservable, __super__);
      function SwitchObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      SwitchObservable.prototype.subscribeCore = function(o) {
        var inner = new SerialDisposable(),
            s = this.source.subscribe(new SwitchObserver(o, inner));
        return new CompositeDisposable(s, inner);
      };
      function SwitchObserver(o, inner) {
        this.o = o;
        this.inner = inner;
        this.stopped = false;
        this.latest = 0;
        this.hasLatest = false;
        this.isStopped = false;
      }
      SwitchObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return;
        }
        var d = new SingleAssignmentDisposable(),
            id = ++this.latest;
        this.hasLatest = true;
        this.inner.setDisposable(d);
        isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
        d.setDisposable(innerSource.subscribe(new InnerObserver(this, id)));
      };
      SwitchObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      SwitchObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.stopped = true;
          !this.hasLatest && this.o.onCompleted();
        }
      };
      SwitchObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      SwitchObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, id) {
        this.parent = parent;
        this.id = id;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        this.parent.latest === this.id && this.parent.o.onNext(x);
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.latest === this.id && this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          if (this.parent.latest === this.id) {
            this.parent.hasLatest = false;
            this.parent.isStopped && this.parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return SwitchObservable;
    }(ObservableBase));
    observableProto['switch'] = observableProto.switchLatest = function() {
      return new SwitchObservable(this);
    };
    var TakeUntilObservable = (function(__super__) {
      inherits(TakeUntilObservable, __super__);
      function TakeUntilObservable(source, other) {
        this.source = source;
        this.other = isPromise(other) ? observableFromPromise(other) : other;
        __super__.call(this);
      }
      TakeUntilObservable.prototype.subscribeCore = function(o) {
        return new CompositeDisposable(this.source.subscribe(o), this.other.subscribe(new InnerObserver(o)));
      };
      function InnerObserver(o) {
        this.o = o;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        this.o.onCompleted();
      };
      InnerObserver.prototype.onError = function(err) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(err);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        !this.isStopped && (this.isStopped = true);
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return TakeUntilObservable;
    }(ObservableBase));
    observableProto.takeUntil = function(other) {
      return new TakeUntilObservable(this, other);
    };
    function falseFactory() {
      return false;
    }
    observableProto.withLatestFrom = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = args.pop(),
          source = this;
      Array.isArray(args[0]) && (args = args[0]);
      return new AnonymousObservable(function(observer) {
        var n = args.length,
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            values = new Array(n);
        var subscriptions = new Array(n + 1);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var other = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(other) && (other = observableFromPromise(other));
            sad.setDisposable(other.subscribe(function(x) {
              values[i] = x;
              hasValue[i] = true;
              hasValueAll = hasValue.every(identity);
            }, function(e) {
              observer.onError(e);
            }, noop));
            subscriptions[i] = sad;
          }(idx));
        }
        var sad = new SingleAssignmentDisposable();
        sad.setDisposable(source.subscribe(function(x) {
          var allValues = [x].concat(values);
          if (!hasValueAll) {
            return;
          }
          var res = tryCatch(resultSelector).apply(null, allValues);
          if (res === errorObj) {
            return observer.onError(res.e);
          }
          observer.onNext(res);
        }, function(e) {
          observer.onError(e);
        }, function() {
          observer.onCompleted();
        }));
        subscriptions[n] = sad;
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    function falseFactory() {
      return false;
    }
    function emptyArrayFactory() {
      return [];
    }
    function argumentsToArray() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
    observableProto.zip = function() {
      if (arguments.length === 0) {
        throw new Error('invalid arguments');
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
      Array.isArray(args[0]) && (args = args[0]);
      var parent = this;
      args.unshift(parent);
      return new AnonymousObservable(function(o) {
        var n = args.length,
            queues = arrayInitialize(n, emptyArrayFactory),
            isDone = arrayInitialize(n, falseFactory);
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              queues[i].push(x);
              if (queues.every(function(x) {
                return x.length > 0;
              })) {
                var queuedValues = queues.map(function(x) {
                  return x.shift();
                }),
                    res = tryCatch(resultSelector).apply(parent, queuedValues);
                if (res === errorObj) {
                  return o.onError(res.e);
                }
                o.onNext(res);
              } else if (isDone.filter(function(x, j) {
                return j !== i;
              }).every(identity)) {
                o.onCompleted();
              }
            }, function(e) {
              o.onError(e);
            }, function() {
              isDone[i] = true;
              isDone.every(identity) && o.onCompleted();
            }));
            subscriptions[i] = sad;
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      }, parent);
    };
    Observable.zip = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      if (Array.isArray(args[0])) {
        args = isFunction(args[1]) ? args[0].concat(args[1]) : args[0];
      }
      var first = args.shift();
      return first.zip.apply(first, args);
    };
    function falseFactory() {
      return false;
    }
    function emptyArrayFactory() {
      return [];
    }
    function argumentsToArray() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
    observableProto.zipIterable = function() {
      if (arguments.length === 0) {
        throw new Error('invalid arguments');
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
      var parent = this;
      args.unshift(parent);
      return new AnonymousObservable(function(o) {
        var n = args.length,
            queues = arrayInitialize(n, emptyArrayFactory),
            isDone = arrayInitialize(n, falseFactory);
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            (isArrayLike(source) || isIterable(source)) && (source = observableFrom(source));
            sad.setDisposable(source.subscribe(function(x) {
              queues[i].push(x);
              if (queues.every(function(x) {
                return x.length > 0;
              })) {
                var queuedValues = queues.map(function(x) {
                  return x.shift();
                }),
                    res = tryCatch(resultSelector).apply(parent, queuedValues);
                if (res === errorObj) {
                  return o.onError(res.e);
                }
                o.onNext(res);
              } else if (isDone.filter(function(x, j) {
                return j !== i;
              }).every(identity)) {
                o.onCompleted();
              }
            }, function(e) {
              o.onError(e);
            }, function() {
              isDone[i] = true;
              isDone.every(identity) && o.onCompleted();
            }));
            subscriptions[i] = sad;
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      }, parent);
    };
    function asObservable(source) {
      return function subscribe(o) {
        return source.subscribe(o);
      };
    }
    observableProto.asObservable = function() {
      return new AnonymousObservable(asObservable(this), this);
    };
    function toArray(x) {
      return x.toArray();
    }
    function notEmpty(x) {
      return x.length > 0;
    }
    observableProto.bufferWithCount = function(count, skip) {
      typeof skip !== 'number' && (skip = count);
      return this.windowWithCount(count, skip).flatMap(toArray).filter(notEmpty);
    };
    observableProto.dematerialize = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(function(x) {
          return x.accept(o);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    var DistinctUntilChangedObservable = (function(__super__) {
      inherits(DistinctUntilChangedObservable, __super__);
      function DistinctUntilChangedObservable(source, keyFn, comparer) {
        this.source = source;
        this.keyFn = keyFn;
        this.comparer = comparer;
        __super__.call(this);
      }
      DistinctUntilChangedObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new DistinctUntilChangedObserver(o, this.keyFn, this.comparer));
      };
      return DistinctUntilChangedObservable;
    }(ObservableBase));
    var DistinctUntilChangedObserver = (function(__super__) {
      inherits(DistinctUntilChangedObserver, __super__);
      function DistinctUntilChangedObserver(o, keyFn, comparer) {
        this.o = o;
        this.keyFn = keyFn;
        this.comparer = comparer;
        this.hasCurrentKey = false;
        this.currentKey = null;
        __super__.call(this);
      }
      DistinctUntilChangedObserver.prototype.next = function(x) {
        var key = x,
            comparerEquals;
        if (isFunction(this.keyFn)) {
          key = tryCatch(this.keyFn)(x);
          if (key === errorObj) {
            return this.o.onError(key.e);
          }
        }
        if (this.hasCurrentKey) {
          comparerEquals = tryCatch(this.comparer)(this.currentKey, key);
          if (comparerEquals === errorObj) {
            return this.o.onError(comparerEquals.e);
          }
        }
        if (!this.hasCurrentKey || !comparerEquals) {
          this.hasCurrentKey = true;
          this.currentKey = key;
          this.o.onNext(x);
        }
      };
      DistinctUntilChangedObserver.prototype.error = function(e) {
        this.o.onError(e);
      };
      DistinctUntilChangedObserver.prototype.completed = function() {
        this.o.onCompleted();
      };
      return DistinctUntilChangedObserver;
    }(AbstractObserver));
    observableProto.distinctUntilChanged = function(keyFn, comparer) {
      comparer || (comparer = defaultComparer);
      return new DistinctUntilChangedObservable(this, keyFn, comparer);
    };
    var TapObservable = (function(__super__) {
      inherits(TapObservable, __super__);
      function TapObservable(source, observerOrOnNext, onError, onCompleted) {
        this.source = source;
        this._oN = observerOrOnNext;
        this._oE = onError;
        this._oC = onCompleted;
        __super__.call(this);
      }
      TapObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this));
      };
      function InnerObserver(o, p) {
        this.o = o;
        this.t = !p._oN || isFunction(p._oN) ? observerCreate(p._oN || noop, p._oE || noop, p._oC || noop) : p._oN;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        var res = tryCatch(this.t.onNext).call(this.t, x);
        if (res === errorObj) {
          this.o.onError(res.e);
        }
        this.o.onNext(x);
      };
      InnerObserver.prototype.onError = function(err) {
        if (!this.isStopped) {
          this.isStopped = true;
          var res = tryCatch(this.t.onError).call(this.t, err);
          if (res === errorObj) {
            return this.o.onError(res.e);
          }
          this.o.onError(err);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          var res = tryCatch(this.t.onCompleted).call(this.t);
          if (res === errorObj) {
            return this.o.onError(res.e);
          }
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return TapObservable;
    }(ObservableBase));
    observableProto['do'] = observableProto.tap = observableProto.doAction = function(observerOrOnNext, onError, onCompleted) {
      return new TapObservable(this, observerOrOnNext, onError, onCompleted);
    };
    observableProto.doOnNext = observableProto.tapOnNext = function(onNext, thisArg) {
      return this.tap(typeof thisArg !== 'undefined' ? function(x) {
        onNext.call(thisArg, x);
      } : onNext);
    };
    observableProto.doOnError = observableProto.tapOnError = function(onError, thisArg) {
      return this.tap(noop, typeof thisArg !== 'undefined' ? function(e) {
        onError.call(thisArg, e);
      } : onError);
    };
    observableProto.doOnCompleted = observableProto.tapOnCompleted = function(onCompleted, thisArg) {
      return this.tap(noop, null, typeof thisArg !== 'undefined' ? function() {
        onCompleted.call(thisArg);
      } : onCompleted);
    };
    observableProto['finally'] = function(action) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var subscription = tryCatch(source.subscribe).call(source, observer);
        if (subscription === errorObj) {
          action();
          return thrower(subscription.e);
        }
        return disposableCreate(function() {
          var r = tryCatch(subscription.dispose).call(subscription);
          action();
          r === errorObj && thrower(r.e);
        });
      }, this);
    };
    var IgnoreElementsObservable = (function(__super__) {
      inherits(IgnoreElementsObservable, __super__);
      function IgnoreElementsObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      IgnoreElementsObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o));
      };
      function InnerObserver(o) {
        this.o = o;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = noop;
      InnerObserver.prototype.onError = function(err) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(err);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.observer.onError(e);
          return true;
        }
        return false;
      };
      return IgnoreElementsObservable;
    }(ObservableBase));
    observableProto.ignoreElements = function() {
      return new IgnoreElementsObservable(this);
    };
    observableProto.materialize = function() {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(function(value) {
          observer.onNext(notificationCreateOnNext(value));
        }, function(e) {
          observer.onNext(notificationCreateOnError(e));
          observer.onCompleted();
        }, function() {
          observer.onNext(notificationCreateOnCompleted());
          observer.onCompleted();
        });
      }, source);
    };
    observableProto.repeat = function(repeatCount) {
      return enumerableRepeat(this, repeatCount).concat();
    };
    observableProto.retry = function(retryCount) {
      return enumerableRepeat(this, retryCount).catchError();
    };
    observableProto.retryWhen = function(notifier) {
      return enumerableRepeat(this).catchErrorWhen(notifier);
    };
    var ScanObservable = (function(__super__) {
      inherits(ScanObservable, __super__);
      function ScanObservable(source, accumulator, hasSeed, seed) {
        this.source = source;
        this.accumulator = accumulator;
        this.hasSeed = hasSeed;
        this.seed = seed;
        __super__.call(this);
      }
      ScanObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this));
      };
      return ScanObservable;
    }(ObservableBase));
    function InnerObserver(o, parent) {
      this.o = o;
      this.accumulator = parent.accumulator;
      this.hasSeed = parent.hasSeed;
      this.seed = parent.seed;
      this.hasAccumulation = false;
      this.accumulation = null;
      this.hasValue = false;
      this.isStopped = false;
    }
    InnerObserver.prototype = {
      onNext: function(x) {
        if (this.isStopped) {
          return;
        }
        !this.hasValue && (this.hasValue = true);
        if (this.hasAccumulation) {
          this.accumulation = tryCatch(this.accumulator)(this.accumulation, x);
        } else {
          this.accumulation = this.hasSeed ? tryCatch(this.accumulator)(this.seed, x) : x;
          this.hasAccumulation = true;
        }
        if (this.accumulation === errorObj) {
          return this.o.onError(this.accumulation.e);
        }
        this.o.onNext(this.accumulation);
      },
      onError: function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      },
      onCompleted: function() {
        if (!this.isStopped) {
          this.isStopped = true;
          !this.hasValue && this.hasSeed && this.o.onNext(this.seed);
          this.o.onCompleted();
        }
      },
      dispose: function() {
        this.isStopped = true;
      },
      fail: function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      }
    };
    observableProto.scan = function() {
      var hasSeed = false,
          seed,
          accumulator = arguments[0];
      if (arguments.length === 2) {
        hasSeed = true;
        seed = arguments[1];
      }
      return new ScanObservable(this, accumulator, hasSeed, seed);
    };
    observableProto.skipLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && o.onNext(q.shift());
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.startWith = function() {
      var values,
          scheduler,
          start = 0;
      if (!!arguments.length && isScheduler(arguments[0])) {
        scheduler = arguments[0];
        start = 1;
      } else {
        scheduler = immediateScheduler;
      }
      for (var args = [],
          i = start,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      return enumerableOf([observableFromArray(args, scheduler), this]).concat();
    };
    observableProto.takeLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          while (q.length > 0) {
            o.onNext(q.shift());
          }
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeLastBuffer = function(count) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(q);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.windowWithCount = function(count, skip) {
      var source = this;
      +count || (count = 0);
      Math.abs(count) === Infinity && (count = 0);
      if (count <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      skip == null && (skip = count);
      +skip || (skip = 0);
      Math.abs(skip) === Infinity && (skip = 0);
      if (skip <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            refCountDisposable = new RefCountDisposable(m),
            n = 0,
            q = [];
        function createWindow() {
          var s = new Subject();
          q.push(s);
          observer.onNext(addRef(s, refCountDisposable));
        }
        createWindow();
        m.setDisposable(source.subscribe(function(x) {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onNext(x);
          }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        }, function(e) {
          while (q.length > 0) {
            q.shift().onError(e);
          }
          observer.onError(e);
        }, function() {
          while (q.length > 0) {
            q.shift().onCompleted();
          }
          observer.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    function concatMap(source, selector, thisArg) {
      var selectorFunc = bindCallback(selector, thisArg, 3);
      return source.map(function(x, i) {
        var result = selectorFunc(x, i, source);
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
        return result;
      }).concatAll();
    }
    observableProto.selectConcat = observableProto.concatMap = function(selector, resultSelector, thisArg) {
      if (isFunction(selector) && isFunction(resultSelector)) {
        return this.concatMap(function(x, i) {
          var selectorResult = selector(x, i);
          isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
          (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
          return selectorResult.map(function(y, i2) {
            return resultSelector(x, y, i, i2);
          });
        });
      }
      return isFunction(selector) ? concatMap(this, selector, thisArg) : concatMap(this, function() {
        return selector;
      });
    };
    observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this,
          onNextFunc = bindCallback(onNext, thisArg, 2),
          onErrorFunc = bindCallback(onError, thisArg, 1),
          onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, this).concatAll();
    };
    observableProto.defaultIfEmpty = function(defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function(observer) {
        var found = false;
        return source.subscribe(function(x) {
          found = true;
          observer.onNext(x);
        }, function(e) {
          observer.onError(e);
        }, function() {
          !found && observer.onNext(defaultValue);
          observer.onCompleted();
        });
      }, source);
    };
    function arrayIndexOfComparer(array, item, comparer) {
      for (var i = 0,
          len = array.length; i < len; i++) {
        if (comparer(array[i], item)) {
          return i;
        }
      }
      return -1;
    }
    function HashSet(comparer) {
      this.comparer = comparer;
      this.set = [];
    }
    HashSet.prototype.push = function(value) {
      var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
      retValue && this.set.push(value);
      return retValue;
    };
    observableProto.distinct = function(keySelector, comparer) {
      var source = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var hashSet = new HashSet(comparer);
        return source.subscribe(function(x) {
          var key = x;
          if (keySelector) {
            try {
              key = keySelector(x);
            } catch (e) {
              o.onError(e);
              return;
            }
          }
          hashSet.push(key) && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    observableProto.groupBy = function(keySelector, elementSelector) {
      return this.groupByUntil(keySelector, elementSelector, observableNever);
    };
    observableProto.groupByUntil = function(keySelector, elementSelector, durationSelector) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var map = new Map(),
            groupDisposable = new CompositeDisposable(),
            refCountDisposable = new RefCountDisposable(groupDisposable),
            handleError = function(e) {
              return function(item) {
                item.onError(e);
              };
            };
        groupDisposable.add(source.subscribe(function(x) {
          var key = tryCatch(keySelector)(x);
          if (key === errorObj) {
            map.forEach(handleError(key.e));
            return o.onError(key.e);
          }
          var fireNewMapEntry = false,
              writer = map.get(key);
          if (writer === undefined) {
            writer = new Subject();
            map.set(key, writer);
            fireNewMapEntry = true;
          }
          if (fireNewMapEntry) {
            var group = new GroupedObservable(key, writer, refCountDisposable),
                durationGroup = new GroupedObservable(key, writer);
            var duration = tryCatch(durationSelector)(durationGroup);
            if (duration === errorObj) {
              map.forEach(handleError(duration.e));
              return o.onError(duration.e);
            }
            o.onNext(group);
            var md = new SingleAssignmentDisposable();
            groupDisposable.add(md);
            md.setDisposable(duration.take(1).subscribe(noop, function(e) {
              map.forEach(handleError(e));
              o.onError(e);
            }, function() {
              if (map['delete'](key)) {
                writer.onCompleted();
              }
              groupDisposable.remove(md);
            }));
          }
          var element = x;
          if (isFunction(elementSelector)) {
            element = tryCatch(elementSelector)(x);
            if (element === errorObj) {
              map.forEach(handleError(element.e));
              return o.onError(element.e);
            }
          }
          writer.onNext(element);
        }, function(e) {
          map.forEach(handleError(e));
          o.onError(e);
        }, function() {
          map.forEach(function(item) {
            item.onCompleted();
          });
          o.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    var MapObservable = (function(__super__) {
      inherits(MapObservable, __super__);
      function MapObservable(source, selector, thisArg) {
        this.source = source;
        this.selector = bindCallback(selector, thisArg, 3);
        __super__.call(this);
      }
      function innerMap(selector, self) {
        return function(x, i, o) {
          return selector.call(this, self.selector(x, i, o), i, o);
        };
      }
      MapObservable.prototype.internalMap = function(selector, thisArg) {
        return new MapObservable(this.source, innerMap(selector, this), thisArg);
      };
      MapObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.selector, this));
      };
      function InnerObserver(o, selector, source) {
        this.o = o;
        this.selector = selector;
        this.source = source;
        this.i = 0;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        var result = tryCatch(this.selector)(x, this.i++, this.source);
        if (result === errorObj) {
          return this.o.onError(result.e);
        }
        this.o.onNext(result);
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return MapObservable;
    }(ObservableBase));
    observableProto.map = observableProto.select = function(selector, thisArg) {
      var selectorFn = typeof selector === 'function' ? selector : function() {
        return selector;
      };
      return this instanceof MapObservable ? this.internalMap(selectorFn, thisArg) : new MapObservable(this, selectorFn, thisArg);
    };
    function plucker(args, len) {
      return function mapper(x) {
        var currentProp = x;
        for (var i = 0; i < len; i++) {
          var p = currentProp[args[i]];
          if (typeof p !== 'undefined') {
            currentProp = p;
          } else {
            return undefined;
          }
        }
        return currentProp;
      };
    }
    observableProto.pluck = function() {
      var len = arguments.length,
          args = new Array(len);
      if (len === 0) {
        throw new Error('List of properties cannot be empty.');
      }
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return this.map(plucker(args, len));
    };
    observableProto.flatMap = observableProto.selectMany = function(selector, resultSelector, thisArg) {
      return new FlatMapObservable(this, selector, resultSelector, thisArg).mergeAll();
    };
    observableProto.flatMapObserver = observableProto.selectManyObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, source).mergeAll();
    };
    Rx.Observable.prototype.flatMapLatest = function(selector, resultSelector, thisArg) {
      return new FlatMapObservable(this, selector, resultSelector, thisArg).switchLatest();
    };
    var SkipObservable = (function(__super__) {
      inherits(SkipObservable, __super__);
      function SkipObservable(source, count) {
        this.source = source;
        this.skipCount = count;
        __super__.call(this);
      }
      SkipObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.skipCount));
      };
      function InnerObserver(o, c) {
        this.c = c;
        this.r = c;
        this.o = o;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        if (this.r <= 0) {
          this.o.onNext(x);
        } else {
          this.r--;
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return SkipObservable;
    }(ObservableBase));
    observableProto.skip = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new SkipObservable(this, count);
    };
    observableProto.skipWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = false;
        return source.subscribe(function(x) {
          if (!running) {
            try {
              running = !callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return;
            }
          }
          running && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.take = function(count, scheduler) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (count === 0) {
        return observableEmpty(scheduler);
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var remaining = count;
        return source.subscribe(function(x) {
          if (remaining-- > 0) {
            o.onNext(x);
            remaining <= 0 && o.onCompleted();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = true;
        return source.subscribe(function(x) {
          if (running) {
            try {
              running = callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return;
            }
            if (running) {
              o.onNext(x);
            } else {
              o.onCompleted();
            }
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    var FilterObservable = (function(__super__) {
      inherits(FilterObservable, __super__);
      function FilterObservable(source, predicate, thisArg) {
        this.source = source;
        this.predicate = bindCallback(predicate, thisArg, 3);
        __super__.call(this);
      }
      FilterObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.predicate, this));
      };
      function innerPredicate(predicate, self) {
        return function(x, i, o) {
          return self.predicate(x, i, o) && predicate.call(this, x, i, o);
        };
      }
      FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
        return new FilterObservable(this.source, innerPredicate(predicate, this), thisArg);
      };
      function InnerObserver(o, predicate, source) {
        this.o = o;
        this.predicate = predicate;
        this.source = source;
        this.i = 0;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        var shouldYield = tryCatch(this.predicate)(x, this.i++, this.source);
        if (shouldYield === errorObj) {
          return this.o.onError(shouldYield.e);
        }
        shouldYield && this.o.onNext(x);
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return FilterObservable;
    }(ObservableBase));
    observableProto.filter = observableProto.where = function(predicate, thisArg) {
      return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) : new FilterObservable(this, predicate, thisArg);
    };
    function extremaBy(source, keySelector, comparer) {
      return new AnonymousObservable(function(o) {
        var hasValue = false,
            lastKey = null,
            list = [];
        return source.subscribe(function(x) {
          var comparison,
              key;
          try {
            key = keySelector(x);
          } catch (ex) {
            o.onError(ex);
            return;
          }
          comparison = 0;
          if (!hasValue) {
            hasValue = true;
            lastKey = key;
          } else {
            try {
              comparison = comparer(key, lastKey);
            } catch (ex1) {
              o.onError(ex1);
              return;
            }
          }
          if (comparison > 0) {
            lastKey = key;
            list = [];
          }
          if (comparison >= 0) {
            list.push(x);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(list);
          o.onCompleted();
        });
      }, source);
    }
    function firstOnly(x) {
      if (x.length === 0) {
        throw new EmptyError();
      }
      return x[0];
    }
    var ReduceObservable = (function(__super__) {
      inherits(ReduceObservable, __super__);
      function ReduceObservable(source, acc, hasSeed, seed) {
        this.source = source;
        this.acc = acc;
        this.hasSeed = hasSeed;
        this.seed = seed;
        __super__.call(this);
      }
      ReduceObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new InnerObserver(observer, this));
      };
      function InnerObserver(o, parent) {
        this.o = o;
        this.acc = parent.acc;
        this.hasSeed = parent.hasSeed;
        this.seed = parent.seed;
        this.hasAccumulation = false;
        this.result = null;
        this.hasValue = false;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (this.isStopped) {
          return;
        }
        !this.hasValue && (this.hasValue = true);
        if (this.hasAccumulation) {
          this.result = tryCatch(this.acc)(this.result, x);
        } else {
          this.result = this.hasSeed ? tryCatch(this.acc)(this.seed, x) : x;
          this.hasAccumulation = true;
        }
        if (this.result === errorObj) {
          this.o.onError(this.result.e);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.hasValue && this.o.onNext(this.result);
          !this.hasValue && this.hasSeed && this.o.onNext(this.seed);
          !this.hasValue && !this.hasSeed && this.o.onError(new EmptyError());
          this.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      return ReduceObservable;
    }(ObservableBase));
    observableProto.reduce = function(accumulator) {
      var hasSeed = false;
      if (arguments.length === 2) {
        hasSeed = true;
        var seed = arguments[1];
      }
      return new ReduceObservable(this, accumulator, hasSeed, seed);
    };
    var SomeObserver = (function(__super__) {
      inherits(SomeObserver, __super__);
      function SomeObserver(o, fn, s) {
        this._o = o;
        this._fn = fn;
        this._s = s;
        this._i = 0;
        __super__.call(this);
      }
      SomeObserver.prototype.next = function(x) {
        var result = tryCatch(this._fn)(x, this._i++, this._s);
        if (result === errorObj) {
          return this._o.onError(result.e);
        }
        if (Boolean(result)) {
          this._o.onNext(true);
          this._o.onCompleted();
        }
      };
      SomeObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      SomeObserver.prototype.completed = function() {
        this._o.onNext(false);
        this._o.onCompleted();
      };
      return SomeObserver;
    }(AbstractObserver));
    observableProto.some = function(predicate, thisArg) {
      var source = this,
          fn = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        return source.subscribe(new SomeObserver(o, fn, source));
      });
    };
    var IsEmptyObserver = (function(__super__) {
      inherits(IsEmptyObserver, __super__);
      function IsEmptyObserver(o) {
        this._o = o;
        __super__.call(this);
      }
      IsEmptyObserver.prototype.next = function() {
        this._o.onNext(false);
        this._o.onCompleted();
      };
      IsEmptyObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      IsEmptyObserver.prototype.completed = function() {
        this._o.onNext(true);
        this._o.onCompleted();
      };
      return IsEmptyObserver;
    }(AbstractObserver));
    observableProto.isEmpty = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(new IsEmptyObserver(o));
      }, source);
    };
    var EveryObserver = (function(__super__) {
      inherits(EveryObserver, __super__);
      function EveryObserver(o, fn, s) {
        this._o = o;
        this._fn = fn;
        this._s = s;
        this._i = 0;
        __super__.call(this);
      }
      EveryObserver.prototype.next = function(x) {
        var result = tryCatch(this._fn)(x, this._i++, this._s);
        if (result === errorObj) {
          return this._o.onError(result.e);
        }
        if (!Boolean(result)) {
          this._o.onNext(false);
          this._o.onCompleted();
        }
      };
      EveryObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      EveryObserver.prototype.completed = function() {
        this._o.onNext(true);
        this._o.onCompleted();
      };
      return EveryObserver;
    }(AbstractObserver));
    observableProto.every = function(predicate, thisArg) {
      var source = this,
          fn = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        return source.subscribe(new EveryObserver(o, fn, source));
      }, this);
    };
    observableProto.includes = function(searchElement, fromIndex) {
      var source = this;
      function comparer(a, b) {
        return (a === 0 && b === 0) || (a === b || (isNaN(a) && isNaN(b)));
      }
      return new AnonymousObservable(function(o) {
        var i = 0,
            n = +fromIndex || 0;
        Math.abs(n) === Infinity && (n = 0);
        if (n < 0) {
          o.onNext(false);
          o.onCompleted();
          return disposableEmpty;
        }
        return source.subscribe(function(x) {
          if (i++ >= n && comparer(x, searchElement)) {
            o.onNext(true);
            o.onCompleted();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(false);
          o.onCompleted();
        });
      }, this);
    };
    observableProto.contains = function(searchElement, fromIndex) {
      observableProto.includes(searchElement, fromIndex);
    };
    observableProto.count = function(predicate, thisArg) {
      return predicate ? this.filter(predicate, thisArg).count() : this.reduce(function(count) {
        return count + 1;
      }, 0);
    };
    observableProto.indexOf = function(searchElement, fromIndex) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var i = 0,
            n = +fromIndex || 0;
        Math.abs(n) === Infinity && (n = 0);
        if (n < 0) {
          o.onNext(-1);
          o.onCompleted();
          return disposableEmpty;
        }
        return source.subscribe(function(x) {
          if (i >= n && x === searchElement) {
            o.onNext(i);
            o.onCompleted();
          }
          i++;
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(-1);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.sum = function(keySelector, thisArg) {
      return keySelector && isFunction(keySelector) ? this.map(keySelector, thisArg).sum() : this.reduce(function(prev, curr) {
        return prev + curr;
      }, 0);
    };
    observableProto.minBy = function(keySelector, comparer) {
      comparer || (comparer = defaultSubComparer);
      return extremaBy(this, keySelector, function(x, y) {
        return comparer(x, y) * -1;
      });
    };
    observableProto.min = function(comparer) {
      return this.minBy(identity, comparer).map(function(x) {
        return firstOnly(x);
      });
    };
    observableProto.maxBy = function(keySelector, comparer) {
      comparer || (comparer = defaultSubComparer);
      return extremaBy(this, keySelector, comparer);
    };
    observableProto.max = function(comparer) {
      return this.maxBy(identity, comparer).map(function(x) {
        return firstOnly(x);
      });
    };
    var AverageObserver = (function(__super__) {
      inherits(AverageObserver, __super__);
      function AverageObserver(o, fn, s) {
        this._o = o;
        this._fn = fn;
        this._s = s;
        this._c = 0;
        this._t = 0;
        __super__.call(this);
      }
      AverageObserver.prototype.next = function(x) {
        if (this._fn) {
          var r = tryCatch(this._fn)(x, this._c++, this._s);
          if (r === errorObj) {
            return this._o.onError(r.e);
          }
          this._t += r;
        } else {
          this._c++;
          this._t += x;
        }
      };
      AverageObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      AverageObserver.prototype.completed = function() {
        if (this._c === 0) {
          return this._o.onError(new EmptyError());
        }
        this._o.onNext(this._t / this._c);
        this._o.onCompleted();
      };
      return AverageObserver;
    }(AbstractObserver));
    observableProto.average = function(keySelector, thisArg) {
      var source = this,
          fn;
      if (isFunction(keySelector)) {
        fn = bindCallback(keySelector, thisArg, 3);
      }
      return new AnonymousObservable(function(o) {
        return source.subscribe(new AverageObserver(o, fn, source));
      }, source);
    };
    observableProto.sequenceEqual = function(second, comparer) {
      var first = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var donel = false,
            doner = false,
            ql = [],
            qr = [];
        var subscription1 = first.subscribe(function(x) {
          var equal,
              v;
          if (qr.length > 0) {
            v = qr.shift();
            try {
              equal = comparer(v, x);
            } catch (e) {
              o.onError(e);
              return;
            }
            if (!equal) {
              o.onNext(false);
              o.onCompleted();
            }
          } else if (doner) {
            o.onNext(false);
            o.onCompleted();
          } else {
            ql.push(x);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          donel = true;
          if (ql.length === 0) {
            if (qr.length > 0) {
              o.onNext(false);
              o.onCompleted();
            } else if (doner) {
              o.onNext(true);
              o.onCompleted();
            }
          }
        });
        (isArrayLike(second) || isIterable(second)) && (second = observableFrom(second));
        isPromise(second) && (second = observableFromPromise(second));
        var subscription2 = second.subscribe(function(x) {
          var equal;
          if (ql.length > 0) {
            var v = ql.shift();
            try {
              equal = comparer(v, x);
            } catch (exception) {
              o.onError(exception);
              return;
            }
            if (!equal) {
              o.onNext(false);
              o.onCompleted();
            }
          } else if (donel) {
            o.onNext(false);
            o.onCompleted();
          } else {
            qr.push(x);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          doner = true;
          if (qr.length === 0) {
            if (ql.length > 0) {
              o.onNext(false);
              o.onCompleted();
            } else if (donel) {
              o.onNext(true);
              o.onCompleted();
            }
          }
        });
        return new CompositeDisposable(subscription1, subscription2);
      }, first);
    };
    observableProto.elementAt = function(index, defaultValue) {
      if (index < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var i = index;
        return source.subscribe(function(x) {
          if (i-- === 0) {
            o.onNext(x);
            o.onCompleted();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          if (defaultValue === undefined) {
            o.onError(new ArgumentOutOfRangeError());
          } else {
            o.onNext(defaultValue);
            o.onCompleted();
          }
        });
      }, source);
    };
    observableProto.single = function(predicate, thisArg) {
      if (isFunction(predicate)) {
        return this.filter(predicate, thisArg).single();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var value,
            seenValue = false;
        return source.subscribe(function(x) {
          if (seenValue) {
            o.onError(new Error('Sequence contains more than one element'));
          } else {
            value = x;
            seenValue = true;
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(value);
          o.onCompleted();
        });
      }, source);
    };
    var FirstObserver = (function(__super__) {
      inherits(FirstObserver, __super__);
      function FirstObserver(o, obj, s) {
        this._o = o;
        this._obj = obj;
        this._s = s;
        this._i = 0;
        __super__.call(this);
      }
      FirstObserver.prototype.next = function(x) {
        if (this._obj.predicate) {
          var res = tryCatch(this._obj.predicate)(x, this._i++, this._s);
          if (res === errorObj) {
            return this._o.onError(res.e);
          }
          if (Boolean(res)) {
            this._o.onNext(x);
            this._o.onCompleted();
          }
        } else if (!this._obj.predicate) {
          this._o.onNext(x);
          this._o.onCompleted();
        }
      };
      FirstObserver.prototype.error = function(e) {
        this._o.onError(e);
      };
      FirstObserver.prototype.completed = function() {
        if (this._obj.defaultValue === undefined) {
          this._o.onError(new EmptyError());
        } else {
          this._o.onNext(this._obj.defaultValue);
          this._o.onCompleted();
        }
      };
      return FirstObserver;
    }(AbstractObserver));
    observableProto.first = function() {
      var obj = {},
          source = this;
      if (typeof arguments[0] === 'object') {
        obj = arguments[0];
      } else {
        obj = {
          predicate: arguments[0],
          thisArg: arguments[1],
          defaultValue: arguments[2]
        };
      }
      if (isFunction(obj.predicate)) {
        var fn = obj.predicate;
        obj.predicate = bindCallback(fn, obj.thisArg, 3);
      }
      return new AnonymousObservable(function(o) {
        return source.subscribe(new FirstObserver(o, obj, source));
      }, source);
    };
    observableProto.last = function() {
      var obj = {},
          source = this;
      if (typeof arguments[0] === 'object') {
        obj = arguments[0];
      } else {
        obj = {
          predicate: arguments[0],
          thisArg: arguments[1],
          defaultValue: arguments[2]
        };
      }
      if (isFunction(obj.predicate)) {
        var fn = obj.predicate;
        obj.predicate = bindCallback(fn, obj.thisArg, 3);
      }
      return new AnonymousObservable(function(o) {
        var value,
            seenValue = false,
            i = 0;
        return source.subscribe(function(x) {
          if (obj.predicate) {
            var res = tryCatch(obj.predicate)(x, i++, source);
            if (res === errorObj) {
              return o.onError(res.e);
            }
            if (res) {
              seenValue = true;
              value = x;
            }
          } else if (!obj.predicate) {
            seenValue = true;
            value = x;
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          if (seenValue) {
            o.onNext(value);
            o.onCompleted();
          } else if (obj.defaultValue === undefined) {
            o.onError(new EmptyError());
          } else {
            o.onNext(obj.defaultValue);
            o.onCompleted();
          }
        });
      }, source);
    };
    function findValue(source, predicate, thisArg, yieldIndex) {
      var callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0;
        return source.subscribe(function(x) {
          var shouldRun;
          try {
            shouldRun = callback(x, i, source);
          } catch (e) {
            o.onError(e);
            return;
          }
          if (shouldRun) {
            o.onNext(yieldIndex ? i : x);
            o.onCompleted();
          } else {
            i++;
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(yieldIndex ? -1 : undefined);
          o.onCompleted();
        });
      }, source);
    }
    observableProto.find = function(predicate, thisArg) {
      return findValue(this, predicate, thisArg, false);
    };
    observableProto.findIndex = function(predicate, thisArg) {
      return findValue(this, predicate, thisArg, true);
    };
    observableProto.toSet = function() {
      if (typeof root.Set === 'undefined') {
        throw new TypeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var s = new root.Set();
        return source.subscribe(function(x) {
          s.add(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(s);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.toMap = function(keySelector, elementSelector) {
      if (typeof root.Map === 'undefined') {
        throw new TypeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var m = new root.Map();
        return source.subscribe(function(x) {
          var key;
          try {
            key = keySelector(x);
          } catch (e) {
            o.onError(e);
            return;
          }
          var element = x;
          if (elementSelector) {
            try {
              element = elementSelector(x);
            } catch (e) {
              o.onError(e);
              return;
            }
          }
          m.set(key, element);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(m);
          o.onCompleted();
        });
      }, source);
    };
    Observable.wrap = function(fn) {
      createObservable.__generatorFunction__ = fn;
      return createObservable;
      function createObservable() {
        return Observable.spawn.call(this, fn.apply(this, arguments));
      }
    };
    var spawn = Observable.spawn = function() {
      var gen = arguments[0],
          self = this,
          args = [];
      for (var i = 1,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      return new AnonymousObservable(function(o) {
        var g = new CompositeDisposable();
        if (isFunction(gen)) {
          gen = gen.apply(self, args);
        }
        if (!gen || !isFunction(gen.next)) {
          o.onNext(gen);
          return o.onCompleted();
        }
        processGenerator();
        function processGenerator(res) {
          var ret = tryCatch(gen.next).call(gen, res);
          if (ret === errorObj) {
            return o.onError(ret.e);
          }
          next(ret);
        }
        function onError(err) {
          var ret = tryCatch(gen.next).call(gen, err);
          if (ret === errorObj) {
            return o.onError(ret.e);
          }
          next(ret);
        }
        function next(ret) {
          if (ret.done) {
            o.onNext(ret.value);
            o.onCompleted();
            return;
          }
          var value = toObservable.call(self, ret.value);
          if (Observable.isObservable(value)) {
            g.add(value.subscribe(processGenerator, onError));
          } else {
            onError(new TypeError('type not supported'));
          }
        }
        return g;
      });
    };
    function toObservable(obj) {
      if (!obj) {
        return obj;
      }
      if (Observable.isObservable(obj)) {
        return obj;
      }
      if (isPromise(obj)) {
        return Observable.fromPromise(obj);
      }
      if (isGeneratorFunction(obj) || isGenerator(obj)) {
        return spawn.call(this, obj);
      }
      if (isFunction(obj)) {
        return thunkToObservable.call(this, obj);
      }
      if (isArrayLike(obj) || isIterable(obj)) {
        return arrayToObservable.call(this, obj);
      }
      if (isObject(obj)) {
        return objectToObservable.call(this, obj);
      }
      return obj;
    }
    function arrayToObservable(obj) {
      return Observable.from(obj).flatMap(toObservable).toArray();
    }
    function objectToObservable(obj) {
      var results = new obj.constructor(),
          keys = Object.keys(obj),
          observables = [];
      for (var i = 0,
          len = keys.length; i < len; i++) {
        var key = keys[i];
        var observable = toObservable.call(this, obj[key]);
        if (observable && Observable.isObservable(observable)) {
          defer(observable, key);
        } else {
          results[key] = obj[key];
        }
      }
      return Observable.forkJoin.apply(Observable, observables).map(function() {
        return results;
      });
      function defer(observable, key) {
        results[key] = undefined;
        observables.push(observable.map(function(next) {
          results[key] = next;
        }));
      }
    }
    function thunkToObservable(fn) {
      var self = this;
      return new AnonymousObservable(function(o) {
        fn.call(self, function() {
          var err = arguments[0],
              res = arguments[1];
          if (err) {
            return o.onError(err);
          }
          if (arguments.length > 2) {
            var args = [];
            for (var i = 1,
                len = arguments.length; i < len; i++) {
              args.push(arguments[i]);
            }
            res = args;
          }
          o.onNext(res);
          o.onCompleted();
        });
      });
    }
    function isGenerator(obj) {
      return isFunction(obj.next) && isFunction(obj.throw);
    }
    function isGeneratorFunction(obj) {
      var ctor = obj.constructor;
      if (!ctor) {
        return false;
      }
      if (ctor.name === 'GeneratorFunction' || ctor.displayName === 'GeneratorFunction') {
        return true;
      }
      return isGenerator(ctor.prototype);
    }
    Observable.start = function(func, context, scheduler) {
      return observableToAsync(func, context, scheduler)();
    };
    var observableToAsync = Observable.toAsync = function(func, context, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return function() {
        var args = arguments,
            subject = new AsyncSubject();
        scheduler.schedule(function() {
          var result;
          try {
            result = func.apply(context, args);
          } catch (e) {
            subject.onError(e);
            return;
          }
          subject.onNext(result);
          subject.onCompleted();
        });
        return subject.asObservable();
      };
    };
    function createCbObservable(fn, ctx, selector, args) {
      var o = new AsyncSubject();
      args.push(createCbHandler(o, ctx, selector));
      fn.apply(ctx, args);
      return o.asObservable();
    }
    function createCbHandler(o, ctx, selector) {
      return function handler() {
        var len = arguments.length,
            results = new Array(len);
        for (var i = 0; i < len; i++) {
          results[i] = arguments[i];
        }
        if (isFunction(selector)) {
          results = tryCatch(selector).apply(ctx, results);
          if (results === errorObj) {
            return o.onError(results.e);
          }
          o.onNext(results);
        } else {
          if (results.length <= 1) {
            o.onNext(results[0]);
          } else {
            o.onNext(results);
          }
        }
        o.onCompleted();
      };
    }
    Observable.fromCallback = function(fn, ctx, selector) {
      return function() {
        typeof ctx === 'undefined' && (ctx = this);
        var len = arguments.length,
            args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
        return createCbObservable(fn, ctx, selector, args);
      };
    };
    function createNodeObservable(fn, ctx, selector, args) {
      var o = new AsyncSubject();
      args.push(createNodeHandler(o, ctx, selector));
      fn.apply(ctx, args);
      return o.asObservable();
    }
    function createNodeHandler(o, ctx, selector) {
      return function handler() {
        var err = arguments[0];
        if (err) {
          return o.onError(err);
        }
        var len = arguments.length,
            results = [];
        for (var i = 1; i < len; i++) {
          results[i - 1] = arguments[i];
        }
        if (isFunction(selector)) {
          var results = tryCatch(selector).apply(ctx, results);
          if (results === errorObj) {
            return o.onError(results.e);
          }
          o.onNext(results);
        } else {
          if (results.length <= 1) {
            o.onNext(results[0]);
          } else {
            o.onNext(results);
          }
        }
        o.onCompleted();
      };
    }
    Observable.fromNodeCallback = function(fn, ctx, selector) {
      return function() {
        typeof ctx === 'undefined' && (ctx = this);
        var len = arguments.length,
            args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
        return createNodeObservable(fn, ctx, selector, args);
      };
    };
    function ListenDisposable(e, n, fn) {
      this._e = e;
      this._n = n;
      this._fn = fn;
      this._e.addEventListener(this._n, this._fn, false);
      this.isDisposed = false;
    }
    ListenDisposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this._e.removeEventListener(this._n, this._fn, false);
        this.isDisposed = true;
      }
    };
    function createEventListener(el, eventName, handler) {
      var disposables = new CompositeDisposable();
      var elemToString = Object.prototype.toString.call(el);
      if (elemToString === '[object NodeList]' || elemToString === '[object HTMLCollection]') {
        for (var i = 0,
            len = el.length; i < len; i++) {
          disposables.add(createEventListener(el.item(i), eventName, handler));
        }
      } else if (el) {
        disposables.add(new ListenDisposable(el, eventName, handler));
      }
      return disposables;
    }
    Rx.config.useNativeEvents = false;
    function eventHandler(o, selector) {
      return function handler() {
        var results = arguments[0];
        if (isFunction(selector)) {
          results = tryCatch(selector).apply(null, arguments);
          if (results === errorObj) {
            return o.onError(results.e);
          }
        }
        o.onNext(results);
      };
    }
    Observable.fromEvent = function(element, eventName, selector) {
      if (element.addListener) {
        return fromEventPattern(function(h) {
          element.addListener(eventName, h);
        }, function(h) {
          element.removeListener(eventName, h);
        }, selector);
      }
      if (!Rx.config.useNativeEvents) {
        if (typeof element.on === 'function' && typeof element.off === 'function') {
          return fromEventPattern(function(h) {
            element.on(eventName, h);
          }, function(h) {
            element.off(eventName, h);
          }, selector);
        }
      }
      return new AnonymousObservable(function(o) {
        return createEventListener(element, eventName, eventHandler(o, selector));
      }).publish().refCount();
    };
    var fromEventPattern = Observable.fromEventPattern = function(addHandler, removeHandler, selector, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(o) {
        function innerHandler() {
          var result = arguments[0];
          if (isFunction(selector)) {
            result = tryCatch(selector).apply(null, arguments);
            if (result === errorObj) {
              return o.onError(result.e);
            }
          }
          o.onNext(result);
        }
        var returnValue = addHandler(innerHandler);
        return disposableCreate(function() {
          isFunction(removeHandler) && removeHandler(innerHandler, returnValue);
        });
      }).publish().refCount();
    };
    Observable.startAsync = function(functionAsync) {
      var promise;
      try {
        promise = functionAsync();
      } catch (e) {
        return observableThrow(e);
      }
      return observableFromPromise(promise);
    };
    var PausableObservable = (function(__super__) {
      inherits(PausableObservable, __super__);
      function subscribe(observer) {
        var conn = this.source.publish(),
            subscription = conn.subscribe(observer),
            connection = disposableEmpty;
        var pausable = this.pauser.distinctUntilChanged().subscribe(function(b) {
          if (b) {
            connection = conn.connect();
          } else {
            connection.dispose();
            connection = disposableEmpty;
          }
        });
        return new CompositeDisposable(subscription, connection, pausable);
      }
      function PausableObservable(source, pauser) {
        this.source = source;
        this.controller = new Subject();
        if (pauser && pauser.subscribe) {
          this.pauser = this.controller.merge(pauser);
        } else {
          this.pauser = this.controller;
        }
        __super__.call(this, subscribe, source);
      }
      PausableObservable.prototype.pause = function() {
        this.controller.onNext(false);
      };
      PausableObservable.prototype.resume = function() {
        this.controller.onNext(true);
      };
      return PausableObservable;
    }(Observable));
    observableProto.pausable = function(pauser) {
      return new PausableObservable(this, pauser);
    };
    function combineLatestSource(source, subject, resultSelector) {
      return new AnonymousObservable(function(o) {
        var hasValue = [false, false],
            hasValueAll = false,
            isDone = false,
            values = new Array(2),
            err;
        function next(x, i) {
          values[i] = x;
          hasValue[i] = true;
          if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
            if (err) {
              return o.onError(err);
            }
            var res = tryCatch(resultSelector).apply(null, values);
            if (res === errorObj) {
              return o.onError(res.e);
            }
            o.onNext(res);
          }
          isDone && values[1] && o.onCompleted();
        }
        return new CompositeDisposable(source.subscribe(function(x) {
          next(x, 0);
        }, function(e) {
          if (values[1]) {
            o.onError(e);
          } else {
            err = e;
          }
        }, function() {
          isDone = true;
          values[1] && o.onCompleted();
        }), subject.subscribe(function(x) {
          next(x, 1);
        }, function(e) {
          o.onError(e);
        }, function() {
          isDone = true;
          next(true, 1);
        }));
      }, source);
    }
    var PausableBufferedObservable = (function(__super__) {
      inherits(PausableBufferedObservable, __super__);
      function subscribe(o) {
        var q = [],
            previousShouldFire;
        function drainQueue() {
          while (q.length > 0) {
            o.onNext(q.shift());
          }
        }
        var subscription = combineLatestSource(this.source, this.pauser.startWith(false).distinctUntilChanged(), function(data, shouldFire) {
          return {
            data: data,
            shouldFire: shouldFire
          };
        }).subscribe(function(results) {
          if (previousShouldFire !== undefined && results.shouldFire != previousShouldFire) {
            previousShouldFire = results.shouldFire;
            if (results.shouldFire) {
              drainQueue();
            }
          } else {
            previousShouldFire = results.shouldFire;
            if (results.shouldFire) {
              o.onNext(results.data);
            } else {
              q.push(results.data);
            }
          }
        }, function(err) {
          drainQueue();
          o.onError(err);
        }, function() {
          drainQueue();
          o.onCompleted();
        });
        return subscription;
      }
      function PausableBufferedObservable(source, pauser) {
        this.source = source;
        this.controller = new Subject();
        if (pauser && pauser.subscribe) {
          this.pauser = this.controller.merge(pauser);
        } else {
          this.pauser = this.controller;
        }
        __super__.call(this, subscribe, source);
      }
      PausableBufferedObservable.prototype.pause = function() {
        this.controller.onNext(false);
      };
      PausableBufferedObservable.prototype.resume = function() {
        this.controller.onNext(true);
      };
      return PausableBufferedObservable;
    }(Observable));
    observableProto.pausableBuffered = function(subject) {
      return new PausableBufferedObservable(this, subject);
    };
    var ControlledObservable = (function(__super__) {
      inherits(ControlledObservable, __super__);
      function subscribe(observer) {
        return this.source.subscribe(observer);
      }
      function ControlledObservable(source, enableQueue, scheduler) {
        __super__.call(this, subscribe, source);
        this.subject = new ControlledSubject(enableQueue, scheduler);
        this.source = source.multicast(this.subject).refCount();
      }
      ControlledObservable.prototype.request = function(numberOfItems) {
        return this.subject.request(numberOfItems == null ? -1 : numberOfItems);
      };
      return ControlledObservable;
    }(Observable));
    var ControlledSubject = (function(__super__) {
      function subscribe(observer) {
        return this.subject.subscribe(observer);
      }
      inherits(ControlledSubject, __super__);
      function ControlledSubject(enableQueue, scheduler) {
        enableQueue == null && (enableQueue = true);
        __super__.call(this, subscribe);
        this.subject = new Subject();
        this.enableQueue = enableQueue;
        this.queue = enableQueue ? [] : null;
        this.requestedCount = 0;
        this.requestedDisposable = null;
        this.error = null;
        this.hasFailed = false;
        this.hasCompleted = false;
        this.scheduler = scheduler || currentThreadScheduler;
      }
      addProperties(ControlledSubject.prototype, Observer, {
        onCompleted: function() {
          this.hasCompleted = true;
          if (!this.enableQueue || this.queue.length === 0) {
            this.subject.onCompleted();
            this.disposeCurrentRequest();
          } else {
            this.queue.push(Notification.createOnCompleted());
          }
        },
        onError: function(error) {
          this.hasFailed = true;
          this.error = error;
          if (!this.enableQueue || this.queue.length === 0) {
            this.subject.onError(error);
            this.disposeCurrentRequest();
          } else {
            this.queue.push(Notification.createOnError(error));
          }
        },
        onNext: function(value) {
          if (this.requestedCount <= 0) {
            this.enableQueue && this.queue.push(Notification.createOnNext(value));
          } else {
            (this.requestedCount-- === 0) && this.disposeCurrentRequest();
            this.subject.onNext(value);
          }
        },
        _processRequest: function(numberOfItems) {
          if (this.enableQueue) {
            while (this.queue.length > 0 && (numberOfItems > 0 || this.queue[0].kind !== 'N')) {
              var first = this.queue.shift();
              first.accept(this.subject);
              if (first.kind === 'N') {
                numberOfItems--;
              } else {
                this.disposeCurrentRequest();
                this.queue = [];
              }
            }
          }
          return numberOfItems;
        },
        request: function(number) {
          this.disposeCurrentRequest();
          var self = this;
          this.requestedDisposable = this.scheduler.scheduleWithState(number, function(s, i) {
            var remaining = self._processRequest(i);
            var stopped = self.hasCompleted || self.hasFailed;
            if (!stopped && remaining > 0) {
              self.requestedCount = remaining;
              return disposableCreate(function() {
                self.requestedCount = 0;
              });
            }
          });
          return this.requestedDisposable;
        },
        disposeCurrentRequest: function() {
          if (this.requestedDisposable) {
            this.requestedDisposable.dispose();
            this.requestedDisposable = null;
          }
        }
      });
      return ControlledSubject;
    }(Observable));
    observableProto.controlled = function(enableQueue, scheduler) {
      if (enableQueue && isScheduler(enableQueue)) {
        scheduler = enableQueue;
        enableQueue = true;
      }
      if (enableQueue == null) {
        enableQueue = true;
      }
      return new ControlledObservable(this, enableQueue, scheduler);
    };
    var StopAndWaitObservable = (function(__super__) {
      function subscribe(observer) {
        this.subscription = this.source.subscribe(new StopAndWaitObserver(observer, this, this.subscription));
        var self = this;
        timeoutScheduler.schedule(function() {
          self.source.request(1);
        });
        return this.subscription;
      }
      inherits(StopAndWaitObservable, __super__);
      function StopAndWaitObservable(source) {
        __super__.call(this, subscribe, source);
        this.source = source;
      }
      var StopAndWaitObserver = (function(__sub__) {
        inherits(StopAndWaitObserver, __sub__);
        function StopAndWaitObserver(observer, observable, cancel) {
          __sub__.call(this);
          this.observer = observer;
          this.observable = observable;
          this.cancel = cancel;
        }
        var stopAndWaitObserverProto = StopAndWaitObserver.prototype;
        stopAndWaitObserverProto.completed = function() {
          this.observer.onCompleted();
          this.dispose();
        };
        stopAndWaitObserverProto.error = function(error) {
          this.observer.onError(error);
          this.dispose();
        };
        stopAndWaitObserverProto.next = function(value) {
          this.observer.onNext(value);
          var self = this;
          timeoutScheduler.schedule(function() {
            self.observable.source.request(1);
          });
        };
        stopAndWaitObserverProto.dispose = function() {
          this.observer = null;
          if (this.cancel) {
            this.cancel.dispose();
            this.cancel = null;
          }
          __sub__.prototype.dispose.call(this);
        };
        return StopAndWaitObserver;
      }(AbstractObserver));
      return StopAndWaitObservable;
    }(Observable));
    ControlledObservable.prototype.stopAndWait = function() {
      return new StopAndWaitObservable(this);
    };
    var WindowedObservable = (function(__super__) {
      function subscribe(observer) {
        this.subscription = this.source.subscribe(new WindowedObserver(observer, this, this.subscription));
        var self = this;
        timeoutScheduler.schedule(function() {
          self.source.request(self.windowSize);
        });
        return this.subscription;
      }
      inherits(WindowedObservable, __super__);
      function WindowedObservable(source, windowSize) {
        __super__.call(this, subscribe, source);
        this.source = source;
        this.windowSize = windowSize;
      }
      var WindowedObserver = (function(__sub__) {
        inherits(WindowedObserver, __sub__);
        function WindowedObserver(observer, observable, cancel) {
          this.observer = observer;
          this.observable = observable;
          this.cancel = cancel;
          this.received = 0;
        }
        var windowedObserverPrototype = WindowedObserver.prototype;
        windowedObserverPrototype.completed = function() {
          this.observer.onCompleted();
          this.dispose();
        };
        windowedObserverPrototype.error = function(error) {
          this.observer.onError(error);
          this.dispose();
        };
        windowedObserverPrototype.next = function(value) {
          this.observer.onNext(value);
          this.received = ++this.received % this.observable.windowSize;
          if (this.received === 0) {
            var self = this;
            timeoutScheduler.schedule(function() {
              self.observable.source.request(self.observable.windowSize);
            });
          }
        };
        windowedObserverPrototype.dispose = function() {
          this.observer = null;
          if (this.cancel) {
            this.cancel.dispose();
            this.cancel = null;
          }
          __sub__.prototype.dispose.call(this);
        };
        return WindowedObserver;
      }(AbstractObserver));
      return WindowedObservable;
    }(Observable));
    ControlledObservable.prototype.windowed = function(windowSize) {
      return new WindowedObservable(this, windowSize);
    };
    observableProto.pipe = function(dest) {
      var source = this.pausableBuffered();
      function onDrain() {
        source.resume();
      }
      dest.addListener('drain', onDrain);
      source.subscribe(function(x) {
        !dest.write(String(x)) && source.pause();
      }, function(err) {
        dest.emit('error', err);
      }, function() {
        !dest._isStdio && dest.end();
        dest.removeListener('drain', onDrain);
      });
      source.resume();
      return dest;
    };
    observableProto.multicast = function(subjectOrSubjectSelector, selector) {
      var source = this;
      return typeof subjectOrSubjectSelector === 'function' ? new AnonymousObservable(function(observer) {
        var connectable = source.multicast(subjectOrSubjectSelector());
        return new CompositeDisposable(selector(connectable).subscribe(observer), connectable.connect());
      }, source) : new ConnectableObservable(source, subjectOrSubjectSelector);
    };
    observableProto.publish = function(selector) {
      return selector && isFunction(selector) ? this.multicast(function() {
        return new Subject();
      }, selector) : this.multicast(new Subject());
    };
    observableProto.share = function() {
      return this.publish().refCount();
    };
    observableProto.publishLast = function(selector) {
      return selector && isFunction(selector) ? this.multicast(function() {
        return new AsyncSubject();
      }, selector) : this.multicast(new AsyncSubject());
    };
    observableProto.publishValue = function(initialValueOrSelector, initialValue) {
      return arguments.length === 2 ? this.multicast(function() {
        return new BehaviorSubject(initialValue);
      }, initialValueOrSelector) : this.multicast(new BehaviorSubject(initialValueOrSelector));
    };
    observableProto.shareValue = function(initialValue) {
      return this.publishValue(initialValue).refCount();
    };
    observableProto.replay = function(selector, bufferSize, windowSize, scheduler) {
      return selector && isFunction(selector) ? this.multicast(function() {
        return new ReplaySubject(bufferSize, windowSize, scheduler);
      }, selector) : this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler));
    };
    observableProto.shareReplay = function(bufferSize, windowSize, scheduler) {
      return this.replay(null, bufferSize, windowSize, scheduler).refCount();
    };
    var InnerSubscription = function(subject, observer) {
      this.subject = subject;
      this.observer = observer;
    };
    InnerSubscription.prototype.dispose = function() {
      if (!this.subject.isDisposed && this.observer !== null) {
        var idx = this.subject.observers.indexOf(this.observer);
        this.subject.observers.splice(idx, 1);
        this.observer = null;
      }
    };
    var BehaviorSubject = Rx.BehaviorSubject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          observer.onNext(this.value);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
        } else {
          observer.onCompleted();
        }
        return disposableEmpty;
      }
      inherits(BehaviorSubject, __super__);
      function BehaviorSubject(value) {
        __super__.call(this, subscribe);
        this.value = value, this.observers = [], this.isDisposed = false, this.isStopped = false, this.hasError = false;
      }
      addProperties(BehaviorSubject.prototype, Observer, {
        getValue: function() {
          checkDisposed(this);
          if (this.hasError) {
            throw this.error;
          }
          return this.value;
        },
        hasObservers: function() {
          return this.observers.length > 0;
        },
        onCompleted: function() {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.isStopped = true;
          for (var i = 0,
              os = cloneArray(this.observers),
              len = os.length; i < len; i++) {
            os[i].onCompleted();
          }
          this.observers.length = 0;
        },
        onError: function(error) {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.isStopped = true;
          this.hasError = true;
          this.error = error;
          for (var i = 0,
              os = cloneArray(this.observers),
              len = os.length; i < len; i++) {
            os[i].onError(error);
          }
          this.observers.length = 0;
        },
        onNext: function(value) {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.value = value;
          for (var i = 0,
              os = cloneArray(this.observers),
              len = os.length; i < len; i++) {
            os[i].onNext(value);
          }
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
          this.value = null;
          this.exception = null;
        }
      });
      return BehaviorSubject;
    }(Observable));
    var ReplaySubject = Rx.ReplaySubject = (function(__super__) {
      var maxSafeInteger = Math.pow(2, 53) - 1;
      function createRemovableDisposable(subject, observer) {
        return disposableCreate(function() {
          observer.dispose();
          !subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);
        });
      }
      function subscribe(observer) {
        var so = new ScheduledObserver(this.scheduler, observer),
            subscription = createRemovableDisposable(this, so);
        checkDisposed(this);
        this._trim(this.scheduler.now());
        this.observers.push(so);
        for (var i = 0,
            len = this.q.length; i < len; i++) {
          so.onNext(this.q[i].value);
        }
        if (this.hasError) {
          so.onError(this.error);
        } else if (this.isStopped) {
          so.onCompleted();
        }
        so.ensureActive();
        return subscription;
      }
      inherits(ReplaySubject, __super__);
      function ReplaySubject(bufferSize, windowSize, scheduler) {
        this.bufferSize = bufferSize == null ? maxSafeInteger : bufferSize;
        this.windowSize = windowSize == null ? maxSafeInteger : windowSize;
        this.scheduler = scheduler || currentThreadScheduler;
        this.q = [];
        this.observers = [];
        this.isStopped = false;
        this.isDisposed = false;
        this.hasError = false;
        this.error = null;
        __super__.call(this, subscribe);
      }
      addProperties(ReplaySubject.prototype, Observer.prototype, {
        hasObservers: function() {
          return this.observers.length > 0;
        },
        _trim: function(now) {
          while (this.q.length > this.bufferSize) {
            this.q.shift();
          }
          while (this.q.length > 0 && (now - this.q[0].interval) > this.windowSize) {
            this.q.shift();
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          var now = this.scheduler.now();
          this.q.push({
            interval: now,
            value: value
          });
          this._trim(now);
          for (var i = 0,
              os = cloneArray(this.observers),
              len = os.length; i < len; i++) {
            var observer = os[i];
            observer.onNext(value);
            observer.ensureActive();
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.isStopped = true;
          this.error = error;
          this.hasError = true;
          var now = this.scheduler.now();
          this._trim(now);
          for (var i = 0,
              os = cloneArray(this.observers),
              len = os.length; i < len; i++) {
            var observer = os[i];
            observer.onError(error);
            observer.ensureActive();
          }
          this.observers.length = 0;
        },
        onCompleted: function() {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.isStopped = true;
          var now = this.scheduler.now();
          this._trim(now);
          for (var i = 0,
              os = cloneArray(this.observers),
              len = os.length; i < len; i++) {
            var observer = os[i];
            observer.onCompleted();
            observer.ensureActive();
          }
          this.observers.length = 0;
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
        }
      });
      return ReplaySubject;
    }(Observable));
    var ConnectableObservable = Rx.ConnectableObservable = (function(__super__) {
      inherits(ConnectableObservable, __super__);
      function ConnectableObservable(source, subject) {
        var hasSubscription = false,
            subscription,
            sourceObservable = source.asObservable();
        this.connect = function() {
          if (!hasSubscription) {
            hasSubscription = true;
            subscription = new CompositeDisposable(sourceObservable.subscribe(subject), disposableCreate(function() {
              hasSubscription = false;
            }));
          }
          return subscription;
        };
        __super__.call(this, function(o) {
          return subject.subscribe(o);
        });
      }
      ConnectableObservable.prototype.refCount = function() {
        var connectableSubscription,
            count = 0,
            source = this;
        return new AnonymousObservable(function(observer) {
          var shouldConnect = ++count === 1,
              subscription = source.subscribe(observer);
          shouldConnect && (connectableSubscription = source.connect());
          return function() {
            subscription.dispose();
            --count === 0 && connectableSubscription.dispose();
          };
        });
      };
      return ConnectableObservable;
    }(Observable));
    observableProto.singleInstance = function() {
      var source = this,
          hasObservable = false,
          observable;
      function getObservable() {
        if (!hasObservable) {
          hasObservable = true;
          observable = source.finally(function() {
            hasObservable = false;
          }).publish().refCount();
        }
        return observable;
      }
      ;
      return new AnonymousObservable(function(o) {
        return getObservable().subscribe(o);
      });
    };
    observableProto.join = function(right, leftDurationSelector, rightDurationSelector, resultSelector) {
      var left = this;
      return new AnonymousObservable(function(o) {
        var group = new CompositeDisposable();
        var leftDone = false,
            rightDone = false;
        var leftId = 0,
            rightId = 0;
        var leftMap = new Map(),
            rightMap = new Map();
        var handleError = function(e) {
          o.onError(e);
        };
        group.add(left.subscribe(function(value) {
          var id = leftId++,
              md = new SingleAssignmentDisposable();
          leftMap.set(id, value);
          group.add(md);
          var duration = tryCatch(leftDurationSelector)(value);
          if (duration === errorObj) {
            return o.onError(duration.e);
          }
          md.setDisposable(duration.take(1).subscribe(noop, handleError, function() {
            leftMap['delete'](id) && leftMap.size === 0 && leftDone && o.onCompleted();
            group.remove(md);
          }));
          rightMap.forEach(function(v) {
            var result = tryCatch(resultSelector)(value, v);
            if (result === errorObj) {
              return o.onError(result.e);
            }
            o.onNext(result);
          });
        }, handleError, function() {
          leftDone = true;
          (rightDone || leftMap.size === 0) && o.onCompleted();
        }));
        group.add(right.subscribe(function(value) {
          var id = rightId++,
              md = new SingleAssignmentDisposable();
          rightMap.set(id, value);
          group.add(md);
          var duration = tryCatch(rightDurationSelector)(value);
          if (duration === errorObj) {
            return o.onError(duration.e);
          }
          md.setDisposable(duration.take(1).subscribe(noop, handleError, function() {
            rightMap['delete'](id) && rightMap.size === 0 && rightDone && o.onCompleted();
            group.remove(md);
          }));
          leftMap.forEach(function(v) {
            var result = tryCatch(resultSelector)(v, value);
            if (result === errorObj) {
              return o.onError(result.e);
            }
            o.onNext(result);
          });
        }, handleError, function() {
          rightDone = true;
          (leftDone || rightMap.size === 0) && o.onCompleted();
        }));
        return group;
      }, left);
    };
    observableProto.groupJoin = function(right, leftDurationSelector, rightDurationSelector, resultSelector) {
      var left = this;
      return new AnonymousObservable(function(o) {
        var group = new CompositeDisposable();
        var r = new RefCountDisposable(group);
        var leftMap = new Map(),
            rightMap = new Map();
        var leftId = 0,
            rightId = 0;
        var handleError = function(e) {
          return function(v) {
            v.onError(e);
          };
        };
        function handleError(e) {}
        ;
        group.add(left.subscribe(function(value) {
          var s = new Subject();
          var id = leftId++;
          leftMap.set(id, s);
          var result = tryCatch(resultSelector)(value, addRef(s, r));
          if (result === errorObj) {
            leftMap.forEach(handleError(result.e));
            return o.onError(result.e);
          }
          o.onNext(result);
          rightMap.forEach(function(v) {
            s.onNext(v);
          });
          var md = new SingleAssignmentDisposable();
          group.add(md);
          var duration = tryCatch(leftDurationSelector)(value);
          if (duration === errorObj) {
            leftMap.forEach(handleError(duration.e));
            return o.onError(duration.e);
          }
          md.setDisposable(duration.take(1).subscribe(noop, function(e) {
            leftMap.forEach(handleError(e));
            o.onError(e);
          }, function() {
            leftMap['delete'](id) && s.onCompleted();
            group.remove(md);
          }));
        }, function(e) {
          leftMap.forEach(handleError(e));
          o.onError(e);
        }, function() {
          o.onCompleted();
        }));
        group.add(right.subscribe(function(value) {
          var id = rightId++;
          rightMap.set(id, value);
          var md = new SingleAssignmentDisposable();
          group.add(md);
          var duration = tryCatch(rightDurationSelector)(value);
          if (duration === errorObj) {
            leftMap.forEach(handleError(duration.e));
            return o.onError(duration.e);
          }
          md.setDisposable(duration.take(1).subscribe(noop, function(e) {
            leftMap.forEach(handleError(e));
            o.onError(e);
          }, function() {
            rightMap['delete'](id);
            group.remove(md);
          }));
          leftMap.forEach(function(v) {
            v.onNext(value);
          });
        }, function(e) {
          leftMap.forEach(handleError(e));
          o.onError(e);
        }));
        return r;
      }, left);
    };
    function toArray(x) {
      return x.toArray();
    }
    observableProto.buffer = function() {
      return this.window.apply(this, arguments).flatMap(toArray);
    };
    observableProto.window = function(windowOpeningsOrClosingSelector, windowClosingSelector) {
      if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        return observableWindowWithBoundaries.call(this, windowOpeningsOrClosingSelector);
      }
      return typeof windowOpeningsOrClosingSelector === 'function' ? observableWindowWithClosingSelector.call(this, windowOpeningsOrClosingSelector) : observableWindowWithOpenings.call(this, windowOpeningsOrClosingSelector, windowClosingSelector);
    };
    function observableWindowWithOpenings(windowOpenings, windowClosingSelector) {
      return windowOpenings.groupJoin(this, windowClosingSelector, observableEmpty, function(_, win) {
        return win;
      });
    }
    function observableWindowWithBoundaries(windowBoundaries) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var win = new Subject(),
            d = new CompositeDisposable(),
            r = new RefCountDisposable(d);
        observer.onNext(addRef(win, r));
        d.add(source.subscribe(function(x) {
          win.onNext(x);
        }, function(err) {
          win.onError(err);
          observer.onError(err);
        }, function() {
          win.onCompleted();
          observer.onCompleted();
        }));
        isPromise(windowBoundaries) && (windowBoundaries = observableFromPromise(windowBoundaries));
        d.add(windowBoundaries.subscribe(function(w) {
          win.onCompleted();
          win = new Subject();
          observer.onNext(addRef(win, r));
        }, function(err) {
          win.onError(err);
          observer.onError(err);
        }, function() {
          win.onCompleted();
          observer.onCompleted();
        }));
        return r;
      }, source);
    }
    function observableWindowWithClosingSelector(windowClosingSelector) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var m = new SerialDisposable(),
            d = new CompositeDisposable(m),
            r = new RefCountDisposable(d),
            win = new Subject();
        observer.onNext(addRef(win, r));
        d.add(source.subscribe(function(x) {
          win.onNext(x);
        }, function(err) {
          win.onError(err);
          observer.onError(err);
        }, function() {
          win.onCompleted();
          observer.onCompleted();
        }));
        function createWindowClose() {
          var windowClose;
          try {
            windowClose = windowClosingSelector();
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(windowClose) && (windowClose = observableFromPromise(windowClose));
          var m1 = new SingleAssignmentDisposable();
          m.setDisposable(m1);
          m1.setDisposable(windowClose.take(1).subscribe(noop, function(err) {
            win.onError(err);
            observer.onError(err);
          }, function() {
            win.onCompleted();
            win = new Subject();
            observer.onNext(addRef(win, r));
            createWindowClose();
          }));
        }
        createWindowClose();
        return r;
      }, source);
    }
    observableProto.pairwise = function() {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var previous,
            hasPrevious = false;
        return source.subscribe(function(x) {
          if (hasPrevious) {
            observer.onNext([previous, x]);
          } else {
            hasPrevious = true;
          }
          previous = x;
        }, observer.onError.bind(observer), observer.onCompleted.bind(observer));
      }, source);
    };
    observableProto.partition = function(predicate, thisArg) {
      return [this.filter(predicate, thisArg), this.filter(function(x, i, o) {
        return !predicate.call(thisArg, x, i, o);
      })];
    };
    var WhileEnumerable = (function(__super__) {
      inherits(WhileEnumerable, __super__);
      function WhileEnumerable(c, s) {
        this.c = c;
        this.s = s;
      }
      WhileEnumerable.prototype[$iterator$] = function() {
        var self = this;
        return {next: function() {
            return self.c() ? {
              done: false,
              value: self.s
            } : {
              done: true,
              value: void 0
            };
          }};
      };
      return WhileEnumerable;
    }(Enumerable));
    function enumerableWhile(condition, source) {
      return new WhileEnumerable(condition, source);
    }
    observableProto.letBind = observableProto['let'] = function(func) {
      return func(this);
    };
    Observable['if'] = function(condition, thenSource, elseSourceOrScheduler) {
      return observableDefer(function() {
        elseSourceOrScheduler || (elseSourceOrScheduler = observableEmpty());
        isPromise(thenSource) && (thenSource = observableFromPromise(thenSource));
        isPromise(elseSourceOrScheduler) && (elseSourceOrScheduler = observableFromPromise(elseSourceOrScheduler));
        typeof elseSourceOrScheduler.now === 'function' && (elseSourceOrScheduler = observableEmpty(elseSourceOrScheduler));
        return condition() ? thenSource : elseSourceOrScheduler;
      });
    };
    Observable['for'] = Observable.forIn = function(sources, resultSelector, thisArg) {
      return enumerableOf(sources, resultSelector, thisArg).concat();
    };
    var observableWhileDo = Observable['while'] = Observable.whileDo = function(condition, source) {
      isPromise(source) && (source = observableFromPromise(source));
      return enumerableWhile(condition, source).concat();
    };
    observableProto.doWhile = function(condition) {
      return observableConcat([this, observableWhileDo(condition, this)]);
    };
    Observable['case'] = function(selector, sources, defaultSourceOrScheduler) {
      return observableDefer(function() {
        isPromise(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableFromPromise(defaultSourceOrScheduler));
        defaultSourceOrScheduler || (defaultSourceOrScheduler = observableEmpty());
        isScheduler(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableEmpty(defaultSourceOrScheduler));
        var result = sources[selector()];
        isPromise(result) && (result = observableFromPromise(result));
        return result || defaultSourceOrScheduler;
      });
    };
    observableProto.expand = function(selector, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      var source = this;
      return new AnonymousObservable(function(observer) {
        var q = [],
            m = new SerialDisposable(),
            d = new CompositeDisposable(m),
            activeCount = 0,
            isAcquired = false;
        var ensureActive = function() {
          var isOwner = false;
          if (q.length > 0) {
            isOwner = !isAcquired;
            isAcquired = true;
          }
          if (isOwner) {
            m.setDisposable(scheduler.scheduleRecursive(function(self) {
              var work;
              if (q.length > 0) {
                work = q.shift();
              } else {
                isAcquired = false;
                return;
              }
              var m1 = new SingleAssignmentDisposable();
              d.add(m1);
              m1.setDisposable(work.subscribe(function(x) {
                observer.onNext(x);
                var result = null;
                try {
                  result = selector(x);
                } catch (e) {
                  observer.onError(e);
                }
                q.push(result);
                activeCount++;
                ensureActive();
              }, observer.onError.bind(observer), function() {
                d.remove(m1);
                activeCount--;
                if (activeCount === 0) {
                  observer.onCompleted();
                }
              }));
              self();
            }));
          }
        };
        q.push(source);
        activeCount++;
        ensureActive();
        return d;
      }, this);
    };
    Observable.forkJoin = function() {
      var allSources = [];
      if (Array.isArray(arguments[0])) {
        allSources = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          allSources.push(arguments[i]);
        }
      }
      return new AnonymousObservable(function(subscriber) {
        var count = allSources.length;
        if (count === 0) {
          subscriber.onCompleted();
          return disposableEmpty;
        }
        var group = new CompositeDisposable(),
            finished = false,
            hasResults = new Array(count),
            hasCompleted = new Array(count),
            results = new Array(count);
        for (var idx = 0; idx < count; idx++) {
          (function(i) {
            var source = allSources[i];
            isPromise(source) && (source = observableFromPromise(source));
            group.add(source.subscribe(function(value) {
              if (!finished) {
                hasResults[i] = true;
                results[i] = value;
              }
            }, function(e) {
              finished = true;
              subscriber.onError(e);
              group.dispose();
            }, function() {
              if (!finished) {
                if (!hasResults[i]) {
                  subscriber.onCompleted();
                  return;
                }
                hasCompleted[i] = true;
                for (var ix = 0; ix < count; ix++) {
                  if (!hasCompleted[ix]) {
                    return;
                  }
                }
                finished = true;
                subscriber.onNext(results);
                subscriber.onCompleted();
              }
            }));
          })(idx);
        }
        return group;
      });
    };
    observableProto.forkJoin = function(second, resultSelector) {
      var first = this;
      return new AnonymousObservable(function(observer) {
        var leftStopped = false,
            rightStopped = false,
            hasLeft = false,
            hasRight = false,
            lastLeft,
            lastRight,
            leftSubscription = new SingleAssignmentDisposable(),
            rightSubscription = new SingleAssignmentDisposable();
        isPromise(second) && (second = observableFromPromise(second));
        leftSubscription.setDisposable(first.subscribe(function(left) {
          hasLeft = true;
          lastLeft = left;
        }, function(err) {
          rightSubscription.dispose();
          observer.onError(err);
        }, function() {
          leftStopped = true;
          if (rightStopped) {
            if (!hasLeft) {
              observer.onCompleted();
            } else if (!hasRight) {
              observer.onCompleted();
            } else {
              var result;
              try {
                result = resultSelector(lastLeft, lastRight);
              } catch (e) {
                observer.onError(e);
                return;
              }
              observer.onNext(result);
              observer.onCompleted();
            }
          }
        }));
        rightSubscription.setDisposable(second.subscribe(function(right) {
          hasRight = true;
          lastRight = right;
        }, function(err) {
          leftSubscription.dispose();
          observer.onError(err);
        }, function() {
          rightStopped = true;
          if (leftStopped) {
            if (!hasLeft) {
              observer.onCompleted();
            } else if (!hasRight) {
              observer.onCompleted();
            } else {
              var result;
              try {
                result = resultSelector(lastLeft, lastRight);
              } catch (e) {
                observer.onError(e);
                return;
              }
              observer.onNext(result);
              observer.onCompleted();
            }
          }
        }));
        return new CompositeDisposable(leftSubscription, rightSubscription);
      }, first);
    };
    observableProto.manySelect = observableProto.extend = function(selector, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      var source = this;
      return observableDefer(function() {
        var chain;
        return source.map(function(x) {
          var curr = new ChainObservable(x);
          chain && chain.onNext(x);
          chain = curr;
          return curr;
        }).tap(noop, function(e) {
          chain && chain.onError(e);
        }, function() {
          chain && chain.onCompleted();
        }).observeOn(scheduler).map(selector);
      }, source);
    };
    var ChainObservable = (function(__super__) {
      function subscribe(observer) {
        var self = this,
            g = new CompositeDisposable();
        g.add(currentThreadScheduler.schedule(function() {
          observer.onNext(self.head);
          g.add(self.tail.mergeAll().subscribe(observer));
        }));
        return g;
      }
      inherits(ChainObservable, __super__);
      function ChainObservable(head) {
        __super__.call(this, subscribe);
        this.head = head;
        this.tail = new AsyncSubject();
      }
      addProperties(ChainObservable.prototype, Observer, {
        onCompleted: function() {
          this.onNext(Observable.empty());
        },
        onError: function(e) {
          this.onNext(Observable['throw'](e));
        },
        onNext: function(v) {
          this.tail.onNext(v);
          this.tail.onCompleted();
        }
      });
      return ChainObservable;
    }(Observable));
    var Map = root.Map || (function() {
      function Map() {
        this.size = 0;
        this._values = [];
        this._keys = [];
      }
      Map.prototype['delete'] = function(key) {
        var i = this._keys.indexOf(key);
        if (i === -1) {
          return false;
        }
        this._values.splice(i, 1);
        this._keys.splice(i, 1);
        this.size--;
        return true;
      };
      Map.prototype.get = function(key) {
        var i = this._keys.indexOf(key);
        return i === -1 ? undefined : this._values[i];
      };
      Map.prototype.set = function(key, value) {
        var i = this._keys.indexOf(key);
        if (i === -1) {
          this._keys.push(key);
          this._values.push(value);
          this.size++;
        } else {
          this._values[i] = value;
        }
        return this;
      };
      Map.prototype.forEach = function(cb, thisArg) {
        for (var i = 0; i < this.size; i++) {
          cb.call(thisArg, this._values[i], this._keys[i]);
        }
      };
      return Map;
    }());
    function Pattern(patterns) {
      this.patterns = patterns;
    }
    Pattern.prototype.and = function(other) {
      return new Pattern(this.patterns.concat(other));
    };
    Pattern.prototype.thenDo = function(selector) {
      return new Plan(this, selector);
    };
    function Plan(expression, selector) {
      this.expression = expression;
      this.selector = selector;
    }
    Plan.prototype.activate = function(externalSubscriptions, observer, deactivate) {
      var self = this;
      var joinObservers = [];
      for (var i = 0,
          len = this.expression.patterns.length; i < len; i++) {
        joinObservers.push(planCreateObserver(externalSubscriptions, this.expression.patterns[i], observer.onError.bind(observer)));
      }
      var activePlan = new ActivePlan(joinObservers, function() {
        var result;
        try {
          result = self.selector.apply(self, arguments);
        } catch (e) {
          observer.onError(e);
          return;
        }
        observer.onNext(result);
      }, function() {
        for (var j = 0,
            jlen = joinObservers.length; j < jlen; j++) {
          joinObservers[j].removeActivePlan(activePlan);
        }
        deactivate(activePlan);
      });
      for (i = 0, len = joinObservers.length; i < len; i++) {
        joinObservers[i].addActivePlan(activePlan);
      }
      return activePlan;
    };
    function planCreateObserver(externalSubscriptions, observable, onError) {
      var entry = externalSubscriptions.get(observable);
      if (!entry) {
        var observer = new JoinObserver(observable, onError);
        externalSubscriptions.set(observable, observer);
        return observer;
      }
      return entry;
    }
    function ActivePlan(joinObserverArray, onNext, onCompleted) {
      this.joinObserverArray = joinObserverArray;
      this.onNext = onNext;
      this.onCompleted = onCompleted;
      this.joinObservers = new Map();
      for (var i = 0,
          len = this.joinObserverArray.length; i < len; i++) {
        var joinObserver = this.joinObserverArray[i];
        this.joinObservers.set(joinObserver, joinObserver);
      }
    }
    ActivePlan.prototype.dequeue = function() {
      this.joinObservers.forEach(function(v) {
        v.queue.shift();
      });
    };
    ActivePlan.prototype.match = function() {
      var i,
          len,
          hasValues = true;
      for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
        if (this.joinObserverArray[i].queue.length === 0) {
          hasValues = false;
          break;
        }
      }
      if (hasValues) {
        var firstValues = [],
            isCompleted = false;
        for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
          firstValues.push(this.joinObserverArray[i].queue[0]);
          this.joinObserverArray[i].queue[0].kind === 'C' && (isCompleted = true);
        }
        if (isCompleted) {
          this.onCompleted();
        } else {
          this.dequeue();
          var values = [];
          for (i = 0, len = firstValues.length; i < firstValues.length; i++) {
            values.push(firstValues[i].value);
          }
          this.onNext.apply(this, values);
        }
      }
    };
    var JoinObserver = (function(__super__) {
      inherits(JoinObserver, __super__);
      function JoinObserver(source, onError) {
        __super__.call(this);
        this.source = source;
        this.onError = onError;
        this.queue = [];
        this.activePlans = [];
        this.subscription = new SingleAssignmentDisposable();
        this.isDisposed = false;
      }
      var JoinObserverPrototype = JoinObserver.prototype;
      JoinObserverPrototype.next = function(notification) {
        if (!this.isDisposed) {
          if (notification.kind === 'E') {
            return this.onError(notification.exception);
          }
          this.queue.push(notification);
          var activePlans = this.activePlans.slice(0);
          for (var i = 0,
              len = activePlans.length; i < len; i++) {
            activePlans[i].match();
          }
        }
      };
      JoinObserverPrototype.error = noop;
      JoinObserverPrototype.completed = noop;
      JoinObserverPrototype.addActivePlan = function(activePlan) {
        this.activePlans.push(activePlan);
      };
      JoinObserverPrototype.subscribe = function() {
        this.subscription.setDisposable(this.source.materialize().subscribe(this));
      };
      JoinObserverPrototype.removeActivePlan = function(activePlan) {
        this.activePlans.splice(this.activePlans.indexOf(activePlan), 1);
        this.activePlans.length === 0 && this.dispose();
      };
      JoinObserverPrototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        if (!this.isDisposed) {
          this.isDisposed = true;
          this.subscription.dispose();
        }
      };
      return JoinObserver;
    }(AbstractObserver));
    observableProto.and = function(right) {
      return new Pattern([this, right]);
    };
    observableProto.thenDo = function(selector) {
      return new Pattern([this]).thenDo(selector);
    };
    Observable.when = function() {
      var len = arguments.length,
          plans;
      if (Array.isArray(arguments[0])) {
        plans = arguments[0];
      } else {
        plans = new Array(len);
        for (var i = 0; i < len; i++) {
          plans[i] = arguments[i];
        }
      }
      return new AnonymousObservable(function(o) {
        var activePlans = [],
            externalSubscriptions = new Map();
        var outObserver = observerCreate(function(x) {
          o.onNext(x);
        }, function(err) {
          externalSubscriptions.forEach(function(v) {
            v.onError(err);
          });
          o.onError(err);
        }, function(x) {
          o.onCompleted();
        });
        try {
          for (var i = 0,
              len = plans.length; i < len; i++) {
            activePlans.push(plans[i].activate(externalSubscriptions, outObserver, function(activePlan) {
              var idx = activePlans.indexOf(activePlan);
              activePlans.splice(idx, 1);
              activePlans.length === 0 && o.onCompleted();
            }));
          }
        } catch (e) {
          observableThrow(e).subscribe(o);
        }
        var group = new CompositeDisposable();
        externalSubscriptions.forEach(function(joinObserver) {
          joinObserver.subscribe();
          group.add(joinObserver);
        });
        return group;
      });
    };
    function observableTimerDate(dueTime, scheduler) {
      return new AnonymousObservable(function(observer) {
        return scheduler.scheduleWithAbsolute(dueTime, function() {
          observer.onNext(0);
          observer.onCompleted();
        });
      });
    }
    function observableTimerDateAndPeriod(dueTime, period, scheduler) {
      return new AnonymousObservable(function(observer) {
        var d = dueTime,
            p = normalizeTime(period);
        return scheduler.scheduleRecursiveWithAbsoluteAndState(0, d, function(count, self) {
          if (p > 0) {
            var now = scheduler.now();
            d = d + p;
            d <= now && (d = now + p);
          }
          observer.onNext(count);
          self(count + 1, d);
        });
      });
    }
    function observableTimerTimeSpan(dueTime, scheduler) {
      return new AnonymousObservable(function(observer) {
        return scheduler.scheduleWithRelative(normalizeTime(dueTime), function() {
          observer.onNext(0);
          observer.onCompleted();
        });
      });
    }
    function observableTimerTimeSpanAndPeriod(dueTime, period, scheduler) {
      return dueTime === period ? new AnonymousObservable(function(observer) {
        return scheduler.schedulePeriodicWithState(0, period, function(count) {
          observer.onNext(count);
          return count + 1;
        });
      }) : observableDefer(function() {
        return observableTimerDateAndPeriod(scheduler.now() + dueTime, period, scheduler);
      });
    }
    var observableinterval = Observable.interval = function(period, scheduler) {
      return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler) ? scheduler : timeoutScheduler);
    };
    var observableTimer = Observable.timer = function(dueTime, periodOrScheduler, scheduler) {
      var period;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      if (periodOrScheduler != null && typeof periodOrScheduler === 'number') {
        period = periodOrScheduler;
      } else if (isScheduler(periodOrScheduler)) {
        scheduler = periodOrScheduler;
      }
      if (dueTime instanceof Date && period === undefined) {
        return observableTimerDate(dueTime.getTime(), scheduler);
      }
      if (dueTime instanceof Date && period !== undefined) {
        return observableTimerDateAndPeriod(dueTime.getTime(), periodOrScheduler, scheduler);
      }
      return period === undefined ? observableTimerTimeSpan(dueTime, scheduler) : observableTimerTimeSpanAndPeriod(dueTime, period, scheduler);
    };
    function observableDelayTimeSpan(source, dueTime, scheduler) {
      return new AnonymousObservable(function(observer) {
        var active = false,
            cancelable = new SerialDisposable(),
            exception = null,
            q = [],
            running = false,
            subscription;
        subscription = source.materialize().timestamp(scheduler).subscribe(function(notification) {
          var d,
              shouldRun;
          if (notification.value.kind === 'E') {
            q = [];
            q.push(notification);
            exception = notification.value.exception;
            shouldRun = !running;
          } else {
            q.push({
              value: notification.value,
              timestamp: notification.timestamp + dueTime
            });
            shouldRun = !active;
            active = true;
          }
          if (shouldRun) {
            if (exception !== null) {
              observer.onError(exception);
            } else {
              d = new SingleAssignmentDisposable();
              cancelable.setDisposable(d);
              d.setDisposable(scheduler.scheduleRecursiveWithRelative(dueTime, function(self) {
                var e,
                    recurseDueTime,
                    result,
                    shouldRecurse;
                if (exception !== null) {
                  return;
                }
                running = true;
                do {
                  result = null;
                  if (q.length > 0 && q[0].timestamp - scheduler.now() <= 0) {
                    result = q.shift().value;
                  }
                  if (result !== null) {
                    result.accept(observer);
                  }
                } while (result !== null);
                shouldRecurse = false;
                recurseDueTime = 0;
                if (q.length > 0) {
                  shouldRecurse = true;
                  recurseDueTime = Math.max(0, q[0].timestamp - scheduler.now());
                } else {
                  active = false;
                }
                e = exception;
                running = false;
                if (e !== null) {
                  observer.onError(e);
                } else if (shouldRecurse) {
                  self(recurseDueTime);
                }
              }));
            }
          }
        });
        return new CompositeDisposable(subscription, cancelable);
      }, source);
    }
    function observableDelayDate(source, dueTime, scheduler) {
      return observableDefer(function() {
        return observableDelayTimeSpan(source, dueTime - scheduler.now(), scheduler);
      });
    }
    observableProto.delay = function(dueTime, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return dueTime instanceof Date ? observableDelayDate(this, dueTime.getTime(), scheduler) : observableDelayTimeSpan(this, dueTime, scheduler);
    };
    observableProto.debounce = function(dueTime, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      var source = this;
      return new AnonymousObservable(function(observer) {
        var cancelable = new SerialDisposable(),
            hasvalue = false,
            value,
            id = 0;
        var subscription = source.subscribe(function(x) {
          hasvalue = true;
          value = x;
          id++;
          var currentId = id,
              d = new SingleAssignmentDisposable();
          cancelable.setDisposable(d);
          d.setDisposable(scheduler.scheduleWithRelative(dueTime, function() {
            hasvalue && id === currentId && observer.onNext(value);
            hasvalue = false;
          }));
        }, function(e) {
          cancelable.dispose();
          observer.onError(e);
          hasvalue = false;
          id++;
        }, function() {
          cancelable.dispose();
          hasvalue && observer.onNext(value);
          observer.onCompleted();
          hasvalue = false;
          id++;
        });
        return new CompositeDisposable(subscription, cancelable);
      }, this);
    };
    observableProto.throttle = function(dueTime, scheduler) {
      return this.debounce(dueTime, scheduler);
    };
    observableProto.windowWithTime = function(timeSpan, timeShiftOrScheduler, scheduler) {
      var source = this,
          timeShift;
      timeShiftOrScheduler == null && (timeShift = timeSpan);
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      if (typeof timeShiftOrScheduler === 'number') {
        timeShift = timeShiftOrScheduler;
      } else if (isScheduler(timeShiftOrScheduler)) {
        timeShift = timeSpan;
        scheduler = timeShiftOrScheduler;
      }
      return new AnonymousObservable(function(observer) {
        var groupDisposable,
            nextShift = timeShift,
            nextSpan = timeSpan,
            q = [],
            refCountDisposable,
            timerD = new SerialDisposable(),
            totalTime = 0;
        groupDisposable = new CompositeDisposable(timerD), refCountDisposable = new RefCountDisposable(groupDisposable);
        function createTimer() {
          var m = new SingleAssignmentDisposable(),
              isSpan = false,
              isShift = false;
          timerD.setDisposable(m);
          if (nextSpan === nextShift) {
            isSpan = true;
            isShift = true;
          } else if (nextSpan < nextShift) {
            isSpan = true;
          } else {
            isShift = true;
          }
          var newTotalTime = isSpan ? nextSpan : nextShift,
              ts = newTotalTime - totalTime;
          totalTime = newTotalTime;
          if (isSpan) {
            nextSpan += timeShift;
          }
          if (isShift) {
            nextShift += timeShift;
          }
          m.setDisposable(scheduler.scheduleWithRelative(ts, function() {
            if (isShift) {
              var s = new Subject();
              q.push(s);
              observer.onNext(addRef(s, refCountDisposable));
            }
            isSpan && q.shift().onCompleted();
            createTimer();
          }));
        }
        ;
        q.push(new Subject());
        observer.onNext(addRef(q[0], refCountDisposable));
        createTimer();
        groupDisposable.add(source.subscribe(function(x) {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onNext(x);
          }
        }, function(e) {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onError(e);
          }
          observer.onError(e);
        }, function() {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onCompleted();
          }
          observer.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    observableProto.windowWithTimeOrCount = function(timeSpan, count, scheduler) {
      var source = this;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(observer) {
        var timerD = new SerialDisposable(),
            groupDisposable = new CompositeDisposable(timerD),
            refCountDisposable = new RefCountDisposable(groupDisposable),
            n = 0,
            windowId = 0,
            s = new Subject();
        function createTimer(id) {
          var m = new SingleAssignmentDisposable();
          timerD.setDisposable(m);
          m.setDisposable(scheduler.scheduleWithRelative(timeSpan, function() {
            if (id !== windowId) {
              return;
            }
            n = 0;
            var newId = ++windowId;
            s.onCompleted();
            s = new Subject();
            observer.onNext(addRef(s, refCountDisposable));
            createTimer(newId);
          }));
        }
        observer.onNext(addRef(s, refCountDisposable));
        createTimer(0);
        groupDisposable.add(source.subscribe(function(x) {
          var newId = 0,
              newWindow = false;
          s.onNext(x);
          if (++n === count) {
            newWindow = true;
            n = 0;
            newId = ++windowId;
            s.onCompleted();
            s = new Subject();
            observer.onNext(addRef(s, refCountDisposable));
          }
          newWindow && createTimer(newId);
        }, function(e) {
          s.onError(e);
          observer.onError(e);
        }, function() {
          s.onCompleted();
          observer.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    function toArray(x) {
      return x.toArray();
    }
    observableProto.bufferWithTime = function(timeSpan, timeShiftOrScheduler, scheduler) {
      return this.windowWithTime(timeSpan, timeShiftOrScheduler, scheduler).flatMap(toArray);
    };
    function toArray(x) {
      return x.toArray();
    }
    observableProto.bufferWithTimeOrCount = function(timeSpan, count, scheduler) {
      return this.windowWithTimeOrCount(timeSpan, count, scheduler).flatMap(toArray);
    };
    observableProto.timeInterval = function(scheduler) {
      var source = this;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return observableDefer(function() {
        var last = scheduler.now();
        return source.map(function(x) {
          var now = scheduler.now(),
              span = now - last;
          last = now;
          return {
            value: x,
            interval: span
          };
        });
      });
    };
    observableProto.timestamp = function(scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return this.map(function(x) {
        return {
          value: x,
          timestamp: scheduler.now()
        };
      });
    };
    function sampleObservable(source, sampler) {
      return new AnonymousObservable(function(o) {
        var atEnd = false,
            value,
            hasValue = false;
        function sampleSubscribe() {
          if (hasValue) {
            hasValue = false;
            o.onNext(value);
          }
          atEnd && o.onCompleted();
        }
        var sourceSubscription = new SingleAssignmentDisposable();
        sourceSubscription.setDisposable(source.subscribe(function(newValue) {
          hasValue = true;
          value = newValue;
        }, function(e) {
          o.onError(e);
        }, function() {
          atEnd = true;
          sourceSubscription.dispose();
        }));
        return new CompositeDisposable(sourceSubscription, sampler.subscribe(sampleSubscribe, function(e) {
          o.onError(e);
        }, sampleSubscribe));
      }, source);
    }
    observableProto.sample = observableProto.throttleLatest = function(intervalOrSampler, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return typeof intervalOrSampler === 'number' ? sampleObservable(this, observableinterval(intervalOrSampler, scheduler)) : sampleObservable(this, intervalOrSampler);
    };
    observableProto.timeout = function(dueTime, other, scheduler) {
      (other == null || typeof other === 'string') && (other = observableThrow(new Error(other || 'Timeout')));
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      var source = this,
          schedulerMethod = dueTime instanceof Date ? 'scheduleWithAbsolute' : 'scheduleWithRelative';
      return new AnonymousObservable(function(observer) {
        var id = 0,
            original = new SingleAssignmentDisposable(),
            subscription = new SerialDisposable(),
            switched = false,
            timer = new SerialDisposable();
        subscription.setDisposable(original);
        function createTimer() {
          var myId = id;
          timer.setDisposable(scheduler[schedulerMethod](dueTime, function() {
            if (id === myId) {
              isPromise(other) && (other = observableFromPromise(other));
              subscription.setDisposable(other.subscribe(observer));
            }
          }));
        }
        createTimer();
        original.setDisposable(source.subscribe(function(x) {
          if (!switched) {
            id++;
            observer.onNext(x);
            createTimer();
          }
        }, function(e) {
          if (!switched) {
            id++;
            observer.onError(e);
          }
        }, function() {
          if (!switched) {
            id++;
            observer.onCompleted();
          }
        }));
        return new CompositeDisposable(subscription, timer);
      }, source);
    };
    Observable.generateWithAbsoluteTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(observer) {
        var first = true,
            hasResult = false;
        return scheduler.scheduleRecursiveWithAbsoluteAndState(initialState, scheduler.now(), function(state, self) {
          hasResult && observer.onNext(state);
          try {
            if (first) {
              first = false;
            } else {
              state = iterate(state);
            }
            hasResult = condition(state);
            if (hasResult) {
              var result = resultSelector(state);
              var time = timeSelector(state);
            }
          } catch (e) {
            observer.onError(e);
            return;
          }
          if (hasResult) {
            self(result, time);
          } else {
            observer.onCompleted();
          }
        });
      });
    };
    Observable.generateWithRelativeTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(observer) {
        var first = true,
            hasResult = false;
        return scheduler.scheduleRecursiveWithRelativeAndState(initialState, 0, function(state, self) {
          hasResult && observer.onNext(state);
          try {
            if (first) {
              first = false;
            } else {
              state = iterate(state);
            }
            hasResult = condition(state);
            if (hasResult) {
              var result = resultSelector(state);
              var time = timeSelector(state);
            }
          } catch (e) {
            observer.onError(e);
            return;
          }
          if (hasResult) {
            self(result, time);
          } else {
            observer.onCompleted();
          }
        });
      });
    };
    observableProto.delaySubscription = function(dueTime, scheduler) {
      var scheduleMethod = dueTime instanceof Date ? 'scheduleWithAbsolute' : 'scheduleWithRelative';
      var source = this;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(o) {
        var d = new SerialDisposable();
        d.setDisposable(scheduler[scheduleMethod](dueTime, function() {
          d.setDisposable(source.subscribe(o));
        }));
        return d;
      }, this);
    };
    observableProto.delayWithSelector = function(subscriptionDelay, delayDurationSelector) {
      var source = this,
          subDelay,
          selector;
      if (isFunction(subscriptionDelay)) {
        selector = subscriptionDelay;
      } else {
        subDelay = subscriptionDelay;
        selector = delayDurationSelector;
      }
      return new AnonymousObservable(function(observer) {
        var delays = new CompositeDisposable(),
            atEnd = false,
            subscription = new SerialDisposable();
        function start() {
          subscription.setDisposable(source.subscribe(function(x) {
            var delay = tryCatch(selector)(x);
            if (delay === errorObj) {
              return observer.onError(delay.e);
            }
            var d = new SingleAssignmentDisposable();
            delays.add(d);
            d.setDisposable(delay.subscribe(function() {
              observer.onNext(x);
              delays.remove(d);
              done();
            }, function(e) {
              observer.onError(e);
            }, function() {
              observer.onNext(x);
              delays.remove(d);
              done();
            }));
          }, function(e) {
            observer.onError(e);
          }, function() {
            atEnd = true;
            subscription.dispose();
            done();
          }));
        }
        function done() {
          atEnd && delays.length === 0 && observer.onCompleted();
        }
        if (!subDelay) {
          start();
        } else {
          subscription.setDisposable(subDelay.subscribe(start, function(e) {
            observer.onError(e);
          }, start));
        }
        return new CompositeDisposable(subscription, delays);
      }, this);
    };
    observableProto.timeoutWithSelector = function(firstTimeout, timeoutdurationSelector, other) {
      if (arguments.length === 1) {
        timeoutdurationSelector = firstTimeout;
        firstTimeout = observableNever();
      }
      other || (other = observableThrow(new Error('Timeout')));
      var source = this;
      return new AnonymousObservable(function(observer) {
        var subscription = new SerialDisposable(),
            timer = new SerialDisposable(),
            original = new SingleAssignmentDisposable();
        subscription.setDisposable(original);
        var id = 0,
            switched = false;
        function setTimer(timeout) {
          var myId = id;
          function timerWins() {
            return id === myId;
          }
          var d = new SingleAssignmentDisposable();
          timer.setDisposable(d);
          d.setDisposable(timeout.subscribe(function() {
            timerWins() && subscription.setDisposable(other.subscribe(observer));
            d.dispose();
          }, function(e) {
            timerWins() && observer.onError(e);
          }, function() {
            timerWins() && subscription.setDisposable(other.subscribe(observer));
          }));
        }
        ;
        setTimer(firstTimeout);
        function observerWins() {
          var res = !switched;
          if (res) {
            id++;
          }
          return res;
        }
        original.setDisposable(source.subscribe(function(x) {
          if (observerWins()) {
            observer.onNext(x);
            var timeout;
            try {
              timeout = timeoutdurationSelector(x);
            } catch (e) {
              observer.onError(e);
              return;
            }
            setTimer(isPromise(timeout) ? observableFromPromise(timeout) : timeout);
          }
        }, function(e) {
          observerWins() && observer.onError(e);
        }, function() {
          observerWins() && observer.onCompleted();
        }));
        return new CompositeDisposable(subscription, timer);
      }, source);
    };
    observableProto.debounceWithSelector = function(durationSelector) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var value,
            hasValue = false,
            cancelable = new SerialDisposable(),
            id = 0;
        var subscription = source.subscribe(function(x) {
          var throttle = tryCatch(durationSelector)(x);
          if (throttle === errorObj) {
            return o.onError(throttle.e);
          }
          isPromise(throttle) && (throttle = observableFromPromise(throttle));
          hasValue = true;
          value = x;
          id++;
          var currentid = id,
              d = new SingleAssignmentDisposable();
          cancelable.setDisposable(d);
          d.setDisposable(throttle.subscribe(function() {
            hasValue && id === currentid && o.onNext(value);
            hasValue = false;
            d.dispose();
          }, function(e) {
            o.onError(e);
          }, function() {
            hasValue && id === currentid && o.onNext(value);
            hasValue = false;
            d.dispose();
          }));
        }, function(e) {
          cancelable.dispose();
          o.onError(e);
          hasValue = false;
          id++;
        }, function() {
          cancelable.dispose();
          hasValue && o.onNext(value);
          o.onCompleted();
          hasValue = false;
          id++;
        });
        return new CompositeDisposable(subscription, cancelable);
      }, source);
    };
    observableProto.skipLastWithTime = function(duration, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          var now = scheduler.now();
          q.push({
            interval: now,
            value: x
          });
          while (q.length > 0 && now - q[0].interval >= duration) {
            o.onNext(q.shift().value);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          var now = scheduler.now();
          while (q.length > 0 && now - q[0].interval >= duration) {
            o.onNext(q.shift().value);
          }
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeLastWithTime = function(duration, scheduler) {
      var source = this;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          var now = scheduler.now();
          q.push({
            interval: now,
            value: x
          });
          while (q.length > 0 && now - q[0].interval >= duration) {
            q.shift();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          var now = scheduler.now();
          while (q.length > 0) {
            var next = q.shift();
            if (now - next.interval <= duration) {
              o.onNext(next.value);
            }
          }
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeLastBufferWithTime = function(duration, scheduler) {
      var source = this;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          var now = scheduler.now();
          q.push({
            interval: now,
            value: x
          });
          while (q.length > 0 && now - q[0].interval >= duration) {
            q.shift();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          var now = scheduler.now(),
              res = [];
          while (q.length > 0) {
            var next = q.shift();
            now - next.interval <= duration && res.push(next.value);
          }
          o.onNext(res);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeWithTime = function(duration, scheduler) {
      var source = this;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(o) {
        return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function() {
          o.onCompleted();
        }), source.subscribe(o));
      }, source);
    };
    observableProto.skipWithTime = function(duration, scheduler) {
      var source = this;
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      return new AnonymousObservable(function(observer) {
        var open = false;
        return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function() {
          open = true;
        }), source.subscribe(function(x) {
          open && observer.onNext(x);
        }, observer.onError.bind(observer), observer.onCompleted.bind(observer)));
      }, source);
    };
    observableProto.skipUntilWithTime = function(startTime, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      var source = this,
          schedulerMethod = startTime instanceof Date ? 'scheduleWithAbsolute' : 'scheduleWithRelative';
      return new AnonymousObservable(function(o) {
        var open = false;
        return new CompositeDisposable(scheduler[schedulerMethod](startTime, function() {
          open = true;
        }), source.subscribe(function(x) {
          open && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        }));
      }, source);
    };
    observableProto.takeUntilWithTime = function(endTime, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      var source = this,
          schedulerMethod = endTime instanceof Date ? 'scheduleWithAbsolute' : 'scheduleWithRelative';
      return new AnonymousObservable(function(o) {
        return new CompositeDisposable(scheduler[schedulerMethod](endTime, function() {
          o.onCompleted();
        }), source.subscribe(o));
      }, source);
    };
    observableProto.throttleFirst = function(windowDuration, scheduler) {
      isScheduler(scheduler) || (scheduler = timeoutScheduler);
      var duration = +windowDuration || 0;
      if (duration <= 0) {
        throw new RangeError('windowDuration cannot be less or equal zero.');
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var lastOnNext = 0;
        return source.subscribe(function(x) {
          var now = scheduler.now();
          if (lastOnNext === 0 || now - lastOnNext >= duration) {
            lastOnNext = now;
            o.onNext(x);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.transduce = function(transducer) {
      var source = this;
      function transformForObserver(o) {
        return {
          '@@transducer/init': function() {
            return o;
          },
          '@@transducer/step': function(obs, input) {
            return obs.onNext(input);
          },
          '@@transducer/result': function(obs) {
            return obs.onCompleted();
          }
        };
      }
      return new AnonymousObservable(function(o) {
        var xform = transducer(transformForObserver(o));
        return source.subscribe(function(v) {
          var res = tryCatch(xform['@@transducer/step']).call(xform, o, v);
          if (res === errorObj) {
            o.onError(res.e);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          xform['@@transducer/result'](o);
        });
      }, source);
    };
    observableProto.switchFirst = function() {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var hasCurrent = false,
            isStopped = false,
            m = new SingleAssignmentDisposable(),
            g = new CompositeDisposable();
        g.add(m);
        m.setDisposable(sources.subscribe(function(innerSource) {
          if (!hasCurrent) {
            hasCurrent = true;
            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
            var innerSubscription = new SingleAssignmentDisposable();
            g.add(innerSubscription);
            innerSubscription.setDisposable(innerSource.subscribe(function(x) {
              o.onNext(x);
            }, function(e) {
              o.onError(e);
            }, function() {
              g.remove(innerSubscription);
              hasCurrent = false;
              isStopped && g.length === 1 && o.onCompleted();
            }));
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          isStopped = true;
          !hasCurrent && g.length === 1 && o.onCompleted();
        }));
        return g;
      }, this);
    };
    observableProto.flatMapFirst = observableProto.selectManyFirst = function(selector, resultSelector, thisArg) {
      return new FlatMapObservable(this, selector, resultSelector, thisArg).switchFirst();
    };
    Rx.Observable.prototype.flatMapWithMaxConcurrent = function(limit, selector, resultSelector, thisArg) {
      return new FlatMapObservable(this, selector, resultSelector, thisArg).merge(limit);
    };
    var VirtualTimeScheduler = Rx.VirtualTimeScheduler = (function(__super__) {
      function localNow() {
        return this.toDateTimeOffset(this.clock);
      }
      function scheduleNow(state, action) {
        return this.scheduleAbsoluteWithState(state, this.clock, action);
      }
      function scheduleRelative(state, dueTime, action) {
        return this.scheduleRelativeWithState(state, this.toRelative(dueTime), action);
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this.scheduleRelativeWithState(state, this.toRelative(dueTime - this.now()), action);
      }
      function invokeAction(scheduler, action) {
        action();
        return disposableEmpty;
      }
      inherits(VirtualTimeScheduler, __super__);
      function VirtualTimeScheduler(initialClock, comparer) {
        this.clock = initialClock;
        this.comparer = comparer;
        this.isEnabled = false;
        this.queue = new PriorityQueue(1024);
        __super__.call(this, localNow, scheduleNow, scheduleRelative, scheduleAbsolute);
      }
      var VirtualTimeSchedulerPrototype = VirtualTimeScheduler.prototype;
      VirtualTimeSchedulerPrototype.add = notImplemented;
      VirtualTimeSchedulerPrototype.toDateTimeOffset = notImplemented;
      VirtualTimeSchedulerPrototype.toRelative = notImplemented;
      VirtualTimeSchedulerPrototype.schedulePeriodicWithState = function(state, period, action) {
        var s = new SchedulePeriodicRecursive(this, state, period, action);
        return s.start();
      };
      VirtualTimeSchedulerPrototype.scheduleRelativeWithState = function(state, dueTime, action) {
        var runAt = this.add(this.clock, dueTime);
        return this.scheduleAbsoluteWithState(state, runAt, action);
      };
      VirtualTimeSchedulerPrototype.scheduleRelative = function(dueTime, action) {
        return this.scheduleRelativeWithState(action, dueTime, invokeAction);
      };
      VirtualTimeSchedulerPrototype.start = function() {
        if (!this.isEnabled) {
          this.isEnabled = true;
          do {
            var next = this.getNext();
            if (next !== null) {
              this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
              next.invoke();
            } else {
              this.isEnabled = false;
            }
          } while (this.isEnabled);
        }
      };
      VirtualTimeSchedulerPrototype.stop = function() {
        this.isEnabled = false;
      };
      VirtualTimeSchedulerPrototype.advanceTo = function(time) {
        var dueToClock = this.comparer(this.clock, time);
        if (this.comparer(this.clock, time) > 0) {
          throw new ArgumentOutOfRangeError();
        }
        if (dueToClock === 0) {
          return;
        }
        if (!this.isEnabled) {
          this.isEnabled = true;
          do {
            var next = this.getNext();
            if (next !== null && this.comparer(next.dueTime, time) <= 0) {
              this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
              next.invoke();
            } else {
              this.isEnabled = false;
            }
          } while (this.isEnabled);
          this.clock = time;
        }
      };
      VirtualTimeSchedulerPrototype.advanceBy = function(time) {
        var dt = this.add(this.clock, time),
            dueToClock = this.comparer(this.clock, dt);
        if (dueToClock > 0) {
          throw new ArgumentOutOfRangeError();
        }
        if (dueToClock === 0) {
          return;
        }
        this.advanceTo(dt);
      };
      VirtualTimeSchedulerPrototype.sleep = function(time) {
        var dt = this.add(this.clock, time);
        if (this.comparer(this.clock, dt) >= 0) {
          throw new ArgumentOutOfRangeError();
        }
        this.clock = dt;
      };
      VirtualTimeSchedulerPrototype.getNext = function() {
        while (this.queue.length > 0) {
          var next = this.queue.peek();
          if (next.isCancelled()) {
            this.queue.dequeue();
          } else {
            return next;
          }
        }
        return null;
      };
      VirtualTimeSchedulerPrototype.scheduleAbsolute = function(dueTime, action) {
        return this.scheduleAbsoluteWithState(action, dueTime, invokeAction);
      };
      VirtualTimeSchedulerPrototype.scheduleAbsoluteWithState = function(state, dueTime, action) {
        var self = this;
        function run(scheduler, state1) {
          self.queue.remove(si);
          return action(scheduler, state1);
        }
        var si = new ScheduledItem(this, state, run, dueTime, this.comparer);
        this.queue.enqueue(si);
        return si.disposable;
      };
      return VirtualTimeScheduler;
    }(Scheduler));
    Rx.HistoricalScheduler = (function(__super__) {
      inherits(HistoricalScheduler, __super__);
      function HistoricalScheduler(initialClock, comparer) {
        var clock = initialClock == null ? 0 : initialClock;
        var cmp = comparer || defaultSubComparer;
        __super__.call(this, clock, cmp);
      }
      var HistoricalSchedulerProto = HistoricalScheduler.prototype;
      HistoricalSchedulerProto.add = function(absolute, relative) {
        return absolute + relative;
      };
      HistoricalSchedulerProto.toDateTimeOffset = function(absolute) {
        return new Date(absolute).getTime();
      };
      HistoricalSchedulerProto.toRelative = function(timeSpan) {
        return timeSpan;
      };
      return HistoricalScheduler;
    }(Rx.VirtualTimeScheduler));
    var AnonymousObservable = Rx.AnonymousObservable = (function(__super__) {
      inherits(AnonymousObservable, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            self = state[1];
        var sub = tryCatch(self.__subscribe).call(self, ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function innerSubscribe(observer) {
        var ado = new AutoDetachObserver(observer),
            state = [ado, this];
        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.scheduleWithState(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      }
      function AnonymousObservable(subscribe, parent) {
        this.source = parent;
        this.__subscribe = subscribe;
        __super__.call(this, innerSubscribe);
      }
      return AnonymousObservable;
    }(Observable));
    var AutoDetachObserver = (function(__super__) {
      inherits(AutoDetachObserver, __super__);
      function AutoDetachObserver(observer) {
        __super__.call(this);
        this.observer = observer;
        this.m = new SingleAssignmentDisposable();
      }
      var AutoDetachObserverPrototype = AutoDetachObserver.prototype;
      AutoDetachObserverPrototype.next = function(value) {
        var result = tryCatch(this.observer.onNext).call(this.observer, value);
        if (result === errorObj) {
          this.dispose();
          thrower(result.e);
        }
      };
      AutoDetachObserverPrototype.error = function(err) {
        var result = tryCatch(this.observer.onError).call(this.observer, err);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.completed = function() {
        var result = tryCatch(this.observer.onCompleted).call(this.observer);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.setDisposable = function(value) {
        this.m.setDisposable(value);
      };
      AutoDetachObserverPrototype.getDisposable = function() {
        return this.m.getDisposable();
      };
      AutoDetachObserverPrototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.m.dispose();
      };
      return AutoDetachObserver;
    }(AbstractObserver));
    var GroupedObservable = (function(__super__) {
      inherits(GroupedObservable, __super__);
      function subscribe(observer) {
        return this.underlyingObservable.subscribe(observer);
      }
      function GroupedObservable(key, underlyingObservable, mergedDisposable) {
        __super__.call(this, subscribe);
        this.key = key;
        this.underlyingObservable = !mergedDisposable ? underlyingObservable : new AnonymousObservable(function(observer) {
          return new CompositeDisposable(mergedDisposable.getDisposable(), underlyingObservable.subscribe(observer));
        });
      }
      return GroupedObservable;
    }(Observable));
    var Subject = Rx.Subject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
          return disposableEmpty;
        }
        observer.onCompleted();
        return disposableEmpty;
      }
      inherits(Subject, __super__);
      function Subject() {
        __super__.call(this, subscribe);
        this.isDisposed = false, this.isStopped = false, this.observers = [];
        this.hasError = false;
      }
      addProperties(Subject.prototype, Observer.prototype, {
        hasObservers: function() {
          return this.observers.length > 0;
        },
        onCompleted: function() {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onCompleted();
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.error = error;
            this.hasError = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (!this.isStopped) {
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onNext(value);
            }
          }
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
        }
      });
      Subject.create = function(observer, observable) {
        return new AnonymousSubject(observer, observable);
      };
      return Subject;
    }(Observable));
    var AsyncSubject = Rx.AsyncSubject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
        } else if (this.hasValue) {
          observer.onNext(this.value);
          observer.onCompleted();
        } else {
          observer.onCompleted();
        }
        return disposableEmpty;
      }
      inherits(AsyncSubject, __super__);
      function AsyncSubject() {
        __super__.call(this, subscribe);
        this.isDisposed = false;
        this.isStopped = false;
        this.hasValue = false;
        this.observers = [];
        this.hasError = false;
      }
      addProperties(AsyncSubject.prototype, Observer, {
        hasObservers: function() {
          checkDisposed(this);
          return this.observers.length > 0;
        },
        onCompleted: function() {
          var i,
              len;
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            var os = cloneArray(this.observers),
                len = os.length;
            if (this.hasValue) {
              for (i = 0; i < len; i++) {
                var o = os[i];
                o.onNext(this.value);
                o.onCompleted();
              }
            } else {
              for (i = 0; i < len; i++) {
                os[i].onCompleted();
              }
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.hasError = true;
            this.error = error;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (this.isStopped) {
            return;
          }
          this.value = value;
          this.hasValue = true;
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
          this.exception = null;
          this.value = null;
        }
      });
      return AsyncSubject;
    }(Observable));
    var AnonymousSubject = Rx.AnonymousSubject = (function(__super__) {
      inherits(AnonymousSubject, __super__);
      function subscribe(observer) {
        return this.observable.subscribe(observer);
      }
      function AnonymousSubject(observer, observable) {
        this.observer = observer;
        this.observable = observable;
        __super__.call(this, subscribe);
      }
      addProperties(AnonymousSubject.prototype, Observer.prototype, {
        onCompleted: function() {
          this.observer.onCompleted();
        },
        onError: function(error) {
          this.observer.onError(error);
        },
        onNext: function(value) {
          this.observer.onNext(value);
        }
      });
      return AnonymousSubject;
    }(Observable));
    Rx.Pauser = (function(__super__) {
      inherits(Pauser, __super__);
      function Pauser() {
        __super__.call(this);
      }
      Pauser.prototype.pause = function() {
        this.onNext(false);
      };
      Pauser.prototype.resume = function() {
        this.onNext(true);
      };
      return Pauser;
    }(Subject));
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      root.Rx = Rx;
      define(function() {
        return Rx;
      });
    } else if (freeExports && freeModule) {
      if (moduleExports) {
        (freeModule.exports = Rx).Rx = Rx;
      } else {
        freeExports.Rx = Rx;
      }
    } else {
      root.Rx = Rx;
    }
    var rEndingLine = captureLine();
  }.call(this));
})(require("process"));
