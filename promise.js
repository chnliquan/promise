const Promise = (()=>{
    // promise 的三种状态
    const PENDING = 'pending',
          FULFILLED = 'fulfilled',
          REJECTED = 'rejected';

    const Promise = function (_executor) {
        this.status = 'pending'; // 初始状态
        this.data = void 0; // 初始值
        this.callbacks = []; // onResolved onRejected 回调函数集合

        // 成功回调执行函数
        const _resolve = (_value) => {
            // Notes 3.1
            setTimeout(() => {
                // 如果当前状态不是 pending 说明状态已经确定，不能再次改变
                if (this.status !== PENDING) return;

                // 设置最终状态为 fulfilled
                this.status = FULFILLED;
                this.data = _value;

                // 触发集合中的 onResolved 函数
                for(let i = 0, l = this.callbacks.length; i < l; i++) {
                    this.callbacks[i].onResolved(_value);
                }
            })
        };

        // 失败回调执行函数
        const _reject = (_reason) => {
            // Notes 3.1
            setTimeout(() => {
                // 如果当前状态不是 pending 说明状态已经确定，不能再次改变
                if (this.status !== PENDING) return;

                // 设置最终状态为 rejected
                this.status = REJECTED;
                this.data = _reason;

                // 触发集合中的 onRejected 函数
                for(let i = 0, l = this.callbacks.length; i < l; i++) {
                    this.callbacks[i].onRejected(_reason);
                }
            })
        };

        // 防止 executor 函数中发生异常
        try {
            _executor(_resolve, _reject);
        }catch(_e) {
            _reject(_e);
        }
    }

    Promise.prototype.then = function(_onResolved, _onRejected) {
        let _promise2;

        // 2.2.1
        _onResolved = typeof _onResolved === 'function' ?
                      _onResolved : (_value) => _value;
        _onRejected = typeof _onRejected === 'function' ?
                      _onRejected : (_reason) => {throw _reason};

        if (this.status === FULFILLED) {
            return _promise2 = new Promise((_resolve, _reject) => {
                setTimeout(() => {
                    try {
                        const _x = _onResolved(this.data); // _x 可能为一个 thenable

                        _resolvePromise(_promise2, _x, _resolve, _reject);
                    }catch (_e) {
                        return _reject(_e);
                    }
                })
            });
        }

        if (this.status === REJECTED) {
            return _promise2 = new Promise((_resolve, _reject) => {
                setTimeout(() => {
                    try {
                        const _x = _onRejected(this.data); // _x 可能为一个 thenable

                        _resolvePromise(_promise2, _x, _resolve, _reject);
                    }catch (_e) {
                        return _reject(_e);
                    }
                })
            });
        }

        if (this.status === PENDING) {
            return _promise2 = new Promise((_resolve, _reject) => {
                // 如果当前状态是 pending，此时不能确定调用 onResolved 还是 onRejected
                // 将处理逻辑做为 callback 放入 promise 的回调函数集合里，当状态确定时触发对应的回调
                this.callbacks.push({
                    onResolved (_value) {
                        try {
                            const _x = _onResolved(_value); // _x 可能为一个 thenable
                            
                            _resolvePromise(_promise2, _x, _resolve, _reject);
                        } catch (_e) {
                            return _reject(_e);
                        }
                    },

                    onRejected (_reason) {
                        try {
                            const _x = _onRejected(_reason); // _x 可能为一个 thenable
                            
                            _resolvePromise(_promise2, _x, _resolve, _reject);
                        } catch (_e) {
                            return _reject(_e);
                        }
                    }
                });
            });
        } 
    };

    // 根据 promises/A+ 标准，执行 promise resolution procedure
    const _resolvePromise = (_promise2, _x, _resolve, _reject) => {
        let _hasBeenCalled = !1,
            _then;

        // 2.3.1 
        if (_promise2 === _x) {
            return _reject(new TypeError('Chaining cycle detected for promise!'));
        }

        // 2.3.2 
        if (_x instanceof Promise) {
            if (_x.status === PENDING) { // 2.3.2.1
                _x.then((_value) => {
                    _resolvePromise(_promise2, _value, _resolve, _reject);
                }, _reject);
            }else { // 2.3.2.2 && 2.3.2.3
                _x.then(_resolve, _reject); 
            }

            return;
        }

        // 2.3.3
        if (_x !== null && (typeof _x === 'object' || typeof _x === 'function')) {
            _then = _x.then; // 2.3.3.1

            // 2.3.3.2
            try {
                // 2.3.3.3
                if (typeof _then === 'function') {
                    _then.call(_x, (_y) => { // 2.3.3.3.1
                        // 2.3.3.3.3
                        if (_hasBeenCalled) return;

                        _hasBeenCalled = !0;

                        _resolvePromise(_promise2, _y, _resolve, _reject);
                    }, (_r) => { // 2.3.3.3.2
                        // 2.3.3.3.3
                        if (_hasBeenCalled) return;

                        _hasBeenCalled = !0;

                        return _reject(_r);
                    });
                }else {
                    return _resolve(_x); // 2.3.3.4
                }
            }catch (_e) { // 2.3.3.3.4
                // 2.3.3.4.1
                if (_hasBeenCalled) return;

                _hasBeenCalled = !0;

                return _reject(_e); // 2.3.3.4.2
            }
        }else {
            return _resolve(_x); // 2.3.4
        }
    };

    Promise.prototype.catch = function(_onRejected) {
        return this.then(null, _onRejected);
    };

    /**
     *  无论是 resolved 还是 rejected 都会执行
     * 
     *  @public
     *  @param  {Array}  arg0    - promise 数组
     *  @return {Object} Promise - Promise 对象
     */
    Promise.prototype.finally = function (_fn) {
        
        // 在 then 中调用 fn 时又进行了一次异步操作，所以它总是最后调用的
        return this.then((_value) => {
            setTimeout(_fn);

            return v;
        }, (_reason) => {
            setTimeout(_fn);

            throw _reason;
        })
    };

    /**
     *  当所有 promise 都 resolved 时执行 resolve，否则执行 reject
     *  
     *  example
     *
     *  ```js
     *      const promise1 = Promise.resolve(3),
     *            promise2 = 42,
     *            promise3 = new Promise((_resolve, _reject) => {
     *                setTimeout(_resolve, 100, 'foo');
     *            });
     *
     *      Promise.all([promise1, promise2, promise3]).then((_values) => {
     *          console.log(_values);
     *      });
     *      // [3, 42, "foo"]
     *  ```
     *
     *  @public
     *  @param  {Array}  arg0    - promise 数组
     *  @return {Object} Promise - Promise 对象
     */
    Promise.all = (_iterable) => {
        if (!Array.isArray(_iterable)) {
            throw new TypeError("Promise.all need Array object as argument");
        }

        return new Promise((_resolve, _reject) => {
            let _resolvedCount = 0,
                _totalCount = _iterable.length,
                _resolvedValues = new Array(_totalCount);
            
            for (let i = 0; i < _totalCount; i++) {
                _promise = _iterable[i];

                Promise.resolve(_promise).then((_value) => {
                    _resolvedCount++;
                    _resolvedValues[i] = _value;

                    if (_resolvedCount === _totalCount) {
                        return _resolve(_resolvedValues);
                    }
                }, (_reason) => {
                    return _reject(_reason);
                });
            }
        })
    };

    /**
     *  当有一个 promise resolved 或者 rejected 就执行相应的状态
     *  
     *  example
     *
     *  ```js
     *      const promise1 = new Promise((_resolve, _reject) {
     *          setTimeout(_resolve, 500, 'one');
     *      });
     *
     *      const promise2 = new Promise((_resolve, _reject) {
     *          setTimeout(resolve, 100, 'two');
     *      });
     *
     *      Promise.race([promise1, promise2]).then((_value) {
     *          console.log(_value);
     *          // Both resolve, but promise2 is faster
     *      });
     *      // "two"
     *  ```
     *
     *  @public
     *  @param  {Array}  arg0    - promise 数组
     *  @return {Object} Promise - Promise 对象
     */
    Promise.race = (_iterable) => {
        if (!Array.isArray(_iterable)) {
            throw new TypeError("Promise.race need Array object as argument");
        }

        return new Promise((_resolve, _reject) => {
            _iterable.forEach(_promise => _promise.then(_resolve, _reject));
        });
    };

    /**
     *  对传入的值进行 resolve
     *  
     *  example
     *
     *  ```js
     *      const promise = Promise.resolve([1, 2, 3]);
     *
     *      promise.then((_value) => {
     *          console.log(_value);
     *      });
     *      // [1, 2, 3]
     *  ```
     *
     *  @public
     *  @param  {Variable}  arg0    - 任意值
     *  @return {Object}    Promise - Promise 对象
     */
    // Promise.resolve = (_value) => {
    //     return new Promise((_resolve, _reject) => _resolve(_value));
    // };
    Promise.resolve = (_value) => {
        let _promise;

        _promise = new Promise((_resolve, _reject) => {
            _resolvePromise(_promise, _value, _resolve, _reject);
        });

        return _promise;
    }

    /**
     *  对传入的值进行 reject
     *  
     *  example
     *
     *  ```js
     *      function resolved(result) {
     *          console.log('Resolved');
     *      }
     *
     *      function rejected(result) {
     *          console.log(result);
     *      }
     *
     *      Promise.reject(new Error('fail')).then(resolved, rejected);
     *      // Error: fail
     *  ```
     *
     *  @public
     *  @param  {Variable}  arg0    - 任意值
     *  @return {Object}    Promise - Promise 对象
     */
    Promise.reject = (_reason) => {
        return new Promise((_resolve, _reject) => _reject(_reason));
    };

    return Promise;
})();

// const promise = new Promise((_resolve, _reject)=>{
//     setTimeout(() => {
//         _resolve('success');
//         _reject('fail');
//     }, 2000);
    
//     // _resolve('success');

//     // throw 'error';
// });

// promise.then((_value) => {
//     console.log(_value);
// }, (_e) => {
//     console.log(_e);
// });
var promise1 = Promise.resolve(3);
var promise2 = 42;
var promise3 = new Promise(function(resolve, reject) {
  setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3]).then(function(values) {
  console.log(values);
});