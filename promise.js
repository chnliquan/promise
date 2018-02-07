const Promise = (()=>{
    const Promise = function (_executor) {
        this.status = 'pending'; // 初始状态
        this.data = void 0; // 初始值
        this.callbacks = []; // resolve reject 回调函数集合

        // 成功回调 resolve 函数
        const _resolve = (_value) => {
            if (this.status === 'pending') {
                this.status = 'fulfilled';
                this.data = _value;

                // 触发集合中的 resolve 函数
                for(let i = 0, l = this.callbacks.length; i < l; i++) {
                    this.callbacks[i].onResolved(_value);
                }
            }
        };

        // 失败回调 reject 函数
        const _reject = (_reason) => {
            if (this.status === 'pending') {
                this.status = 'rejected';
                this.data = _reason;

                // 触发集合中的 reject 函数
                for(let i = 0, l = this.callbacks.length; i < l; i++) {
                    this.callbacks[i].onRejected(_reason);
                }
            }
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

        _onResolved = typeof _onResolved === 'function' ?
                      _onResolved : function(_value) {};
        _onRejected = typeof _onRejected === 'function' ?
                      _onRejected : function(_reason) {};

        if (this.status === 'fulfilled') {
            return _promise2 = new Promise((_resolve, _reject) => {
                try {
                    const _ret = _onResolved(this.data);

                    if (_ret instanceof Promise) {
                        _ret.then(_resolve, _reject);
                    }else {
                        _resolve(_ret);
                    }
                }catch (_e) {
                    return _reject(_e);
                }
            });
        }

        if (this.status === 'rejected') {
            return _promise2 = new Promise((_resolve, _reject) => {
                try {
                    const _ret = _onRejected(this.data);

                    if (_ret instanceof Promise) {
                        _ret.then(_resolve, _reject);
                    }else {
                        _resolve(_ret);
                    }
                }catch (_e) {
                    return _reject(_e);
                }
            });
        }

        if (this.status === 'pending') {
            return _promise2 = new Promise((_resolve, _reject) => {
                // 如果当前状态 pending 状态，此时不能确定调用 onResolved 还是 onRejected
                // 只能等到 Promise 的状态确定后，才能确实如何处理
                // 所以我们需要把我们的处理逻辑做为 callback 放入 promise1 的回调函数集合里
                this.callbacks.push({
                    onResolved (_value) {
                        try {
                            const _ret = _onResolved(_value);
                            
                            if (_ret instanceof Promise) {
                                _ret.then(_resolve, _reject);
                            }else {
                                _resolve(_ret);
                            }
                        } catch (_e) {
                            return _reject(_e);
                        }
                    },

                    onRejected (_reason) {
                        try {
                            const _ret = _onRejected(_reason);
                            
                            if (_ret instanceof Promise) {
                                _ret.then(_resolve, _reject);
                            }else {
                                _resolve(_ret);
                            }
                        } catch (_e) {
                            return _reject(_e);
                        }
                    }
                })
            });
        } 
    };

    return Promise;
})();

const promise = new Promise((_resolve, _reject)=>{
    setTimeout(() => {
        // _resolve('success');
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