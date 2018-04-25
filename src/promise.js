/*
 * ------------------------------------------
 * @file     promise实现
 * @version  1.0
 * @author   ender(chnliquan@163.com)
 * ------------------------------------------
 */
const _ = require('./resolve')

class Promise {
  constructor(_executor) {
    this.status = _.PENDING // 初始状态
    this.data = void 0      // 初始值
    this.callbacks = []     // 回调集合

    // 成功回调执行函数
    const _resolve = _value => {
      // Notes 3.1
      setTimeout(() => {
        // 如果状态已经确定则跳出
        if (this.status !== _.PENDING) {
          return
        }

        this.status = _.FULFILLED
        this.data = _value

        // 触发集合中的 onFulfilled 函数
        this.callbacks.forEach(_event => {
          _event.onFulfilled(_value)
        })
      })
    }

    // 失败回调执行函数
    const _reject = _reason => {
      // Notes 3.1
      setTimeout(() => {
        if (this.status !== _.PENDING) {
          return // 如果状态已经确定则跳出
        }

        this.status = _.REJECTED
        this.data = _reason

        // 触发集合中的 onRejected 函数
        this.callbacks.forEach(_event => {
          _event.onRejected(_reason)
        })
      })
    }

    // 防止 executor 函数中发生异常
    try {
      _executor(_resolve, _reject)
    } catch (_e) {
      _reject(_e)
    }
  }

  then(_onFulfilled, _onRejected) {
    let _promise

    // 2.2.1
    _onFulfilled = typeof _onFulfilled === 'function' ?
                   _onFulfilled :
                   _value => _value
    _onRejected = typeof _onRejected === 'function' ?
                  _onRejected :
                  _reason => {
                    throw  _reason
                  }


    if (this.status === _.FULFILLED) {
      return _promise = new Promise((_resolve, _reject) => {
        setTimeout(() => {
            try {
              let _x = _onFulfilled() // _x 可能为一个 thenable

              _resolvePromise(_promise, _x, _resolve, _reject)
            } catch (_e) {
              return _reject(_e)
            }
          }
        )
      })

    }

    if (this.status === _.REJECTED) {
      return _promise = new Promise((_resolve, _reject) => {
        setTimeout(() => {
            try {
              let _x = _onRejected() // _x 可能为一个 thenable

              _resolvePromise(_promise, _x, _resolve, _reject)
            } catch (_e) {
              return _reject(_e)
            }
          }
        )
      })

    }

    if (this.status === _.PENDING) {
      return _promise = new Promise((_resolve, _reject) => {
        // 如果当前状态是 pending，此时不能确定调用 onFulfilled 还是 onRejected
        // 将处理逻辑做为回调函数放入 promise 的 callbacks中，当状态确定时触发对应的回调
        this.callbacks.push({
          onFulfilled(_value) {
            try {
              const _x = _onFulfilled(_value) // _x 可能为一个 thenable

              _resolvePromise(_promise, _x, _resolve, _reject)
            } catch (_e) {
              return _reject(_e)
            }
          },

          onRejected(_reason) {
            try {
              const _x = _onRejected(_reason) // _x 可能为一个 thenable

              _resolvePromise(_promise, _x, _resolve, _reject)
            } catch (_e) {
              return _reject(_e)
            }
          }
        })
      })
    }
  }

  catch(_onRejected) {
    return this.then(null, _onRejected)
  }

  /**
   *  无论是 resolved 还是 rejected 都会执行
   *
   *  @public
   *  @param  {Function}  arg0    - 处理函数
   *  @return {Object}    Promise - Promise 对象
   */
  finally(_fn) {
    // 在 then 中调用 _fn 时又进行了一次异步操作，所以它总是最后调用的
    return this.then(_value => {
        setTimeout(_fn)
        return _value
      }, _reason => {
        setTimeout(_fn)
        throw _reason
      }
    )
  }

  /**
   *  对传入的值进行 resolve
   *
   *  @public
   *  @param  {Variable}  arg0    - 任意值
   *  @return {Object}    Promise - Promise 对象
   */
  static resolve(_value) {
    let _promise

    _promise = new Promise((_resolve, _reject) => {
        _.resolvePromise(_promise, _value, _resolve, _reject)
      }
    )

    return _promise
  }

  /**
   *  对传入的值进行 reject
   *
   *  @public
   *  @param  {Variable}  arg0    - 任意值
   *  @return {Object}    Promise - Promise 对象
   */
  static reject(_reason) {
    return new Promise((_, _reject) => _reject(_reason))
  }

  /**
   *  当所有 promise 都 resolved 时执行 resolve，否则执行 reject
   *
   *  @public
   *  @param  {Array}  arg0    - promise 数组
   *  @return {Object} Promise - Promise 对象
   */
  static all(_iterable) {
    if (!Array.isArray(_iterable)) {
      throw new TypeError("Promise.all need Array object as argument")
    }

    return new Promise((_resolve, _reject) => {
      let _resolvedCount = 0,
        _totalCount = _iterable.length,
        _resolvedValues = new Array(_totalCount)

      _iterable.forEach((_promise, _index) => {
        Promise.resolve(_promise).then(_value => {
          _resolvedCount++
          _resolvedValues[_index] = _value

          if (_resolvedCount === _totalCount) {
            return _resolve(_resolvedValues)
          }
        }, _reason => _reject(_reason))
      })
    })
  }

  /**
   *  当有一个 promise resolved 或者 rejected 就执行相应的状态
   *
   *  @public
   *  @param  {Array}  arg0    - promise 数组
   *  @return {Object} Promise - Promise 对象
   */
  static race(_iterable) {
    if (!Array.isArray(_iterable)) {
      throw new TypeError("Promise.race need Array object as argument")
    }

    return new Promise((_resolve, _reject) => {
      _iterable.forEach(
        _promise => Promise.resolve(_promise)
                           .then(_value => _resolve(_value),
                             _reason => _reject(_reason))
      )
    })
  }
}

module.exports = Promise
