const resolvePromise = require('./promisesA+')
const { PENDING, FULFILLED, REJECTED } = require('./const')

class Promise {
  constructor(executor) {
    this.status = PENDING   // 初始状态
    this.data = void 0      // 初始值
    this.callbacks = []     // 回调集合

    // 成功回调执行函数
    const resolve = value => {
      // Notes 3.1
      setTimeout(() => {
        // 如果状态已经确定则直接跳出
        if (this.status !== PENDING) {
          return
        }

        this.status = FULFILLED
        this.data = value

        // 触发集合中的 onFulfilled 函数
        this.callbacks.forEach(event => {
          event.onFulfilled(value)
        })
      })
    }

    // 失败回调执行函数
    const reject = reason => {
      // Notes 3.1
      setTimeout(() => {
        // 如果状态已经确定则直接跳出
        if (this.status !== PENDING) {
          return
        }

        this.status = REJECTED
        this.data = reason

        // 触发集合中的 onRejected 函数
        this.callbacks.forEach(event => {
          event.onRejected(reason)
        })
      })
    }

    // 防止 executor 函数中发生异常
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then (onFulfilled, onRejected) {
    let promise

    // 2.2.1
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    if (this.status === FULFILLED) {
      return promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // x 可能为一个 thenable
            const x = onFulfilled(this.data)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            return reject(e)
          }
        })
      })
    }

    if (this.status === REJECTED) {
      return promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // x 可能为一个 thenable
            const x = onRejected(this.data)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            return reject(e)
          }
        })
      })
    }

    if (this.status === PENDING) {
      return promise = new Promise((resolve, reject) => {
        // 如果当前状态是 pending，此时不能确定调用 onFulfilled 还是 onRejected
        // 将处理逻辑做为回调函数放入 promise 的 callbacks 中，当状态确定时触发对应的回调
        this.callbacks.push({
          onFulfilled (value) {
            try {
              // x 可能为一个 thenable
              const x = onFulfilled(value)
              resolvePromise(promise, x, resolve, reject)
            } catch (e) {
              return reject(e)
            }
          },

          onRejected (reason) {
            try {
              // x 可能为一个 thenable
              const x = onRejected(reason)

              resolvePromise(promise, x, resolve, reject)
            } catch (e) {
              return reject(e)
            }
          }
        })
      })
    }
  }

  catch (onRejected) {
    return this.then(null, onRejected)
  }

  /**
   * 无论是 resolved 还是 rejected 都会执行
   *
   * @param {Function} fn
   * @returns {Promise}
   */
  finally (fn) {
    // 在 then 中调用 fn 时又进行了一次异步操作，所以它总是最后调用的
    return this.then(value => {
      setTimeout(fn)
      return value
    }, reason => {
      setTimeout(fn)
      throw reason
    })
  }

  /**
   * 对传入的值进行 resolve
   *
   * @param {Any} value
   * @returns {Promise}
   */
  static resolve (value) {
    let promise

    promise = new Promise((resolve, reject) => {
      resolvePromise(promise, value, resolve, reject)
    })

    return promise
  }

  /**
   * 对传入的值进行 reject
   *
   * @param  {Any} reason
   * @returns {Promise}
   */
  static reject (reason) {
    return new Promise((_, reject) => reject(reason))
  }

  /**
   * 当所有 promise 都 resolved 时执行 resolve，否则执行 reject
   *
   * @param {Array} iterable
   * @returns {Promise}
   */
  static all (iterable) {
    if (!Array.isArray(iterable)) {
      throw new TypeError('Promise.all need Array object as argument')
    }

    return new Promise((resolve, reject) => {
      let resolvedCount = 0,
        totalCount = iterable.length,
        resolvedValues = new Array(totalCount)

      iterable.forEach((promise, index) => {
        Promise.resolve(promise).then(value => {
          resolvedCount++
          resolvedValues[index] = value

          if (resolvedCount === totalCount) {
            return resolve(resolvedValues)
          }
        }, reason => reject(reason))
      })
    })
  }

  /**
   * 当有一个 promise resolved 或者 rejected 就执行相应的状态
   *
   * @param	{Array} iterable
   * @returns {Promise}
   */
  static race (iterable) {
    if (!Array.isArray(iterable)) {
      throw new TypeError('Promise.race need Array object as argument')
    }

    return new Promise((resolve, reject) => {
      iterable.forEach(
        promise => Promise.resolve(promise)
          .then(value => resolve(value),
            reason => reject(reason))
      )
    })
  }
}

module.exports = Promise
