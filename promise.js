const PENDING = 'pending',
      FULFILLED = 'fulfilled',
      REJECTED = 'rejected';

// 根据 promises/A+ 标准，执行 promise resolution procedure
const _resolvePromise = (_promise, _x, _resolve, _reject) => {
    let _hasBeenCalled = !1,
        _then;

    // 2.3.1 
    if (_promise === _x) {
        return _reject(new TypeError('Chaining cycle detected for promise!'));
    }

    // 2.3.2 
    if (_x instanceof Promise) {
        if (_x.status === PENDING) { // 2.3.2.1
            _x.then(_value => {
                _resolvePromise(_promise, _value, _resolve, _reject);
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
                _then.call(_x, _y => { // 2.3.3.3.1
                    // 2.3.3.3.3
                    if (_hasBeenCalled) return;

                    _hasBeenCalled = !0;

                    return _resolvePromise(_promise, _y, _resolve, _reject);
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

class Promise {
    constructor(_executor) {
        this.status = PENDING; // 初始状态
        this.data = void 0; // 初始值
        this.callbacks = []; // 回调集合

        const _resolve = (_value) => {
            setTimeout(() => {
                if (this.status !== PENDING) return; // 如果状态已经确定则跳出

                this.status = FULFILLED;
                this.data = _value;

                this.callbacks.forEach(_obj => {
                    _obj.onFulfilled(_value);
                })
            })
        };

        const _reject = (_reason) => {
            setTimeout(() => {
                if (this.status !== PENDING) return; // 如果状态已经确定则跳出

                this.status = REJECTED;
                this.data = _reason;

                this.callbacks.forEach(_obj => {
                    _obj.onRejected(_reason);
                })
            })
        };

        try {
            _executor(_resolve, _reject);
        }catch (_e) {
            _reject(_e);
        }
    }

    then(_onFulfilled, _onRejected) {
        let _promise;

        _onFulfilled = typeof _onFulfilled === 'function' ?
                      _onFulfilled : _value => _value;
        _onRejected = typeof _onRejected === 'function' ?
                      _onRejected : _reason => {throw _reason};

        if (this.status === FULFILLED) {
            return _promise = new Promise((_resolve, _reject) => {
                setTimeout(() => {
                    try {
                        let _x = _onFulfilled();

                        _resolvePromise(_promise, _x, _resolve, _reject);
                    }catch (_e) {
                        return _reject(_e);
                    }
                })
            });
        }

        if (this.status === REJECTED) {
            return _promise = new Promise((_resolve, _reject) => {
                setTimeout(() => {
                    try {
                        let _x = _onRejected();

                        _resolvePromise(_promise, _x, _resolve, _reject);
                    }catch (_e) {
                        return _reject(_e);
                    }
                })
            });
        }

        if (this.status === PENDING) {
            return _promise = new Promise((_resolve, _reject) => {
                this.callbacks.push({
                    onFulfilled (_value) {
                        try {
                            const _x = _onFulfilled(_value); // _x 可能为一个 thenable
                            
                            _resolvePromise(_promise, _x, _resolve, _reject);
                        } catch (_e) {
                            return _reject(_e);
                        }
                    },

                    onRejected (_reason) {
                        try {
                            const _x = _onRejected(_reason); // _x 可能为一个 thenable
                            
                            _resolvePromise(_promise, _x, _resolve, _reject);
                        } catch (_e) {
                            return _reject(_e);
                        }
                    }
                });
            });
        }
    }

    catch(_onRejected) {
        return this.then(null, _onRejected);
    }

    finally(_fn) {
        // 在 then 中调用 fn 时又进行了一次异步操作，所以它总是最后调用的
        return this.then(_value => {
            setTimeout(_fn);

            return _value;
        }, _reason => {
            setTimeout(_fn);

            throw _reason;
        })
    }

    static resolve(_value) {
        let _promise;

        _promise = new Promise((_resolve, _reject) => {
            _resolvePromise(_promise, _value, _resolve, _reject);
        });

        return _promise;
    }

    static reject(_reason) {
        return new Promise((_, _reject) => _reject(_reason));
    }

    static all(_iterable) {
        if (!Array.isArray(_iterable)) {
            throw new TypeError("Promise.all need Array object as argument");
        }

        return new Promise((_resolve, _reject) => {
            let _resolvedCount = 0,
                _totalCount = _iterable.length,
                _resolvedValues = new Array(_totalCount);

            _iterable.forEach((_promise, _index) => {
                Promise.resolve(_promise).then(_value => {
                    _resolvedCount ++;
                    _resolvedValues[_index] = _value;

                    if (_resolvedCount === _totalCount) {
                        return _resolve(_resolvedValues);
                    }
                }, _reason => _reject(_reason));
            });
        })
    }

    static race(_iterable) {
        if (!Array.isArray(_iterable)) {
            throw new TypeError("Promise.race need Array object as argument");
        }

        return new Promise((_resolve, _reject) => {
            _iterable.forEach(_promise => Promise.resolve(_promise)
                .then(_value => _resolve(_value), _reason => _reject(_reason)));
        })
    }
}