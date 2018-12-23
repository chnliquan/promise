const { PENDING } = require('./const')

// 根据 promises/A+ 标准，执行 promise resolution procedure
function _resolvePromise (_promise, _x, _resolve, _reject) {
  let _hasBeenCalled = false,
    _then

  // 2.3.1
  if (_promise === _x) {
    return _reject(new TypeError('Chaining cycle detected for promise!'))
  }

  // 2.3.2
  if (_x instanceof Promise) {
    if (_x.status === PENDING) { // 2.3.2.1
      _x.then(_value => {
        _resolvePromise(_promise, _value, _resolve, _reject)
      }, _reject
      )
    } else { // 2.3.2.2 && 2.3.2.3
      _x.then(_resolve, _reject)
    }

    return
  }

  // 2.3.3
  if (_x !== null &&
    (typeof _x === 'object' ||
      typeof _x === 'function')) {
    _then = _x.then // 2.3.3.1

    // 2.3.3.2
    try {
      // 2.3.3.3
      if (typeof _then === 'function') {
        _then.call(_x, _y => { // 2.3.3.3.1
          // 2.3.3.3.3
          if (_hasBeenCalled) {
            return
          }

          _hasBeenCalled = true
          return _resolvePromise(_promise, _y, _resolve, _reject)
        }, _r => { // 2.3.3.3.2
          if (_hasBeenCalled) {
            return
          }

          _hasBeenCalled = true
          return _reject(_r)
        })
      } else {
        return _resolve(_x) // 2.3.3.4
      }
    } catch (_e) { // 2.3.3.3.4
      if (_hasBeenCalled) {
        return
      }

      _hasBeenCalled = true
      return _reject(_e) // 2.3.3.4.2
    }
  } else {
    return _resolve(_x) // 2.3.4
  }
}


module.exports = resolvePromise
