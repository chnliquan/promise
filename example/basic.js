const Promise = require('../src/promise')

const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, 'promise1---->resolved')
})

promise1
  .then(value => {
    console.log('promise1 resolved: ', value)
  })
  .catch(err => {
    console.log('promise1 rejected: ', err)
  })
  .finally(() => {
    console.log('promise1 finally')
  })

setTimeout(() => {
  promise1.then(value => {
    console.log('promise1 after resolved execute then')
    console.log(value)
  })
}, 2000)

const promise2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('promise2 ---> rejected')
  }, 3000)
})

promise2
  .then(value => {
    console.log('promise2 resolved: ', value)
  })
  .catch(reason => {
    console.log('promise2 rejected: ', reason)
    console.log('\n')
  })
  .finally(() => {
    console.log('promise2 finally')
  })

setTimeout(() => {
  promise2.then(
    () => {},
    value => {
      console.log('promise2 after rejected execute then')
      console.log(value)
    }
  )
}, 4000)
