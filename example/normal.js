const Promise = require('../src/promise')

const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, 'promise1---->resolved')
})

promise1.then(value => {
  console.log(value)
  console.log('\n')
}).finally(() => {
  console.log('promise1---->finally')
})

setTimeout(() => {
  promise1.then(value => console.log(value))
}, 2000)


return

const promise2 = new Promise((resovle, reject) => {
  setTimeout(() => {
    reject('promise2---->rejected')
  }, 2000)
})

promise2.then(value => {
  console.log(value)
}).catch(reason => {
  console.log(reason)
  console.log('\n')
}).finally(() => {
  console.log('promise2---->finally')
})
