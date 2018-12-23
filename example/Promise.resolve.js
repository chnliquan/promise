const Promise = require('../src/promise')

// Promise.resolve(value) 方法返回一个以给定值解析后的 Promise 对象
// 如果这个值是个 thenable（即带有then方法），返回的 promise 会“跟随”这个 thenable 的对象
// 采用它的最终状态（指resolved/rejected/pending/settled）
// 如果传入的 value 本身就是 promise 对象，则该对象作为 Promise.resolve 方法的返回值返回；否则以该值为成功状态返回 promise 对象
const promise1 = Promise.resolve([1, 2, 3])

promise1.then(value => {
  console.log(value)
  // [1, 2, 3]
})

const promise2 = Promise.resolve(new Promise((resolve, reject) => {
  setTimeout(resolve, 2000, 'resolved')
}))

promise2.then(value => {
  console.log('\n')
  console.log(value)
})
