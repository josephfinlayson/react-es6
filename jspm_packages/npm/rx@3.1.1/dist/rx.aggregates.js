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
    define(['./rx'], function(Rx, exports) {
      return factory(root, exports, Rx);
    });
  } else if (typeof module === 'object' && module && module.exports === freeExports) {
    module.exports = factory(root, module.exports, require("./rx"));
  } else {
    root.Rx = factory(root, {}, root.Rx);
  }
}.call(this, function(root, exp, Rx, undefined) {
  var Observable = Rx.Observable,
      observableProto = Observable.prototype,
      CompositeDisposable = Rx.CompositeDisposable,
      AnonymousObservable = Rx.AnonymousObservable,
      AbstractObserver = Rx.internals.AbstractObserver,
      disposableEmpty = Rx.Disposable.empty,
      isEqual = Rx.internals.isEqual,
      helpers = Rx.helpers,
      not = helpers.not,
      defaultComparer = helpers.defaultComparer,
      identity = helpers.identity,
      defaultSubComparer = helpers.defaultSubComparer,
      isFunction = helpers.isFunction,
      isPromise = helpers.isPromise,
      isArrayLike = helpers.isArrayLike,
      isIterable = helpers.isIterable,
      inherits = Rx.internals.inherits,
      observableFromPromise = Observable.fromPromise,
      observableFrom = Observable.from,
      bindCallback = Rx.internals.bindCallback,
      EmptyError = Rx.EmptyError,
      ObservableBase = Rx.ObservableBase,
      ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError;
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
  return Rx;
}));
