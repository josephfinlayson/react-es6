/* */ 
"format cjs";
;
(function(factory) {
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
  if (typeof define === 'function' && define.amd) {
    define(['./rx.core'], function(Rx, exports) {
      return factory(root, exports, Rx);
    });
  } else if (typeof module === 'object' && module && module.exports === freeExports) {
    module.exports = factory(root, module.exports, require("./rx.core"));
  } else {
    root.Rx = factory(root, {}, root.Rx);
  }
}.call(this, function(root, exp, Rx, undefined) {
  var Observer = Rx.Observer,
      Observable = Rx.Observable,
      Disposable = Rx.Disposable,
      disposableEmpty = Disposable.empty,
      disposableCreate = Disposable.create,
      CompositeDisposable = Rx.CompositeDisposable,
      SingleAssignmentDisposable = Rx.SingleAssignmentDisposable,
      Scheduler = Rx.Scheduler,
      ScheduledItem = Rx.internals.ScheduledItem,
      SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive,
      inherits = Rx.internals.inherits,
      notImplemented = Rx.helpers.notImplemented,
      defaultComparer = Rx.helpers.defaultComparer = function(a, b) {
        return isEqual(a, b);
      };
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
  function OnNextPredicate(predicate) {
    this.predicate = predicate;
  }
  ;
  OnNextPredicate.prototype.equals = function(other) {
    if (other === this) {
      return true;
    }
    if (other == null) {
      return false;
    }
    if (other.kind !== 'N') {
      return false;
    }
    return this.predicate(other.value);
  };
  function OnErrorPredicate(predicate) {
    this.predicate = predicate;
  }
  ;
  OnErrorPredicate.prototype.equals = function(other) {
    if (other === this) {
      return true;
    }
    if (other == null) {
      return false;
    }
    if (other.kind !== 'E') {
      return false;
    }
    return this.predicate(other.exception);
  };
  var ReactiveTest = Rx.ReactiveTest = {
    created: 100,
    subscribed: 200,
    disposed: 1000,
    onNext: function(ticks, value) {
      return typeof value === 'function' ? new Recorded(ticks, new OnNextPredicate(value)) : new Recorded(ticks, Notification.createOnNext(value));
    },
    onError: function(ticks, error) {
      return typeof error === 'function' ? new Recorded(ticks, new OnErrorPredicate(error)) : new Recorded(ticks, Notification.createOnError(error));
    },
    onCompleted: function(ticks) {
      return new Recorded(ticks, Notification.createOnCompleted());
    },
    subscribe: function(start, end) {
      return new Subscription(start, end);
    }
  };
  var Recorded = Rx.Recorded = function(time, value, comparer) {
    this.time = time;
    this.value = value;
    this.comparer = comparer || defaultComparer;
  };
  Recorded.prototype.equals = function(other) {
    return this.time === other.time && this.comparer(this.value, other.value);
  };
  Recorded.prototype.toString = function() {
    return this.value.toString() + '@' + this.time;
  };
  var Subscription = Rx.Subscription = function(start, end) {
    this.subscribe = start;
    this.unsubscribe = end || Number.MAX_VALUE;
  };
  Subscription.prototype.equals = function(other) {
    return this.subscribe === other.subscribe && this.unsubscribe === other.unsubscribe;
  };
  Subscription.prototype.toString = function() {
    return '(' + this.subscribe + ', ' + (this.unsubscribe === Number.MAX_VALUE ? 'Infinite' : this.unsubscribe) + ')';
  };
  var MockDisposable = Rx.MockDisposable = function(scheduler) {
    this.scheduler = scheduler;
    this.disposes = [];
    this.disposes.push(this.scheduler.clock);
  };
  MockDisposable.prototype.dispose = function() {
    this.disposes.push(this.scheduler.clock);
  };
  var MockObserver = (function(__super__) {
    inherits(MockObserver, __super__);
    function MockObserver(scheduler) {
      __super__.call(this);
      this.scheduler = scheduler;
      this.messages = [];
    }
    var MockObserverPrototype = MockObserver.prototype;
    MockObserverPrototype.onNext = function(value) {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnNext(value)));
    };
    MockObserverPrototype.onError = function(exception) {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnError(exception)));
    };
    MockObserverPrototype.onCompleted = function() {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnCompleted()));
    };
    return MockObserver;
  })(Observer);
  function MockPromise(scheduler, messages) {
    var self = this;
    this.scheduler = scheduler;
    this.messages = messages;
    this.subscriptions = [];
    this.observers = [];
    for (var i = 0,
        len = this.messages.length; i < len; i++) {
      var message = this.messages[i],
          notification = message.value;
      (function(innerNotification) {
        scheduler.scheduleAbsoluteWithState(null, message.time, function() {
          var obs = self.observers.slice(0);
          for (var j = 0,
              jLen = obs.length; j < jLen; j++) {
            innerNotification.accept(obs[j]);
          }
          return disposableEmpty;
        });
      })(notification);
    }
  }
  MockPromise.prototype.then = function(onResolved, onRejected) {
    var self = this;
    this.subscriptions.push(new Subscription(this.scheduler.clock));
    var index = this.subscriptions.length - 1;
    var newPromise;
    var observer = Rx.Observer.create(function(x) {
      var retValue = onResolved(x);
      if (retValue && typeof retValue.then === 'function') {
        newPromise = retValue;
      } else {
        var ticks = self.scheduler.clock;
        newPromise = new MockPromise(self.scheduler, [Rx.ReactiveTest.onNext(ticks, undefined), Rx.ReactiveTest.onCompleted(ticks)]);
      }
      var idx = self.observers.indexOf(observer);
      self.observers.splice(idx, 1);
      self.subscriptions[index] = new Subscription(self.subscriptions[index].subscribe, self.scheduler.clock);
    }, function(err) {
      onRejected(err);
      var idx = self.observers.indexOf(observer);
      self.observers.splice(idx, 1);
      self.subscriptions[index] = new Subscription(self.subscriptions[index].subscribe, self.scheduler.clock);
    });
    this.observers.push(observer);
    return newPromise || new MockPromise(this.scheduler, this.messages);
  };
  var HotObservable = (function(__super__) {
    function subscribe(observer) {
      var observable = this;
      this.observers.push(observer);
      this.subscriptions.push(new Subscription(this.scheduler.clock));
      var index = this.subscriptions.length - 1;
      return disposableCreate(function() {
        var idx = observable.observers.indexOf(observer);
        observable.observers.splice(idx, 1);
        observable.subscriptions[index] = new Subscription(observable.subscriptions[index].subscribe, observable.scheduler.clock);
      });
    }
    inherits(HotObservable, __super__);
    function HotObservable(scheduler, messages) {
      __super__.call(this, subscribe);
      var message,
          notification,
          observable = this;
      this.scheduler = scheduler;
      this.messages = messages;
      this.subscriptions = [];
      this.observers = [];
      for (var i = 0,
          len = this.messages.length; i < len; i++) {
        message = this.messages[i];
        notification = message.value;
        (function(innerNotification) {
          scheduler.scheduleAbsoluteWithState(null, message.time, function() {
            var obs = observable.observers.slice(0);
            for (var j = 0,
                jLen = obs.length; j < jLen; j++) {
              innerNotification.accept(obs[j]);
            }
            return disposableEmpty;
          });
        })(notification);
      }
    }
    return HotObservable;
  })(Observable);
  var ColdObservable = (function(__super__) {
    function subscribe(observer) {
      var message,
          notification,
          observable = this;
      this.subscriptions.push(new Subscription(this.scheduler.clock));
      var index = this.subscriptions.length - 1;
      var d = new CompositeDisposable();
      for (var i = 0,
          len = this.messages.length; i < len; i++) {
        message = this.messages[i];
        notification = message.value;
        (function(innerNotification) {
          d.add(observable.scheduler.scheduleRelativeWithState(null, message.time, function() {
            innerNotification.accept(observer);
            return disposableEmpty;
          }));
        })(notification);
      }
      return disposableCreate(function() {
        observable.subscriptions[index] = new Subscription(observable.subscriptions[index].subscribe, observable.scheduler.clock);
        d.dispose();
      });
    }
    inherits(ColdObservable, __super__);
    function ColdObservable(scheduler, messages) {
      __super__.call(this, subscribe);
      this.scheduler = scheduler;
      this.messages = messages;
      this.subscriptions = [];
    }
    return ColdObservable;
  })(Observable);
  Rx.TestScheduler = (function(__super__) {
    inherits(TestScheduler, __super__);
    function baseComparer(x, y) {
      return x > y ? 1 : (x < y ? -1 : 0);
    }
    function TestScheduler() {
      __super__.call(this, 0, baseComparer);
    }
    TestScheduler.prototype.scheduleAbsoluteWithState = function(state, dueTime, action) {
      dueTime <= this.clock && (dueTime = this.clock + 1);
      return __super__.prototype.scheduleAbsoluteWithState.call(this, state, dueTime, action);
    };
    TestScheduler.prototype.add = function(absolute, relative) {
      return absolute + relative;
    };
    TestScheduler.prototype.toDateTimeOffset = function(absolute) {
      return new Date(absolute).getTime();
    };
    TestScheduler.prototype.toRelative = function(timeSpan) {
      return timeSpan;
    };
    TestScheduler.prototype.startWithTiming = function(create, created, subscribed, disposed) {
      var observer = this.createObserver(),
          source,
          subscription;
      this.scheduleAbsoluteWithState(null, created, function() {
        source = create();
        return disposableEmpty;
      });
      this.scheduleAbsoluteWithState(null, subscribed, function() {
        subscription = source.subscribe(observer);
        return disposableEmpty;
      });
      this.scheduleAbsoluteWithState(null, disposed, function() {
        subscription.dispose();
        return disposableEmpty;
      });
      this.start();
      return observer;
    };
    TestScheduler.prototype.startWithDispose = function(create, disposed) {
      return this.startWithTiming(create, ReactiveTest.created, ReactiveTest.subscribed, disposed);
    };
    TestScheduler.prototype.startWithCreate = function(create) {
      return this.startWithTiming(create, ReactiveTest.created, ReactiveTest.subscribed, ReactiveTest.disposed);
    };
    TestScheduler.prototype.createHotObservable = function() {
      var len = arguments.length,
          args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return new HotObservable(this, args);
    };
    TestScheduler.prototype.createColdObservable = function() {
      var len = arguments.length,
          args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return new ColdObservable(this, args);
    };
    TestScheduler.prototype.createResolvedPromise = function(ticks, value) {
      return new MockPromise(this, [Rx.ReactiveTest.onNext(ticks, value), Rx.ReactiveTest.onCompleted(ticks)]);
    };
    TestScheduler.prototype.createRejectedPromise = function(ticks, reason) {
      return new MockPromise(this, [Rx.ReactiveTest.onError(ticks, reason)]);
    };
    TestScheduler.prototype.createObserver = function() {
      return new MockObserver(this);
    };
    return TestScheduler;
  })(VirtualTimeScheduler);
  return Rx;
}));
