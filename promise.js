const Promise = (()=>{
    // promise 的三种状态
    const PENDING = 'pending',
          FULFILLED = 'fulfilled',
          REJECTED = 'rejected';

    const Promise = function (_executor) {
        this.status = 'pending'; // 初始状态
        this.data = void 0; // 初始值
        this.callbacks = []; // resolve reject 回调函数集合

        // 成功回调执行函数
        const _resolve = (_value) => {
            // 如果当前状态不是 pending 说明状态已经确定，不能再次改变
            if (this.status !== PENDING) return;

            this.status = FULFILLED;
            this.data = _value;

            // 触发集合中的 onResolved 函数
            for(let i = 0, l = this.callbacks.length; i < l; i++) {
                this.callbacks[i].onResolved(_value);
            }
        };

        // 失败回调执行函数
        const _reject = (_reason) => {
            // 如果当前状态不是 pending 说明状态已经确定，不能再次改变
            if (this.status !== PENDING) return;

            this.status = REJECTED;
            this.data = _reason;

            // 触发集合中的 onRejected 函数
            for(let i = 0, l = this.callbacks.length; i < l; i++) {
                this.callbacks[i].onRejected(_reason);
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
                      _onResolved : function(_value) {return _value};
        _onRejected = typeof _onRejected === 'function' ?
                      _onRejected : function(_reason) {throw _reason};

        if (this.status === FULFILLED) {
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

        if (this.status === REJECTED) {
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

        if (this.status === PENDING) {
            return _promise2 = new Promise((_resolve, _reject) => {
                // 如果当前状态是 pending，此时不能确定调用 onResolved 还是 onRejected
                // 将处理逻辑做为 callback 放入 promise1 的回调函数集合里，当状态确定时触发对应的回调
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
                });
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