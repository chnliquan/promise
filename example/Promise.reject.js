const Promise = require('../src/promise')

// Promise.reject(reason) 方法返回一个用 reason 拒绝的 Promise
Promise.reject('rejected').then().catch(_reason => console.log(_reason))
