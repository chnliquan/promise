const Promise = require('../src/promise')

// Promise.race(iterable) 方法返回一个 promise
// 并伴随着 promise 对象解决的返回值或拒绝的错误原因
// 只要 iterable 中有一个 promise 对象"解决(resolve)"或"拒绝(reject)"
const promise1 = new Promise((_resolve, _reject) => {
  setTimeout(_resolve, 2000, 'one')
})

const promise2 = new Promise((_resolve, _reject) => {
  setTimeout(_resolve, 1000, 'two')
})

Promise.race([promise1, promise2]).then(_value => {
  console.log(_value)
  // Both resolve, but promise2 is faster
})
