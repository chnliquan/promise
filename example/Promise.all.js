const Promise = require('../src/promise')

// Promise.all(iterable) 方法返回一个 Promise 实例
// 此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调完成（resolve）
// 如果参数中 promise 有一个失败（rejected），此实例回调失败（rejected），失败原因的是第一个失败 promise 的结果
const promise1 = Promise.resolve(3)
const promise2 = 42
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 2000, 'resolved')
})

Promise.all([promise1, promise2, promise3]).then(values => {
  console.log(values)
  // expected output: Array [3, 42, 'resolved']
})

const promise4 = Promise.resolve(3)
const promise5 = 42
const promise6 = new Promise((resolve, reject) => {
  setTimeout(reject, 2000, 'rejected')
})

Promise.all([promise4, promise5, promise6])
  .then(values => {
    console.log(values)
  })
  .catch(reason => {
    console.log('\n')
    console.log(reason)
  })
