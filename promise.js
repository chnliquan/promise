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

    return Promise;
})();