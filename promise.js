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
            _x.then((_value) => {
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
                _then.call(_x, (_y) => { // 2.3.3.3.1
                    // 2.3.3.3.3
                    if (_hasBeenCalled) return;

                    _hasBeenCalled = !0;

                    return _resolvePromise(_promise2, _y, _resolve, _reject);
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
        this.status = PENDING;
        this.data = void 0;
        this.callbacks = [];

        const _resolve = (_value) => {
            setTimeout(() => {
                if (this.status !== PENDING) return;

                this.status = FULFILLED;
                this.data = _value;

                this.callbacks.forEach(_obj => {
                    _obj.onFulfilled(_value);
                })
            })
        };

        const _reject = (_reason) => {
            setTimeout(() => {
                if (this.status !== PENDING) return;

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
        _onFulfilled = typeof _onRejected === 'function' ?
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
                setTimeout(() => {
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
                })
            });
        }
    }
}