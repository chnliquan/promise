const { PENDING } = require('./const')

// 根据 promises/A+ 标准，执行 promise resolution procedure
// https://promisesaplus.com/
function resolvePromise (promise, x, resolve, reject) {
  let hasBeenCalled = false,
    then

  // 2.3.1
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  // 2.3.2
  if (x instanceof Promise) {
    // 2.3.2.1
    if (x.status === PENDING) {
      x.then(value => resolvePromise(promise, value, resolve, reject), reject)
    } else {
      // 2.3.2.2 && 2.3.2.3
      x.then(resolve, reject)
    }

    return
  }

  // 2.3.3
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 2.3.3.1
    then = x.then

    // 2.3.3.2
    try {
      // 2.3.3.3
      if (typeof then === 'function') {
        // 2.3.3.3.1
        then.call(x, y => { // 2.3.3.3.3
          if (hasBeenCalled) {
            return
          }

          hasBeenCalled = true
          return resolvePromise(promise, y, resolve, reject)
        }, r => { // 2.3.3.3.2
          if (hasBeenCalled) {
            return
          }

          hasBeenCalled = true
          return reject(r)
        })
      } else {
        // 2.3.3.4
        return resolve(x)
      }
    } catch (e) {
      // 2.3.3.3.4
      if (hasBeenCalled) {
        return
      }

      hasBeenCalled = true
      // 2.3.3.4.2
      return reject(e)
    }
  } else {
    // 2.3.4
    return resolve(x)
  }
}

module.exports = resolvePromise
