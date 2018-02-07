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

    return Promise;
})();

const promise = new Promise((_resolve, _reject)=>{
    setTimeout(() => {
        _resolve('success');
        _reject('fail');
    }, 2000);
    
    // _resolve('success');

    // throw 'error';
});

promise.then((_value) => {
    console.log(_value);
}, (_e) => {
    console.log(_e);
});